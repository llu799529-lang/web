/*
 * 姓名：罗亚博 | 学号：8409
 * 时间：2026-11-12 | 大模型：DeepSeek-V4.1-Flash
 * 功能名称：AI 聊天页脚本（会话列表、历史加载、上下文发送、中断、控制台留证）
 */

(function () {
    'use strict';

    var luoSessionsEl = document.getElementById('luoSessions');
    var luoMsgs = document.getElementById('luoMsgs');
    var luoInput = document.getElementById('luoInput');
    var luoSendBtn = document.getElementById('luoSendBtn');
    var luoStopBtn = document.getElementById('luoStopBtn');
    var luoNewBtn = document.getElementById('luoNewBtn');
    var luoChatTitle = document.getElementById('luoChatTitle');
    var luoChatMeta = document.getElementById('luoChatMeta');

    var LUO_SYSTEM = '你是一个有用的中文助手，回答简洁准确；涉及代码时用 Markdown 代码块。';

    var luoSessions = [];
    var luoCurrentId = 0;
    var luoHistory = [];        /* [{role, content}] 当前会话的历史 */
    var luoBusy = false;
    var luoAbort = null;
    var luoOpenToken = 0;

    function luoEscape(text) {
        return String(text === undefined || text === null ? '' : text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    /* 极简 Markdown：代码块、行内代码、加粗 */
    function luoFormat(text) {
        var s = luoEscape(text);

        s = s.replace(/```[a-zA-Z]*\n?([\s\S]*?)```/g, function (all, code) {
            return '<pre>' + code.replace(/\n$/, '') + '</pre>';
        });
        s = s.replace(/`([^`\n]+)`/g, '<code>$1</code>');
        s = s.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');

        return s;
    }

    function luoTime() {
        var d = new Date();
        return ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
    }

    function luoApi(url, options) {
        return fetch(url, options)
            .then(function (r) { return r.text(); })
            .then(function (txt) {
                try {
                    return JSON.parse(txt);
                } catch (e) {
                    throw new Error('接口返回的不是 JSON（线上没有后端时会出现）');
                }
            });
    }

    /* ---------------- 渲染 ---------------- */

    function luoScroll() {
        luoMsgs.scrollTop = luoMsgs.scrollHeight;
    }

    function luoBubble(role, text, time) {
        var luoIsMe = role === 'user';
        var wrap = document.createElement('div');
        wrap.className = 'luo_msg' + (luoIsMe ? ' luo_me' : '') + (role === 'err' ? ' luo_err' : '');

        var avatar = document.createElement('div');
        avatar.className = 'luo_avatar';
        avatar.textContent = luoIsMe ? '我' : 'AI';

        var bubble = document.createElement('div');
        bubble.className = 'luo_bubble';
        bubble.innerHTML = luoFormat(text) +
            '<div class="luo_time">' + luoEscape(time || luoTime()) + '</div>';

        wrap.appendChild(avatar);
        wrap.appendChild(bubble);
        luoMsgs.appendChild(wrap);
        luoScroll();

        return wrap;
    }

    function luoTyping() {
        var wrap = document.createElement('div');
        wrap.className = 'luo_msg';
        wrap.innerHTML = '<div class="luo_avatar">AI</div>' +
            '<div class="luo_bubble"><span class="luo_typing"><i></i><i></i><i></i></span></div>';
        luoMsgs.appendChild(wrap);
        luoScroll();
        return wrap;
    }

    function luoRenderSessions() {
        if (!luoSessions.length) {
            luoSessionsEl.innerHTML = '<p class="luo_side_empty">还没有会话，点右上角新建</p>';
            return;
        }

        luoSessionsEl.innerHTML = luoSessions.map(function (s) {
            return '<div class="luo_session' + (s.id === luoCurrentId ? ' on' : '') +
                '" data-id="' + s.id + '">' +
                '<b title="' + luoEscape(s.title) + '">' + luoEscape(s.title) + '</b>' +
                '<i>' + s.msg_count + ' 条 · ' + luoEscape(String(s.updated_at).slice(5, 16)) + '</i>' +
                '<button type="button" class="luo_del" data-del="' + s.id + '" title="删除会话">×</button>' +
                '</div>';
        }).join('');
    }

    /* ---------------- 数据 ---------------- */

    function luoLoadSessions(luoSelectId) {
        return luoApi('/api/chat/sessions')
            .then(function (json) {
                if (json.code !== 0) {
                    throw new Error(json.msg);
                }
                luoSessions = json.data.list || [];
                console.log('[luo] 会话列表：', luoSessions);

                if (luoSelectId) {
                    luoCurrentId = luoSelectId;
                } else if (!luoCurrentId && luoSessions.length) {
                    luoCurrentId = luoSessions[0].id;
                }

                luoRenderSessions();

                if (luoCurrentId) {
                    return luoOpenSession(luoCurrentId);
                }
                luoChatTitle.textContent = '还没有会话';
                luoMsgs.innerHTML = '';
                return null;
            })
            .catch(function (err) {
                console.error('[luo] 读取会话失败：', err.message);
                luoSessionsEl.innerHTML = '<p class="luo_side_empty">读取失败：' + luoEscape(err.message) + '</p>';
            });
    }

    function luoOpenSession(id) {
        var luoToken = ++luoOpenToken;

        return luoApi('/api/chat/sessions/' + id + '/messages')
            .then(function (json) {
                if (luoToken !== luoOpenToken) {
                    return null;   /* 期间切换了会话，丢弃这次旧响应 */
                }
                if (json.code !== 0) {
                    throw new Error(json.msg);
                }

                luoCurrentId = id;
                var list = json.data.list || [];
                luoHistory = list.map(function (m) { return { role: m.role, content: m.content }; });

                var session = luoSessions.filter(function (s) { return s.id === id; })[0];
                luoChatTitle.textContent = session ? session.title : ('会话 #' + id);
                luoChatMeta.textContent = list.length + ' 条消息';
                luoMsgs.innerHTML = '';
                list.forEach(function (m) {
                    luoBubble(m.role, m.content, String(m.created_at).slice(11, 16));
                });

                luoRenderSessions();
                console.log('[luo] 打开会话 #' + id + '，历史 ' + list.length + ' 条');
                return list;
            });
    }

    function luoNewSession(title) {
        return luoApi('/api/chat/sessions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: title || '新的对话' })
        }).then(function (json) {
            if (json.code !== 0) {
                throw new Error(json.msg);
            }
            console.log('[luo] 新建会话 #' + json.data.id);
            return luoLoadSessions(json.data.id);
        });
    }

    /* ---------------- 发送 ---------------- */

    function luoSend() {
        if (luoBusy) {
            return;
        }

        var text = luoInput.value.trim();
        if (!text) {
            luoInput.focus();
            return;
        }

        var doSend = luoCurrentId ? Promise.resolve() : luoNewSession(text.slice(0, 20));

        doSend.then(function () {
            luoInput.value = '';
            luoBubble('user', text);
            luoHistory.push({ role: 'user', content: text });

            luoBusy = true;
            luoSendBtn.disabled = true;
            luoSendBtn.textContent = '生成中…';
            luoStopBtn.hidden = false;
            var typing = luoTyping();

            var payload = {
                sessionId: luoCurrentId,
                messages: [{ role: 'system', content: LUO_SYSTEM }].concat(luoHistory)
            };

            /* ① 控制台输出发送给模型的提示词 */
            console.log('%c[luo] 发送给 LLM 的提示词', 'color:#2f6feb;font-weight:600', payload);
            payload.messages.forEach(function (m, i) {
                console.log('  #' + (i + 1) + ' ' + m.role + '：' + String(m.content).slice(0, 160));
            });

            luoAbort = new AbortController();

            luoApi('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                signal: luoAbort.signal
            })
                .then(function (json) {
                    /* ② 控制台输出模型返回的数据 */
                    console.log('%c[luo] 收到的 LLM 数据', 'color:#0b8a5c;font-weight:600', json);

                    if (json.code !== 0) {
                        throw new Error(json.msg || '接口返回失败');
                    }

                    var d = json.data;
                    console.log('  耗时 ' + d.elapsed + ' ms，压缩掉 ' + d.compressed +
                        ' 条历史，实际发送 ' + d.sentCount + ' 条', d.usage || '');

                    luoHistory.push({ role: 'assistant', content: d.reply });
                    luoBubble('assistant', d.reply);
                    luoChatMeta.textContent = luoHistory.length + ' 条消息';
                })
                .catch(function (err) {
                    if (err.name === 'AbortError') {
                        console.warn('[luo] 已中断本次请求');
                        luoBubble('err', '已中断本次请求。');
                    } else {
                        console.error('[luo] 聊天失败：', err.message);
                        luoBubble('err', '请求失败：' + err.message +
                            '\n本地请先运行 start.bat，并确认 backend/.env 的 LLM_API_KEY 有效。');
                    }
                })
                .finally(function () {
                    if (typing.parentNode) {
                        typing.parentNode.removeChild(typing);
                    }
                    luoBusy = false;
                    luoAbort = null;
                    luoSendBtn.disabled = false;
                    luoSendBtn.textContent = '发送';
                    luoStopBtn.hidden = true;
                    luoInput.focus();
                    luoLoadSessions(luoCurrentId);
                });
        }).catch(function (err) {
            console.error('[luo] 新建会话失败：', err.message);
        });
    }

    /* ---------------- 事件 ---------------- */

    luoSendBtn.addEventListener('click', luoSend);

    luoStopBtn.addEventListener('click', function () {
        if (luoAbort) {
            luoAbort.abort();
        }
    });

    luoInput.addEventListener('keydown', function (ev) {
        if (ev.key === 'Enter' && !ev.shiftKey && !ev.isComposing) {
            ev.preventDefault();
            luoSend();
        }
    });

    luoNewBtn.addEventListener('click', function () {
        luoNewSession();
    });

    luoSessionsEl.addEventListener('click', function (ev) {
        var delBtn = ev.target.closest('.luo_del');
        if (delBtn) {
            ev.stopPropagation();
            var delId = Number(delBtn.getAttribute('data-del'));
            if (!confirm('删除这个会话及全部消息？')) {
                return;
            }

            luoApi('/api/chat/sessions/' + delId, { method: 'DELETE' })
                .then(function (json) {
                    console.log('[luo] 删除会话 #' + delId, json);
                    if (delId === luoCurrentId) {
                        luoCurrentId = 0;
                        luoHistory = [];
                        luoMsgs.innerHTML = '';
                    }
                    return luoLoadSessions();
                })
                .catch(function (err) { console.error('[luo] 删除失败：', err.message); });
            return;
        }

        var item = ev.target.closest('.luo_session');
        if (item) {
            luoOpenSession(Number(item.getAttribute('data-id'))).catch(function (err) {
                console.error('[luo] 打开会话失败：', err.message);
            });
        }
    });

    luoSessionsEl.addEventListener('dblclick', function (ev) {
        var item = ev.target.closest('.luo_session');
        if (!item) {
            return;
        }

        var id = Number(item.getAttribute('data-id'));
        var session = luoSessions.filter(function (s) { return s.id === id; })[0];
        var newTitle = prompt('重命名会话', session ? session.title : '');
        if (!newTitle || !newTitle.trim()) {
            return;
        }

        luoApi('/api/chat/sessions/' + id, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: newTitle.trim() })
        }).then(function (json) {
            console.log('[luo] 重命名结果：', json);
            return luoLoadSessions(id);
        }).catch(function (err) { console.error('[luo] 重命名失败：', err.message); });
    });

    console.log('[luo] AI 聊天页就绪。system 提示词：', LUO_SYSTEM);
    luoLoadSessions();
})();
