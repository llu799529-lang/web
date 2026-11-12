/*
 * 姓名：罗亚博 | 学号：8409
 * 时间：2026-11-12 | 大模型：DeepSeek-V4.1-Flash
 * 功能名称：AI 聊天页脚本（调 /api/chat，提示词与返回数据都打印到控制台）
 */

(function () {
    'use strict';

    var luoMsgs = document.getElementById('luoMsgs');
    var luoInput = document.getElementById('luoInput');
    var luoSendBtn = document.getElementById('luoSendBtn');
    var luoClearBtn = document.getElementById('luoClearBtn');

    var LUO_SYSTEM_PROMPT = '你是一个有用的中文助手，回答简洁准确，必要时分点说明。';

    var luoMessages = [{ role: 'system', content: LUO_SYSTEM_PROMPT }];
    var luoBusy = false;

    function luoNow() {
        var d = new Date();
        return ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
    }

    function luoScroll() {
        luoMsgs.scrollTop = luoMsgs.scrollHeight;
    }

    function luoAppend(role, text) {
        var luoIsMe = role === 'user';
        var luoIsErr = role === 'err';

        var luoWrap = document.createElement('div');
        luoWrap.className = 'luo_msg' + (luoIsMe ? ' luo_me' : '') + (luoIsErr ? ' luo_err' : '');

        var luoAvatar = document.createElement('div');
        luoAvatar.className = 'luo_avatar';
        luoAvatar.textContent = luoIsMe ? '我' : 'AI';

        var luoBubble = document.createElement('div');
        luoBubble.className = 'luo_bubble';
        luoBubble.textContent = text;

        var luoTime = document.createElement('div');
        luoTime.className = 'luo_time';
        luoTime.textContent = luoNow();
        luoBubble.appendChild(luoTime);

        luoWrap.appendChild(luoAvatar);
        luoWrap.appendChild(luoBubble);
        luoMsgs.appendChild(luoWrap);
        luoScroll();

        return luoWrap;
    }

    function luoAppendTyping() {
        var luoWrap = document.createElement('div');
        luoWrap.className = 'luo_msg';

        var luoAvatar = document.createElement('div');
        luoAvatar.className = 'luo_avatar';
        luoAvatar.textContent = 'AI';

        var luoBubble = document.createElement('div');
        luoBubble.className = 'luo_bubble';
        luoBubble.innerHTML = '<span class="luo_typing"><i></i><i></i><i></i></span>';

        luoWrap.appendChild(luoAvatar);
        luoWrap.appendChild(luoBubble);
        luoMsgs.appendChild(luoWrap);
        luoScroll();

        return luoWrap;
    }

    function luoWelcome() {
        luoAppend('assistant',
            '你好，我是这个项目里的 AI 助手，背后是硅基流动的 DeepSeek-V4-Flash。\n' +
            '随便问点什么，我发出的提示词和收到的数据都会打印在控制台里。');
    }

    function luoFinish(luoBtn, luoText, luoDisable) {
        luoBtn.disabled = luoDisable;
        if (luoText !== null) {
            luoBtn.textContent = luoText;
        }
    }

    function luoSend() {
        if (luoBusy) {
            return;
        }

        var luoText = luoInput.value.trim();
        if (!luoText) {
            luoInput.focus();
            return;
        }

        luoAppend('user', luoText);
        luoMessages.push({ role: 'user', content: luoText });
        luoInput.value = '';

        luoBusy = true;
        luoFinish(luoSendBtn, '思考中…', true);

        var luoTyping = luoAppendTyping();

        /* ① 控制台输出「发送的提示词」 */
        var luoPayload = { messages: luoMessages.slice() };
        console.log('%c[luo] 发送的提示词（' + new Date().toLocaleTimeString('zh-CN') + '）',
            'color:#2f6feb;font-weight:600', luoPayload);
        console.log('  模型：deepseek-ai/DeepSeek-V4-Flash　消息条数：' + luoMessages.length);
        luoMessages.forEach(function (m, i) {
            console.log('  #' + (i + 1) + ' ' + m.role + '：' + m.content);
        });

        fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(luoPayload)
        })
            .then(function (res) { return res.text(); })
            .then(function (txt) {
                try {
                    return JSON.parse(txt);
                } catch (e) {
                    throw new Error('接口返回的不是 JSON（线上没有后端时会出现这种情况）');
                }
            })
            .then(function (json) {
                /* ② 控制台输出「接收到的数据」 */
                console.log('%c[luo] 接收到的数据', 'color:#0b8a5c;font-weight:600', json);
                if (json.data && json.data.usage) {
                    console.log('  用量：', json.data.usage, '　耗时：' + json.data.elapsed + ' ms');
                }

                if (json.code !== 0) {
                    throw new Error(json.msg || '接口返回失败');
                }

                var luoReply = (json.data && json.data.reply) || '（模型没有返回内容）';
                luoMessages.push({ role: 'assistant', content: luoReply });
                luoAppend('assistant', luoReply);
            })
            .catch(function (err) {
                console.error('[luo] 聊天失败：', err.message);
                luoAppend('err', '请求失败：' + err.message +
                    '。\n本地请先运行根目录的 run.bat，并确认 backend/.env 里的 LLM_API_KEY 有效。');
            })
            .finally(function () {
                if (luoTyping && luoTyping.parentNode) {
                    luoTyping.parentNode.removeChild(luoTyping);
                }
                luoBusy = false;
                luoFinish(luoSendBtn, '发送', false);
                luoInput.focus();
            });
    }

    luoSendBtn.addEventListener('click', luoSend);

    luoInput.addEventListener('keydown', function (ev) {
        if (ev.key === 'Enter' && !ev.shiftKey && !ev.isComposing) {
            ev.preventDefault();
            luoSend();
        }
    });

    luoClearBtn.addEventListener('click', function () {
        luoMessages = [{ role: 'system', content: LUO_SYSTEM_PROMPT }];
        luoMsgs.innerHTML = '';
        luoWelcome();
        console.log('[luo] 对话已清空，只保留 system 提示词：', LUO_SYSTEM_PROMPT);
        luoInput.focus();
    });

    luoWelcome();
    console.log('[luo] 页面就绪。system 提示词：', LUO_SYSTEM_PROMPT);
})();
