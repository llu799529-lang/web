/*
 * 姓名：罗亚博 | 学号：409
 * 时间：2026-11-09 | 大模型：DeepSeek-V4.1-Flash
 * 功能名称：项目首页脚本（页脚年份、导航条目计数、后端健康检查）
 */

(function () {
    'use strict';

    /* 页面卡片计数；新增页面时只在 HTML 里加一张 .luo_card */
    var luoNav = document.getElementById('luoNav');
    var luoCount = document.getElementById('luoCount');

    if (luoNav && luoCount) {
        var luoCards = luoNav.querySelectorAll('.luo_card');
        luoCount.textContent = '共 ' + luoCards.length + ' 个';
    }

    /* 运行状态：后端是否在跑、数据库是否连得上 */
    var luoDotApi = document.getElementById('luoDotApi');
    var luoApiText = document.getElementById('luoApiText');
    var luoDotDb = document.getElementById('luoDotDb');
    var luoDbText = document.getElementById('luoDbText');
    var luoStatusHint = document.getElementById('luoStatusHint');

    function luoSetState(dot, textNode, ok, message) {
        if (!dot || !textNode) {
            return;
        }
        dot.className = 'luo_dot ' + (ok ? 'luo_on' : 'luo_off');
        textNode.textContent = message;
    }

    fetch('/api/health')
        .then(function (res) { return res.json(); })
        .then(function (json) {
            console.log('[luo] 后端健康检查：', json);
            luoSetState(luoDotApi, luoApiText, json.code === 0,
                json.code === 0 ? '运行中 · 前端由 409 端口提供' : '异常');
            if (luoStatusHint) {
                luoStatusHint.textContent = '已连上后端';
            }
        })
        .catch(function (err) {
            console.error('[luo] 后端未就绪，请先运行 run.bat：', err.message);
            luoSetState(luoDotApi, luoApiText, false, '未启动 · 请先运行 run.bat');
            luoSetState(luoDotDb, luoDbText, false, '无法检测');
            if (luoStatusHint) {
                luoStatusHint.textContent = '后端未启动';
            }
        });

    fetch('/api/db/info')
        .then(function (res) { return res.json(); })
        .then(function (json) {
            console.log('[luo] 数据库状态：', json);
            var luoData = json.data || {};
            if (luoData.connected) {
                luoSetState(luoDotDb, luoDbText, true,
                    '已连接 · MySQL ' + luoData.version + ' · ' + luoData.database);
            } else {
                luoSetState(luoDotDb, luoDbText, false, luoData.error || '连接失败');
            }
        })
        .catch(function (err) {
            console.error('[luo] 读取数据库状态失败：', err.message);
        });
})();
