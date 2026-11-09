/*
 * 姓名：罗亚博 | 学号：8409
 * 时间：2026-11-09 | 大模型：DeepSeek-V4.1-Flash
 * 功能名称：新闻列表页脚本（调 /api/news 取数据，渲染列表、分页与原始 JSON）
 */

(function () {
    'use strict';

    var luoTabs = document.getElementById('luoTabs');
    var luoList = document.getElementById('luoList');
    var luoPager = document.getElementById('luoPager');
    var luoApiUrl = document.getElementById('luoApiUrl');
    var luoApiMeta = document.getElementById('luoApiMeta');
    var luoApiState = document.getElementById('luoApiState');
    var luoCatHint = document.getElementById('luoCatHint');
    var luoRaw = document.getElementById('luoRaw');
    var luoRawHint = document.getElementById('luoRawHint');

    var luoState = { category: '全部', page: 1, pageSize: 8 };
    var luoCategories = [];

    function luoEscape(text) {
        return String(text === undefined || text === null ? '' : text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    /* JSON 语法着色：先转义，再用正则上色 */
    function luoHighlight(jsonText) {
        var luoSafe = luoEscape(jsonText);

        return luoSafe
            .replace(/(&quot;[^&]*?&quot;)(\s*:)/g, '<span class="luo_k">$1</span>$2')
            .replace(/:\s*(&quot;.*?&quot;)/g, ': <span class="luo_s">$1</span>')
            .replace(/:\s*(-?\d+(?:\.\d+)?)/g, ': <span class="luo_n">$1</span>')
            .replace(/:\s*(true|false|null)/g, ': <span class="luo_b">$1</span>');
    }

    function luoBuildUrl() {
        var luoQuery = [];

        if (luoState.category !== '全部') {
            luoQuery.push('category=' + encodeURIComponent(luoState.category));
        }
        luoQuery.push('page=' + luoState.page);
        luoQuery.push('pageSize=' + luoState.pageSize);

        return '/api/news?' + luoQuery.join('&');
    }

    function luoRenderTabs() {
        var luoAll = luoCategories.reduce(function (sum, item) { return sum + item.count; }, 0);
        var luoHtml = '';

        luoHtml += '<button type="button" class="luo_tab' +
            (luoState.category === '全部' ? ' on' : '') +
            '" data-cat="全部">全部<i>' + luoAll + '</i></button>';

        luoCategories.forEach(function (item) {
            luoHtml += '<button type="button" class="luo_tab' +
                (luoState.category === item.name ? ' on' : '') +
                '" data-cat="' + luoEscape(item.name) + '">' +
                luoEscape(item.name) + '<i>' + item.count + '</i></button>';
        });

        luoTabs.innerHTML = luoHtml;
    }

    function luoRenderList(list) {
        if (!list || !list.length) {
            luoList.innerHTML = '<p class="luo_empty">这个分类下还没有新闻。</p>';
            return;
        }

        luoList.innerHTML = list.map(function (row) {
            return '<div class="luo_item">' +
                '<div class="luo_item_head">' +
                (Number(row.is_top) === 1 ? '<span class="luo_badge_top">置顶</span>' : '') +
                '<span class="luo_badge_cat">' + luoEscape(row.category) + '</span>' +
                '<span class="luo_item_title">' + luoEscape(row.title) + '</span>' +
                '</div>' +
                '<p class="luo_item_sum">' + luoEscape(row.summary) + '</p>' +
                '<div class="luo_item_meta">' +
                '<span>作者 ' + luoEscape(row.author) + '</span>' +
                '<span>来源 ' + luoEscape(row.source) + '</span>' +
                '<span>' + luoEscape(row.publish_time) + '</span>' +
                '<span>阅读 ' + Number(row.views).toLocaleString('zh-CN') + '</span>' +
                '<span>id ' + row.id + '</span>' +
                '</div>' +
                '</div>';
        }).join('');
    }

    function luoRenderPager(meta) {
        luoPager.innerHTML =
            '<button type="button" class="luo_page_btn" id="luoPrev"' +
            (meta.page <= 1 ? ' disabled' : '') + '>上一页</button>' +
            '<span class="luo_pager_info">第 ' + meta.page + ' / ' + meta.totalPages +
            ' 页　共 ' + meta.total + ' 条</span>' +
            '<button type="button" class="luo_page_btn" id="luoNext"' +
            (meta.page >= meta.totalPages ? ' disabled' : '') + '>下一页</button>';

        document.getElementById('luoPrev').addEventListener('click', function () {
            if (luoState.page > 1) {
                luoState.page -= 1;
                luoLoad();
            }
        });

        document.getElementById('luoNext').addEventListener('click', function () {
            if (luoState.page < meta.totalPages) {
                luoState.page += 1;
                luoLoad();
            }
        });
    }

    function luoShowRaw(json, sqlText) {
        var luoPretty = JSON.stringify(json, null, 2);
        luoRaw.innerHTML = luoHighlight(luoPretty) +
            '\n\n<span class="luo_k">-- 本次后端执行的 SQL --</span>\n' + luoEscape(sqlText || '');
    }

    function luoLoad() {
        var luoUrl = luoBuildUrl();

        luoApiUrl.textContent = window.location.origin + luoUrl;
        luoApiUrl.href = luoUrl;
        luoApiState.textContent = '请求中…';
        luoList.innerHTML = '<p class="luo_empty">正在从数据库读取…</p>';

        fetch(luoUrl)
            .then(function (res) { return res.json(); })
            .then(function (json) {
                console.log('[luo] /api/news 返回：', json);

                if (json.code !== 0) {
                    throw new Error(json.msg || '接口返回失败');
                }

                var luoData = json.data;

                luoCategories = luoData.categories || [];
                luoApiState.textContent = 'HTTP 200 · ' + luoData.total + ' 条 · ' + luoData.elapsed + ' ms';
                luoApiMeta.textContent = luoData.pageSize + ' 条/页 · 第 ' +
                    luoData.page + '/' + luoData.totalPages + ' 页';
                luoCatHint.textContent = luoData.category;
                luoRawHint.textContent = 'data.list · ' + luoData.list.length + ' 条';

                luoRenderTabs();
                luoRenderList(luoData.list);
                luoRenderPager(luoData);

                if (luoData.page > luoData.totalPages) {
                    luoState.page = 1;
                }

                luoShowRaw(json, luoData.sql);
            })
            .catch(function (err) {
                console.error('[luo] 读取新闻失败：', err.message);
                luoApiState.textContent = '请求失败';
                luoApiMeta.textContent = err.message;
                luoList.innerHTML = '<p class="luo_empty">读取失败：' + luoEscape(err.message) +
                    '<br>请确认后端已启动（run.bat），并且 MySQL 里已有 luo_news 表。</p>';
                luoPager.innerHTML = '';
            });
    }

    luoTabs.addEventListener('click', function (ev) {
        var luoBtn = ev.target.closest('.luo_tab');
        if (!luoBtn) {
            return;
        }

        luoState.category = luoBtn.getAttribute('data-cat');
        luoState.page = 1;

        Array.prototype.forEach.call(luoTabs.querySelectorAll('.luo_tab'), function (el) {
            el.classList.toggle('on', el === luoBtn);
        });

        luoLoad();
        console.log('[luo] 切换分类：', luoState.category);
    });

    luoLoad();
})();
