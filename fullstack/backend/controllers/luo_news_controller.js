/*
 * 姓名：罗亚博 | 学号：8409
 * 时间：2026-11-09 | 大模型：DeepSeek-V4.1-Flash
 * 功能名称：新闻列表控制器（分页 + 分类筛选，数据来自 luo_news 表）
 */

const luoDb = require('../config/luo_db');

/* 分类白名单，防止随便传值 */
const LUO_CATEGORIES = ['校园', '通知', '学术', '活动', '就业'];

/*
 * GET /api/news?category=校园&page=1&pageSize=8
 * 返回：{ code, msg, data: { total, page, pageSize, totalPages, category, list, categories, sql } }
 */
async function luoListNews(req, res) {
    const luoCategory = String(req.query.category || '').trim();
    const luoPage = Math.max(1, parseInt(req.query.page, 10) || 1);
    const luoPageSize = Math.min(50, Math.max(1, parseInt(req.query.pageSize, 10) || 8));
    const luoOffset = (luoPage - 1) * luoPageSize;

    if (luoCategory && luoCategory !== '全部' && LUO_CATEGORIES.indexOf(luoCategory) === -1) {
        return res.json({ code: 4001, msg: '分类不存在：' + luoCategory, data: null });
    }

    const luoFiltered = luoCategory && luoCategory !== '全部';
    const luoWhere = luoFiltered ? ' WHERE category = ?' : '';
    const luoWhereParams = luoFiltered ? [luoCategory] : [];

    /* 拼一份可读的 SQL，前端要把它显示出来 */
    const luoSqlText = 'SELECT id, title, category, author, source, summary, views, is_top,\n' +
        "       DATE_FORMAT(publish_time, '%Y-%m-%d %H:%i') AS publish_time\n" +
        'FROM luo_news' + (luoFiltered ? " WHERE category = '" + luoCategory + "'" : '') + '\n' +
        'ORDER BY is_top DESC, publish_time DESC\n' +
        'LIMIT ' + luoPageSize + ' OFFSET ' + luoOffset + ';';

    try {
        const luoStartedAt = Date.now();

        const [luoCountRows] = await luoDb.luoPool.query(
            'SELECT COUNT(*) AS total FROM luo_news' + luoWhere,
            luoWhereParams
        );
        const luoTotal = Number(luoCountRows[0].total) || 0;

        const [luoRows] = await luoDb.luoPool.query(
            'SELECT id, title, category, author, source, summary, views, is_top, ' +
            "DATE_FORMAT(publish_time, '%Y-%m-%d %H:%i') AS publish_time " +
            'FROM luo_news' + luoWhere + ' ORDER BY is_top DESC, publish_time DESC LIMIT ? OFFSET ?',
            luoWhereParams.concat([luoPageSize, luoOffset])
        );

        const [luoCatRows] = await luoDb.luoPool.query(
            'SELECT category, COUNT(*) AS n FROM luo_news GROUP BY category ORDER BY n DESC, category ASC'
        );

        const luoCategories = luoCatRows.map(function (row) {
            return { name: row.category, count: Number(row.n) };
        });

        return res.json({
            code: 0,
            msg: 'ok',
            data: {
                total: luoTotal,
                page: luoPage,
                pageSize: luoPageSize,
                totalPages: Math.max(1, Math.ceil(luoTotal / luoPageSize)),
                category: luoFiltered ? luoCategory : '全部',
                list: luoRows,
                categories: luoCategories,
                sql: luoSqlText,
                elapsed: Date.now() - luoStartedAt
            }
        });
    } catch (luoErr) {
        console.error('[luo] 查询新闻失败：', luoErr.code, luoErr.message);
        return res.status(500).json({
            code: 500,
            msg: '查询新闻失败：' + (luoErr.message || '未知错误'),
            data: null
        });
    }
}

module.exports = {
    luoListNews: luoListNews
};
