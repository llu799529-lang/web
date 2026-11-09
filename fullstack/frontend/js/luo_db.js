/*
 * 姓名：罗亚博 | 学号：8409
 * 时间：2026-11-09 | 大模型：DeepSeek-V4.1-Flash
 * 功能名称：数据库连接测试页脚本（调用 /api/db/test，渲染成功或失败结果）
 */

(function () {
    'use strict';

    var luoForm = document.getElementById('luoForm');
    var luoResult = document.getElementById('luoResult');
    var luoTestBtn = document.getElementById('luoTestBtn');
    var luoEnvBtn = document.getElementById('luoEnvBtn');
    var luoClearBtn = document.getElementById('luoClearBtn');
    var luoEnvState = document.getElementById('luoEnvState');
    var luoEnvText = document.getElementById('luoEnvText');
    var luoEnvConfig = null;

    function luoEscape(text) {
        return String(text === undefined || text === null ? '' : text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function luoShowPending(message) {
        luoResult.className = 'luo_result';
        luoResult.innerHTML = luoEscape(message);
    }

    function luoShowOk(data) {
        var luoDbList = (data.databases || []).join('　·　');

        luoResult.className = 'luo_result luo_ok';
        luoResult.innerHTML =
            '<span class="luo_title_s">连接成功</span>' +
            '<div class="luo_kv">' +
            '  <span><i>MySQL 版本</i>' + luoEscape(data.version) + '</span>' +
            '  <span><i>当前用户</i>' + luoEscape(data.currentUser) + '</span>' +
            '  <span><i>耗时</i>' + luoEscape(data.elapsed) + ' ms</span>' +
            '</div>' +
            '<div class="luo_kv">' +
            '  <span><i>目标</i>' + luoEscape(data.host) + ':' + luoEscape(data.port) + '</span>' +
            '  <span><i>库名</i>' + luoEscape(data.database || '（未指定）') + '</span>' +
            '</div>' +
            (data.source === 'env'
                ? '<div class="luo_kv"><span><i>凭据来源</i>backend/.env（密码未下发到浏览器）</span></div>'
                : '') +
            (luoDbList
                ? '<div class="luo_dbs"><i>可见的库</i>：' + luoEscape(luoDbList) + '</div>'
                : '');
    }

    function luoShowError(json) {
        var luoDetail = [];

        if (json.data && json.data.code) {
            luoDetail.push('错误码 ' + json.data.code);
        }
        if (json.data && json.data.errno) {
            luoDetail.push('errno ' + json.data.errno);
        }
        if (json.data && typeof json.data.elapsed === 'number') {
            luoDetail.push('耗时 ' + json.data.elapsed + ' ms');
        }

        luoResult.className = 'luo_result luo_err';
        luoResult.innerHTML =
            '<span class="luo_title_s">连接失败</span>' +
            '<div class="luo_reason">' + luoEscape(json.msg) + '</div>' +
            (luoDetail.length
                ? '<div class="luo_kv"><span><i>诊断</i>' + luoEscape(luoDetail.join('　·　')) + '</span></div>'
                : '');
    }

    function luoCollectBody() {
        return {
            host: document.getElementById('luoHost').value.trim(),
            port: Number(document.getElementById('luoPort').value.trim()) || 3306,
            user: document.getElementById('luoUser').value.trim(),
            password: document.getElementById('luoPassword').value,
            database: document.getElementById('luoDatabase').value.trim()
        };
    }

    /* 统一的测试调用：body 由调用方给，按钮各自忙碌 */
    function luoRunTest(luoBody, luoBtn, luoBusyText) {
        var luoOldText = luoBtn.textContent;

        luoBtn.disabled = true;
        luoBtn.textContent = luoBusyText;
        luoShowPending('正在连接数据库，请稍候…');

        fetch('/api/db/test', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(luoBody)
        })
            .then(function (res) { return res.json(); })
            .then(function (json) {
                console.log('[luo] 连接测试返回：', json);

                if (json.code === 0) {
                    luoShowOk(json.data || {});
                } else {
                    luoShowError(json);
                }
            })
            .catch(function (err) {
                console.error('[luo] 请求 /api/db/test 失败：', err.message);
                luoShowError({
                    msg: '请求后端失败，请确认已运行 run.bat，且服务在 409 端口',
                    data: null
                });
            })
            .finally(function () {
                luoBtn.disabled = false;
                luoBtn.textContent = luoOldText;
            });
    }

    function luoTestConnection() {
        var luoBody = luoCollectBody();

        console.log('[luo] 用手填的账号发起连接测试：', {
            host: luoBody.host,
            port: luoBody.port,
            user: luoBody.user,
            database: luoBody.database
        });

        if (!luoBody.user) {
            luoShowError({ msg: '请填写用户名', data: null });
            return;
        }

        luoRunTest(luoBody, luoTestBtn, '连接中…');
    }

    /* 一键测试：用 backend/.env 里的账号密码，密码不出后端 */
    function luoTestFromEnv() {
        console.log('[luo] 使用 backend/.env 里的凭据测试连接');
        luoRunTest({ fromEnv: true }, luoEnvBtn, '连接中…');
    }

    /* 读取 .env 的配置，用于「填入」按钮与页面顶部状态 */
    function luoLoadEnvInfo() {
        fetch('/api/db/info')
            .then(function (res) { return res.json(); })
            .then(function (json) {
                if (json.code !== 0) {
                    throw new Error(json.msg || '读取失败');
                }

                luoEnvConfig = json.data;
                console.log('[luo] .env 数据库配置：', luoEnvConfig);

                if (luoEnvConfig.connected) {
                    luoEnvState.textContent = '已连接 · MySQL ' + luoEnvConfig.version;
                    luoEnvText.innerHTML =
                        'backend/.env 指向 <code>' + luoEscape(luoEnvConfig.host) + ':' +
                        luoEscape(luoEnvConfig.port) + '</code>，库名 <code>' +
                        luoEscape(luoEnvConfig.database) + '</code>，当前可正常连接。';
                } else {
                    luoEnvState.textContent = '未连接';
                    luoEnvText.innerHTML =
                        'backend/.env 指向 <code>' + luoEscape(luoEnvConfig.host) + ':' +
                        luoEscape(luoEnvConfig.port) + '</code>，但目前连不上：' +
                        luoEscape(luoEnvConfig.error || '未知原因');
                }
            })
            .catch(function (err) {
                console.error('[luo] 读取 /api/db/info 失败：', err.message);
                luoEnvState.textContent = '后端未启动';
                luoEnvText.textContent = '读不到配置，请先运行根目录的 run.bat，再刷新本页。';
            });
    }

    luoTestBtn.addEventListener('click', luoTestConnection);

    luoForm.addEventListener('submit', function (ev) {
        ev.preventDefault();
        luoTestConnection();
    });

    luoEnvBtn.addEventListener('click', luoTestFromEnv);

    luoClearBtn.addEventListener('click', function () {
        luoShowPending('还没有测试。最省事的是点「一键测试 .env 里的连接」。');
    });

    luoLoadEnvInfo();
})();
