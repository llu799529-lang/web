/*
 * 姓名：罗亚博 | 学号：8409
 * 时间：2026-11-12 | 大模型：DeepSeek-V4.1-Flash
 * 功能名称：AI 聊天（会话/消息持久化 + 上下文压缩 + 代理 LLM）
 */

const https = require('https');
const { URL } = require('url');
const luoDb = require('../config/luo_db');

const LUO_TIMEOUT_MS = 60000;
const LUO_KEEP_RECENT = 12;          /* 保留最近 12 条原文 */
const LUO_SUMMARY_MAX = 300;         /* 摘要最多 300 字 */

function luoEstimateTokens(text) {
    return Math.max(1, Math.ceil(String(text || '').length / 1.6));
}

/* 把过早的历史压成一段摘要，避免上下文无限增长 */
function luoCompress(messages) {
    if (messages.length <= LUO_KEEP_RECENT) {
        return { messages: messages, compressed: 0, summary: '' };
    }

    var luoEarly = messages.slice(0, messages.length - LUO_KEEP_RECENT);
    var luoRecent = messages.slice(-LUO_KEEP_RECENT);

    var luoParts = [];
    luoEarly.forEach(function (m) {
        if (m.role === 'system') {
            return;
        }
        var luoWho = m.role === 'user' ? '用户' : '助手';
        luoParts.push(luoWho + '：' + String(m.content).replace(/\s+/g, ' ').slice(0, 40));
    });

    var luoSummary = '此前对话摘要（已压缩）：' + luoParts.join('；');
    if (luoSummary.length > LUO_SUMMARY_MAX) {
        luoSummary = luoSummary.slice(0, LUO_SUMMARY_MAX) + '……';
    }

    var luoOut = [{ role: 'system', content: luoSummary }].concat(luoRecent);

    return { messages: luoOut, compressed: luoEarly.length, summary: luoSummary };
}

/* ---------------- 会话 ---------------- */

async function luoListSessions(req, res) {
    try {
        const [rows] = await luoDb.luoPool.query(
            'SELECT s.id, s.title, ' +
            "DATE_FORMAT(s.created_at, '%m-%d %H:%i') AS created_at, " +
            "DATE_FORMAT(s.updated_at, '%m-%d %H:%i') AS updated_at, " +
            '  (SELECT COUNT(*) FROM luo_chat_message m WHERE m.session_id = s.id) AS msg_count, ' +
            '  (SELECT m2.content FROM luo_chat_message m2 WHERE m2.session_id = s.id ORDER BY m2.id DESC LIMIT 1) AS last_msg ' +
            'FROM luo_chat_session s ORDER BY s.updated_at DESC, s.id DESC'
        );

        const [cnt] = await luoDb.luoPool.query('SELECT COUNT(*) AS n FROM luo_chat_session');

        return res.json({ code: 0, msg: 'ok', data: { total: Number(cnt[0].n) || 0, list: rows } });
    } catch (err) {
        console.error('[luo] 查询会话失败：', err.message);
        return res.json({ code: 5001, msg: '查询会话失败：' + err.message, data: null });
    }
}

async function luoCreateSession(req, res) {
    const luoTitle = String((req.body || {}).title || '').trim() || '新的对话';

    try {
        const [r] = await luoDb.luoPool.query(
            'INSERT INTO luo_chat_session (title, created_at, updated_at) VALUES (?, NOW(), NOW())',
            [luoTitle.slice(0, 80)]
        );

        return res.json({ code: 0, msg: 'ok', data: { id: r.insertId, title: luoTitle.slice(0, 80) } });
    } catch (err) {
        console.error('[luo] 新建会话失败：', err.message);
        return res.json({ code: 5002, msg: '新建会话失败：' + err.message, data: null });
    }
}

async function luoRenameSession(req, res) {
    const luoId = Number(req.params.id);
    const luoTitle = String((req.body || {}).title || '').trim();

    if (!luoId || !luoTitle) {
        return res.json({ code: 4001, msg: '会话 id 和标题都不能为空', data: null });
    }

    try {
        await luoDb.luoPool.query('UPDATE luo_chat_session SET title = ? WHERE id = ?', [luoTitle.slice(0, 80), luoId]);
        return res.json({ code: 0, msg: 'ok', data: { id: luoId, title: luoTitle.slice(0, 80) } });
    } catch (err) {
        return res.json({ code: 5003, msg: '重命名失败：' + err.message, data: null });
    }
}

async function luoDeleteSession(req, res) {
    const luoId = Number(req.params.id);
    if (!luoId) {
        return res.json({ code: 4001, msg: '会话 id 不合法', data: null });
    }

    try {
        await luoDb.luoPool.query('DELETE FROM luo_chat_message WHERE session_id = ?', [luoId]);
        await luoDb.luoPool.query('DELETE FROM luo_chat_session WHERE id = ?', [luoId]);
        return res.json({ code: 0, msg: 'ok', data: { id: luoId } });
    } catch (err) {
        return res.json({ code: 5004, msg: '删除失败：' + err.message, data: null });
    }
}

async function luoListMessages(req, res) {
    const luoId = Number(req.params.id);
    if (!luoId) {
        return res.json({ code: 4001, msg: '会话 id 不合法', data: null });
    }

    try {
        const [rows] = await luoDb.luoPool.query(
            'SELECT id, role, content, tokens, DATE_FORMAT(created_at, \'%Y-%m-%d %H:%i\') AS created_at ' +
            'FROM luo_chat_message WHERE session_id = ? ORDER BY id ASC',
            [luoId]
        );

        return res.json({ code: 0, msg: 'ok', data: { sessionId: luoId, list: rows } });
    } catch (err) {
        return res.json({ code: 5005, msg: '查询消息失败：' + err.message, data: null });
    }
}


/* 用原生 https 发请求：比 fetch 的 keep-alive 连接池稳定，不会卡在旧连接上 */
function luoPostJson(luoUrl, luoPayload, luoApiKey, luoTimeout) {
    return new Promise(function (resolve, reject) {
        const luoTarget = new URL(luoUrl);
        const luoBody = JSON.stringify(luoPayload);

        const luoReq = https.request({
            hostname: luoTarget.hostname,
            port: luoTarget.port || 443,
            path: luoTarget.pathname + luoTarget.search,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(luoBody),
                Authorization: 'Bearer ' + luoApiKey,
                Connection: 'close'
            },
            timeout: luoTimeout
        }, function (luoRes) {
            let luoText = '';
            luoRes.setEncoding('utf8');
            luoRes.on('data', function (chunk) { luoText += chunk; });
            luoRes.on('end', function () {
                resolve({ status: luoRes.statusCode, text: luoText });
            });
        });

        luoReq.on('timeout', function () {
            luoReq.destroy(new Error('TIMEOUT'));
        });
        luoReq.on('error', reject);
        luoReq.write(luoBody);
        luoReq.end();
    });
}

/* ---------------- 对话 ---------------- */

function luoErrorText(status, body) {
    if (status === 401) {
        return 'API Key 无效或已失效，请检查 backend/.env 里的 LLM_API_KEY';
    }
    if (status === 402) {
        return '账户余额不足，免费额度可能已用完';
    }
    if (status === 429) {
        return '请求太频繁或触发限流，稍后再试';
    }
    if (body && body.message) {
        return 'LLM 接口返回错误：' + body.message;
    }
    return 'LLM 接口返回 HTTP ' + status;
}

async function luoChat(req, res) {
    const luoBody = req.body || {};
    const luoSessionId = Number(luoBody.sessionId) || 0;
    const luoMessages = Array.isArray(luoBody.messages) ? luoBody.messages : [];

    if (!luoMessages.length) {
        return res.json({ code: 4001, msg: 'messages 不能为空', data: null });
    }

    const luoApiKey = process.env.LLM_API_KEY || '';
    if (!luoApiKey) {
        return res.json({ code: 4002, msg: '后端没有配置 LLM_API_KEY，请在 backend/.env 里补上', data: null });
    }

    const luoLastUser = luoMessages.filter(function (m) { return m.role === 'user'; }).pop();
    if (!luoLastUser) {
        return res.json({ code: 4003, msg: '缺少 user 消息', data: null });
    }

    /* 上下文压缩：只把最近若干条原文发给模型，更早的压成一段摘要 */
    const luoPacked = luoCompress(luoMessages);

    const luoPayload = {
        model: process.env.LLM_MODEL || 'deepseek-ai/DeepSeek-V4-Flash',
        messages: luoPacked.messages,
        stream: false,
        temperature: typeof luoBody.temperature === 'number' ? luoBody.temperature : 0.7,
        max_tokens: typeof luoBody.maxTokens === 'number' ? luoBody.maxTokens : 1024
    };

    console.log('\n[luo][LLM 请求] ' + new Date().toLocaleString('zh-CN') + '　会话 #' + luoSessionId);
    console.log('  原始消息 ' + luoMessages.length + ' 条，压缩掉 ' + luoPacked.compressed + ' 条，实际发送 ' + luoPacked.messages.length + ' 条');
    luoPacked.messages.forEach(function (m, i) {
        console.log('  #' + (i + 1) + ' ' + m.role + '：' + String(m.content).slice(0, 200));
    });
    console.log('  完整请求体：' + JSON.stringify(luoPayload));

    const luoStartedAt = Date.now();
    const luoController = new AbortController();
    const luoTimer = setTimeout(function () { luoController.abort(); }, LUO_TIMEOUT_MS);

    try {
        /* 先把用户这句话落库 */
        if (luoSessionId) {
            await luoDb.luoPool.query(
                'INSERT INTO luo_chat_message (session_id, role, content, tokens, created_at) VALUES (?, ?, ?, ?, NOW())',
                [luoSessionId, 'user', luoLastUser.content, luoEstimateTokens(luoLastUser.content)]
            );
        }

        const luoResp = await luoPostJson(
            process.env.LLM_BASE_URL || 'https://api.siliconflow.cn/v1/chat/completions',
            luoPayload,
            luoApiKey,
            LUO_TIMEOUT_MS
        );

        const luoText = luoResp.text;
        let luoJson = null;
        try {
            luoJson = JSON.parse(luoText);
        } catch (e) {
            luoJson = null;
        }

        if (luoResp.status < 200 || luoResp.status >= 300) {
            console.error('[luo][LLM 错误] HTTP ' + luoResp.status + '：' + luoText.slice(0, 300));
            return res.json({
                code: 5003,
                msg: luoErrorText(luoResp.status, luoJson),
                data: { status: luoResp.status, elapsed: Date.now() - luoStartedAt }
            });
        }

        const luoChoice = luoJson && luoJson.choices && luoJson.choices[0];
        const luoReply = luoChoice && luoChoice.message ? luoChoice.message.content : '';

        console.log('[luo][LLM 响应] 耗时 ' + (Date.now() - luoStartedAt) + ' ms');
        console.log('  回复：' + luoReply.slice(0, 300));
        console.log('  用量：' + JSON.stringify(luoJson && luoJson.usage));

        /* 模型回复落库，并更新会话时间 */
        if (luoSessionId) {
            await luoDb.luoPool.query(
                'INSERT INTO luo_chat_message (session_id, role, content, tokens, created_at) VALUES (?, ?, ?, ?, NOW())',
                [luoSessionId, 'assistant', luoReply, luoEstimateTokens(luoReply)]
            );
            await luoDb.luoPool.query('UPDATE luo_chat_session SET updated_at = NOW() WHERE id = ?', [luoSessionId]);
        }

        return res.json({
            code: 0,
            msg: 'ok',
            data: {
                reply: luoReply,
                model: (luoJson && luoJson.model) || luoPayload.model,
                usage: (luoJson && luoJson.usage) || null,
                elapsed: Date.now() - luoStartedAt,
                compressed: luoPacked.compressed,
                sentCount: luoPacked.messages.length,
                summary: luoPacked.summary,
                raw: luoJson
            }
        });
    } catch (luoErr) {
        const luoAborted = (luoErr && luoErr.name === 'AbortError') || (luoErr && luoErr.message === 'TIMEOUT');
        console.error('[luo][LLM 异常] ' + (luoAborted ? '请求超时' : luoErr.message));
        return res.json({
            code: 5004,
            msg: luoAborted ? '请求超时（60 秒），请稍后重试' : ('请求 LLM 失败：' + luoErr.message),
            data: { elapsed: Date.now() - luoStartedAt }
        });
    } finally {
        clearTimeout(luoTimer);
    }
}

module.exports = {
    luoChat: luoChat,
    luoListSessions: luoListSessions,
    luoCreateSession: luoCreateSession,
    luoRenameSession: luoRenameSession,
    luoDeleteSession: luoDeleteSession,
    luoListMessages: luoListMessages
};
