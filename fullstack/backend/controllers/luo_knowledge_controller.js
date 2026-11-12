/**
 * 姓名：罗亚博 | 学号：409
 * 建立时间：2026-11-12
 * 大模型：DeepSeek-V4.1-Flash
 * 功能：校园知识库的列表查询与关键词检索（检索结果供 AI 聊天注入 system 提示词）
 */

const luoDb = require('../config/luo_db');

const LUO_CATEGORIES = ['校园服务', '教务', '网络', '生活', '就业', '奖助', '实验'];

/* 取中文/英文/数字的二元组，用于粗粒度匹配（不依赖分词服务） */
function luoBigrams(luoText) {
    const luoClean = String(luoText || '')
        .replace(/[^\u4e00-\u9fa5A-Za-z0-9]/g, '')
        .toLowerCase();
    const luoSet = new Set();
    for (let luoI = 0; luoI < luoClean.length - 1; luoI++) {
        luoSet.add(luoClean.slice(luoI, luoI + 2));
    }
    return luoSet;
}

/* 给一条知识打分：关键词命中权重最高，标题二元组命中次之 */
function luoScoreRow(luoRow, luoQuestion, luoQuestionBi) {
    const luoQ = String(luoQuestion || '');
    const luoMatched = [];
    let luoScore = 0;

    String(luoRow.keywords || '').split(',').forEach(function (luoKw) {
        const luoWord = luoKw.trim();
        if (!luoWord) return;
        if (luoQ.indexOf(luoWord) >= 0) {
            luoScore += 3 + Math.min(luoWord.length, 4) * 0.5;
            luoMatched.push(luoWord);
        }
    });

    let luoTitleHit = 0;
    luoBigrams(luoRow.title).forEach(function (luoBi) {
        if (luoQuestionBi.has(luoBi)) luoTitleHit += 1;
    });
    if (luoTitleHit > 0) {
        luoScore += luoTitleHit * 0.6;
        luoMatched.push('标题匹配×' + luoTitleHit);
    }

    if (luoQ.indexOf(luoRow.category) >= 0) {
        luoScore += 1.5;
        luoMatched.push(luoRow.category);
    }

    return { score: Number(luoScore.toFixed(2)), matched: luoMatched };
}

/* 检索：返回得分大于阈值的 Top N 片段 */
function luoSearchKnowledge(luoQuestion, luoRows, luoLimit) {
    const luoQuestionBi = luoBigrams(luoQuestion);
    const luoHits = [];

    luoRows.forEach(function (luoRow) {
        const luoRes = luoScoreRow(luoRow, luoQuestion, luoQuestionBi);
        if (luoRes.score > 0) {
            luoHits.push({
                id: luoRow.id,
                title: luoRow.title,
                category: luoRow.category,
                source: luoRow.source,
                content: luoRow.content,
                keywords: luoRow.keywords,
                score: luoRes.score,
                matched: luoRes.matched
            });
        }
    });

    luoHits.sort(function (luoA, luoB) { return luoB.score - luoA.score; });
    return luoHits.slice(0, luoLimit || 3);
}

/* 拼装注入 system 提示词的资料段落 */
function luoBuildKnowledgePrompt(luoHits) {
    if (!luoHits || !luoHits.length) return '';

    const luoLines = luoHits.map(function (luoHit, luoIdx) {
        return '[' + (luoIdx + 1) + '] ' + luoHit.title + '（来源：' + luoHit.source + '）\n' + luoHit.content;
    });

    return '以下是校园知识库中与问题相关的资料，请优先依据这些资料回答；'
        + '资料没有覆盖的部分，可以基于常识回答，但要说明「资料中没有明确说明」。\n\n'
        + luoLines.join('\n\n');
}

/* GET /api/knowledge —— 列表 / 搜索 / 分类筛选 */
async function luoListKnowledge(req, res) {
    const luoStartedAt = Date.now();
    const luoQuery = String(req.query.q || '').trim();
    const luoCategory = String(req.query.category || '全部').trim();
    const luoPage = Math.max(1, Number(req.query.page) || 1);
    const luoPageSize = Math.min(50, Math.max(1, Number(req.query.pageSize) || 8));

    if (luoCategory !== '全部' && LUO_CATEGORIES.indexOf(luoCategory) === -1) {
        return res.json({ code: 4001, msg: '分类不存在：' + luoCategory, data: null });
    }

    try {
        const [luoAllRows] = await luoDb.luoPool.query(
            'SELECT id, title, category, keywords, content, source, ' +
            "       DATE_FORMAT(updated_at, '%Y-%m-%d %H:%i') AS updated_at " +
            'FROM luo_knowledge ORDER BY id ASC'
        );

        const [luoCatRows] = await luoDb.luoPool.query(
            'SELECT category, COUNT(*) AS n FROM luo_knowledge GROUP BY category ORDER BY n DESC, category ASC'
        );

        /* 先按分类过滤，再按关键词打分排序 */
        let luoPicked = luoAllRows.filter(function (luoRow) {
            return luoCategory === '全部' || luoRow.category === luoCategory;
        });

        if (luoQuery) {
            const luoBi = luoBigrams(luoQuery);
            luoPicked = luoPicked
                .map(function (luoRow) {
                    const luoRes = luoScoreRow(luoRow, luoQuery, luoBi);
                    return Object.assign({}, luoRow, { score: luoRes.score, matched: luoRes.matched });
                })
                .filter(function (luoRow) { return luoRow.score > 0; })
                .sort(function (luoA, luoB) { return luoB.score - luoA.score; });
        }

        const luoTotal = luoPicked.length;
        const luoTotalPages = Math.max(1, Math.ceil(luoTotal / luoPageSize));
        const luoStart = (luoPage - 1) * luoPageSize;
        const luoList = luoPicked.slice(luoStart, luoStart + luoPageSize);

        const luoSqlText = luoQuery
            ? 'SELECT ... FROM luo_knowledge\n-- 关键词打分在 Node 侧完成（中文二元组 + keywords 命中）\n-- 返回 Top ' + luoPageSize + '，本轮命中 ' + luoTotal + ' 条'
            : 'SELECT id, title, category, keywords, content, source,\n'
              + "       DATE_FORMAT(updated_at, '%Y-%m-%d %H:%i') AS updated_at\n"
              + 'FROM luo_knowledge\n'
              + (luoCategory === '全部' ? '' : "WHERE category = '" + luoCategory + "'\n")
              + 'ORDER BY id ASC\nLIMIT ' + luoPageSize + ' OFFSET ' + luoStart + ';';

        return res.json({
            code: 0,
            msg: 'ok',
            data: {
                total: luoTotal,
                allTotal: luoAllRows.length,
                page: luoPage,
                pageSize: luoPageSize,
                totalPages: luoTotalPages,
                category: luoCategory,
                query: luoQuery,
                port: Number(process.env.PORT) || 409,
                list: luoList,
                categories: luoCatRows.map(function (luoRow) {
                    return { name: luoRow.category, count: Number(luoRow.n) };
                }),
                sql: luoSqlText,
                elapsed: Date.now() - luoStartedAt
            }
        });
    } catch (luoErr) {
        console.error('[luo] 查询知识库失败：', luoErr.message);
        return res.json({ code: 5002, msg: '查询知识库失败：' + luoErr.message, data: null });
    }
}

/* GET /api/knowledge/search?q= —— 只返回命中的片段（调试用） */
async function luoSearchApi(req, res) {
    const luoStartedAt = Date.now();
    const luoQuery = String(req.query.q || '').trim();

    if (!luoQuery) {
        return res.json({ code: 4001, msg: '请提供 q 参数', data: null });
    }

    try {
        const [luoRows] = await luoDb.luoPool.query(
            'SELECT id, title, category, keywords, content, source FROM luo_knowledge ORDER BY id ASC'
        );
        const luoHits = luoSearchKnowledge(luoQuery, luoRows, 3);

        return res.json({
            code: 0,
            msg: 'ok',
            data: {
                query: luoQuery,
                hitCount: luoHits.length,
                hits: luoHits,
                elapsed: Date.now() - luoStartedAt
            }
        });
    } catch (luoErr) {
        console.error('[luo] 检索知识库失败：', luoErr.message);
        return res.json({ code: 5002, msg: '检索知识库失败：' + luoErr.message, data: null });
    }
}

module.exports = {
    LUO_CATEGORIES,
    luoListKnowledge,
    luoSearchApi,
    luoSearchKnowledge,
    luoBuildKnowledgePrompt
};
