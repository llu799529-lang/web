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
    var luoRows = [];

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

    function luoFetchJson(luoUrl) {
        return fetch(luoUrl)
            .then(function (res) { return res.text(); })
            .then(function (txt) {
                try {
                    return JSON.parse(txt);
                } catch (e) {
                    throw new Error('接口返回的不是 JSON（可能没有后端）');
                }
            });
    }

    function luoApplyPayload(json) {
        var luoData = json.data;

        luoCategories = luoData.categories || [];
        luoRows = luoData.list || [];
        luoApiState.textContent = luoData.staticMode
            ? '静态快照 · 未连后端'
            : 'HTTP 200 · ' + luoData.total + ' 条 · ' + luoData.elapsed + ' ms';
        luoApiMeta.textContent = luoData.pageSize + ' 条/页 · 第 ' +
            luoData.page + '/' + luoData.totalPages + ' 页';
        luoCatHint.textContent = luoData.category;
        luoRawHint.textContent = 'data.list · ' + luoData.list.length + ' 条';

        luoRenderTabs();
        luoRenderList(luoRows);
        luoRenderPager(luoData);
        luoShowRaw(json, luoData.sql);
    }

    function luoLoadSnapshot() {
        luoFetchJson('data/news.json').then(function (snap) {
            var luoAll = snap.data.list;
            var luoPick = luoState.category === '全部'
                ? luoAll
                : luoAll.filter(function (row) { return row.category === luoState.category; });
            var luoStart = (luoState.page - 1) * luoState.pageSize;

            luoApplyPayload({
                code: 0,
                msg: '静态快照',
                data: {
                    total: luoPick.length,
                    page: luoState.page,
                    pageSize: luoState.pageSize,
                    totalPages: Math.max(1, Math.ceil(luoPick.length / luoState.pageSize)),
                    category: luoState.category,
                    list: luoPick.slice(luoStart, luoStart + luoState.pageSize),
                    categories: snap.data.categories,
                    sql: snap.data.sql,
                    elapsed: 0,
                    staticMode: true
                }
            });
            console.log('[luo] 已切换到静态快照');
        }).catch(function (err) {
            luoApiState.textContent = '读取失败';
            luoApiMeta.textContent = err.message;
            luoList.innerHTML = '<p class="luo_empty">读取失败：' + luoEscape(err.message) + '</p>';
        });
    }

    function luoLoad() {
        var luoUrl = luoBuildUrl();

        luoApiUrl.textContent = window.location.origin + luoUrl;
        luoApiUrl.href = luoUrl;
        luoApiState.textContent = '请求中…';

        luoFetchJson(luoUrl)
            .then(function (json) {
                console.log('[luo] 接口返回：', json);
                if (json.code !== 0) {
                    throw new Error(json.msg || '接口返回失败');
                }
                luoApplyPayload(json);
            })
            .catch(function (err) {
                console.warn('[luo] 接口不可用，改用静态快照：', err.message);
                luoLoadSnapshot();
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
