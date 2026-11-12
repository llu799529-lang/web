/*
 * 姓名：罗亚博 | 学号：8409
 * 时间：2026-11-12 | 大模型：DeepSeek-V4.1-Flash
 * 功能名称：AI 聊天控制器（代理硅基流动 /v1/chat/completions，密钥只留在后端）
 */

const LUO_TIMEOUT_MS = 60000;

function luoErrorText(luoStatus, luoBody) {
    if (luoStatus === 401) {
        return 'API Key 无效或已失效，请检查 backend/.env 里的 LLM_API_KEY';
    }
    if (luoStatus === 429) {
        return '请求太频繁或免费额度用完了，稍后再试';
    }
    if (luoStatus === 402) {
        return '账户余额不足，免费额度可能已用完';
    }

    if (luoBody && luoBody.message) {
        return 'LLM 接口返回错误：' + luoBody.message;
    }

    return 'LLM 接口返回 HTTP ' + luoStatus;
}

/*
 * POST /api/chat
 * 请求体：{ messages: [{ role, content }], temperature?, maxTokens? }
 * 返回：  { code: 0, msg: 'ok', data: { reply, model, usage, elapsed, raw } }
 */
async function luoChat(req, res) {
    const luoBody = req.body || {};
    const luoMessages = Array.isArray(luoBody.messages) ? luoBody.messages : [];

    if (!luoMessages.length) {
        return res.json({ code: 4001, msg: 'messages 不能为空', data: null });
    }

    const luoApiKey = process.env.LLM_API_KEY || '';
    if (!luoApiKey) {
        return res.json({
            code: 4002,
            msg: '后端没有配置 LLM_API_KEY，请在 backend/.env 里补上',
            data: null
        });
    }

    const luoPayload = {
        model: process.env.LLM_MODEL || 'deepseek-ai/DeepSeek-V4-Flash',
        messages: luoMessages,
        stream: false,
        temperature: typeof luoBody.temperature === 'number' ? luoBody.temperature : 0.7,
        max_tokens: typeof luoBody.maxTokens === 'number' ? luoBody.maxTokens : 1024
    };

    /* 控制台输出「发出去的提示词」 */
    console.log('\n[luo][LLM 请求] ' + new Date().toLocaleString('zh-CN'));
    console.log('  模型：' + luoPayload.model + '　消息数：' + luoMessages.length);
    luoMessages.forEach(function (m, i) {
        console.log('  #' + (i + 1) + ' ' + m.role + '：' + String(m.content).slice(0, 200));
    });
    console.log('  完整请求体：' + JSON.stringify(luoPayload));

    const luoStartedAt = Date.now();
    const luoController = new AbortController();
    const luoTimer = setTimeout(function () { luoController.abort(); }, LUO_TIMEOUT_MS);

    try {
        const luoResp = await fetch(process.env.LLM_BASE_URL || 'https://api.siliconflow.cn/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + luoApiKey
            },
            body: JSON.stringify(luoPayload),
            signal: luoController.signal
        });

        const luoText = await luoResp.text();
        let luoJson = null;
        try {
            luoJson = JSON.parse(luoText);
        } catch (e) {
            luoJson = null;
        }

        if (!luoResp.ok) {
            console.error('[luo][LLM 错误] HTTP ' + luoResp.status + '：' + luoText.slice(0, 300));
            return res.json({
                code: 5003,
                msg: luoErrorText(luoResp.status, luoJson),
                data: { status: luoResp.status, elapsed: Date.now() - luoStartedAt }
            });
        }

        const luoChoice = luoJson && luoJson.choices && luoJson.choices[0];
        const luoReply = luoChoice && luoChoice.message ? luoChoice.message.content : '';

        /* 控制台输出「收到的数据」 */
        console.log('[luo][LLM 响应] 耗时 ' + (Date.now() - luoStartedAt) + ' ms');
        console.log('  回复：' + luoReply.slice(0, 300));
        console.log('  用量：' + JSON.stringify(luoJson && luoJson.usage));
        console.log('  完整响应：' + luoText.slice(0, 1000));

        return res.json({
            code: 0,
            msg: 'ok',
            data: {
                reply: luoReply,
                model: (luoJson && luoJson.model) || luoPayload.model,
                usage: (luoJson && luoJson.usage) || null,
                elapsed: Date.now() - luoStartedAt,
                raw: luoJson
            }
        });
    } catch (luoErr) {
        const luoAborted = luoErr && luoErr.name === 'AbortError';
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
    luoChat: luoChat
};
