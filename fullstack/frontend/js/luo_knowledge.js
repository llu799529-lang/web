/**
 * 姓名：罗亚博 | 学号：409
 * 建立时间：2026-11-12
 * 大模型：DeepSeek-V4.1-Flash
 * 功能：校园知识库页逻辑（调 /api/knowledge，支持分类、关键词检索、分页与原始 JSON 展示）
 */

(function () {
    'use strict';

    var luoState = { category: '全部', page: 1, pageSize: 8, q: '' };
    var luoRows = [];
    var luoCats = [];

    var luoListEl = document.getElementById('luoList');
    var luoTabsEl = document.getElementById('luoTabs');
    var luoPagerEl = document.getElementById('luoPager');
    var luoApiUrl = document.getElementById('luoApiUrl');
    var luoApiState = document.getElementById('luoApiState');
    var luoApiMeta = document.getElementById('luoApiMeta');
    var luoPortEl = document.getElementById('luoPort');
    var luoCatHint = document.getElementById('luoCatHint');
    var luoRawBox = document.getElementById('luoRawBox');
    var luoRawEl = document.getElementById('luoRaw');
    var luoRawHint = document.getElementById('luoRawHint');
    var luoSearchInput = document.getElementById('luoSearchInput');
    var luoSearchBtn = document.getElementById('luoSearchBtn');
    var luoResetBtn = document.getElementById('luoResetBtn');
    var luoSearchTip = document.getElementById('luoSearchTip');

    function luoEscape(luoStr) {
        return String(luoStr == null ? '' : luoStr)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function luoBuildUrl() {
        var luoParts = ['page=' + luoState.page, 'pageSize=' + luoState.pageSize];
        if (luoState.category && luoState.category !== '全部') {
            luoParts.push('category=' + encodeURIComponent(luoState.category));
        }
        if (luoState.q) {
            luoParts.push('q=' + encodeURIComponent(luoState.q));
        }
        return '/api/knowledge?' + luoParts.join('&');
    }

    function luoRenderTabs() {
        var luoAll = [{ name: '全部', count: luoTabsTotal() }].concat(luoCats);

        luoTabsEl.innerHTML = luoAll.map(function (luoCat) {
            var luoOn = luoCat.name === luoState.category ? ' on' : '';
            return '<button type="button" class="luo_tab' + luoOn + '" data-cat="' + luoEscape(luoCat.name) + '">'
                + luoEscape(luoCat.name)
                + '<i>' + luoCat.count + '</i></button>';
        }).join('');
    }

    function luoTabsTotal() {
        return luoCats.reduce(function (luoSum, luoCat) { return luoSum + luoCat.count; }, 0);
    }

    function luoRenderList(luoData) {
        if (!luoRows.length) {
            luoListEl.innerHTML = '<p class="luo_empty">没有匹配的知识条目，换个关键词试试。</p>';
            return;
        }

        luoListEl.innerHTML = luoRows.map(function (luoRow) {
            var luoTags = String(luoRow.keywords || '').split(',').slice(0, 6).map(function (luoKw) {
                return '<span class="luo_kb_tag">' + luoEscape(luoKw.trim()) + '</span>';
            }).join('');

            var luoScore = (typeof luoRow.score === 'number' && luoRow.score > 0)
                ? '<span class="luo_kb_score">匹配度 ' + luoRow.score + '</span>'
                : '';

            return '<article class="luo_kb">'
                + '<div class="luo_kb_top">'
                +   '<span class="luo_kb_id">#' + luoRow.id + '</span>'
                +   '<span class="luo_kb_cat">' + luoEscape(luoRow.category) + '</span>'
                +   luoScore
                + '</div>'
                + '<h3 class="luo_kb_title">' + luoEscape(luoRow.title) + '</h3>'
                + '<p class="luo_kb_content">' + luoEscape(luoRow.content) + '</p>'
                + '<div class="luo_kb_tags">' + luoTags
                +   '<span class="luo_kb_source">' + luoEscape(luoRow.source) + '　' + luoEscape(luoRow.updated_at || '') + '</span>'
                + '</div>'
                + '</article>';
        }).join('');
    }

    function luoRenderPager(luoData) {
        if (!luoData || luoData.totalPages <= 1) {
            luoPagerEl.innerHTML = '<span class="luo_pager_info">共 ' + (luoData ? luoData.total : 0) + ' 条</span>';
            return;
        }

        luoPagerEl.innerHTML =
            '<button type="button" class="luo_page_btn" data-page="' + (luoData.page - 1) + '"'
            + (luoData.page <= 1 ? ' disabled' : '') + '>上一页</button>'
            + '<span class="luo_pager_info">第 ' + luoData.page + ' / ' + luoData.totalPages + ' 页　共 ' + luoData.total + ' 条</span>'
            + '<button type="button" class="luo_page_btn" data-page="' + (luoData.page + 1) + '"'
            + (luoData.page >= luoData.totalPages ? ' disabled' : '') + '>下一页</button>';
    }

    function luoHighlight(luoJsonText) {
        return luoEscape(luoJsonText)
            .replace(/(&quot;(?:\\.|[^&])*?&quot;)(\s*:)/g, '<span class="j_key">$1</span>$2')
            .replace(/:\s*(&quot;(?:\\.|[^&])*?&quot;)/g, ': <span class="j_str">$1</span>')
            .replace(/:\s*(-?\d+(?:\.\d+)?)/g, ': <span class="j_num">$1</span>')
            .replace(/:\s*(true|false|null)/g, ': <span class="j_bool">$1</span>');
    }

    function luoShowRaw(luoJson, luoSql) {
        luoRawEl.innerHTML = luoHighlight(JSON.stringify(luoJson, null, 2))
            + '\n\n<span class="j_cmt">-- 本次执行的 SQL --</span>\n'
            + luoEscape(luoSql || '（无）');
        luoRawHint.textContent = 'data.list · ' + ((luoJson.data && luoJson.data.list) || []).length + ' 条';
    }

    function luoApply(luoJson) {
        var luoData = luoJson.data;
        luoCats = luoData.categories || [];
        luoRows = luoData.list || [];

        luoApiState.textContent = luoData.staticMode
            ? '静态快照 · 未连后端'
            : 'HTTP 200 · ' + luoData.total + ' 条 · ' + luoData.elapsed + ' ms';
        luoApiMeta.textContent = luoData.pageSize + ' 条/页 · 第 ' + luoData.page + '/' + luoData.totalPages + ' 页';
        luoPortEl.textContent = '端口 ' + (luoData.port || 409);
        luoCatHint.textContent = luoState.q ? ('检索「' + luoState.q + '」') : luoState.category;

        luoRenderTabs();
        luoRenderList(luoData);
        luoRenderPager(luoData);
        luoShowRaw(luoJson, luoData.sql);
    }

    function luoFetchJson(luoUrl) {
        return fetch(luoUrl, { cache: 'no-store' })
            .then(function (luoRes) { return luoRes.text(); })
            .then(function (luoTxt) {
                try {
                    return JSON.parse(luoTxt);
                } catch (e) {
                    throw new Error('接口返回的不是 JSON（可能没有后端）');
                }
            });
    }

    function luoLoadSnapshot() {
        luoFetchJson('data/knowledge.json').then(function (luoSnap) {
            var luoAll = luoSnap.data.list;
            var luoPick = luoAll.filter(function (luoRow) {
                return luoState.category === '全部' || luoRow.category === luoState.category;
            });

            if (luoState.q) {
                luoPick = luoPick.filter(function (luoRow) {
                    var luoTarget = (luoRow.title + luoRow.keywords + luoRow.content).toLowerCase();
                    return luoTarget.indexOf(luoState.q.toLowerCase()) >= 0;
                });
            }

            var luoStart = (luoState.page - 1) * luoState.pageSize;

            luoApply({
                code: 0,
                msg: '静态快照',
                data: {
                    total: luoPick.length,
                    allTotal: luoAll.length,
                    page: luoState.page,
                    pageSize: luoState.pageSize,
                    totalPages: Math.max(1, Math.ceil(luoPick.length / luoState.pageSize)),
                    category: luoState.category,
                    query: luoState.q,
                    port: 409,
                    list: luoPick.slice(luoStart, luoStart + luoState.pageSize),
                    categories: luoSnap.data.categories,
                    sql: luoSnap.data.sql,
                    elapsed: 0,
                    staticMode: true
                }
            });
            console.log('[luo] 知识库已切换到静态快照');
        }).catch(function (luoErr) {
            luoApiState.textContent = '读取失败';
            luoApiMeta.textContent = luoErr.message;
            luoListEl.innerHTML = '<p class="luo_empty">读取失败：' + luoEscape(luoErr.message) + '</p>';
        });
    }

    function luoLoad() {
        var luoUrl = luoBuildUrl();

        luoApiUrl.textContent = window.location.origin + luoUrl;
        luoApiUrl.href = luoUrl;
        luoApiState.textContent = '请求中…';

        luoFetchJson(luoUrl)
            .then(function (luoJson) {
                console.log('[luo] 知识库接口返回：', luoJson);
                if (luoJson.code !== 0) {
                    throw new Error(luoJson.msg || '接口返回失败');
                }
                luoApply(luoJson);
            })
            .catch(function (luoErr) {
                console.warn('[luo] 接口不可用，改用静态快照：', luoErr.message);
                luoLoadSnapshot();
            });
    }

    /* ---------- 交互 ---------- */

    luoTabsEl.addEventListener('click', function (luoEv) {
        var luoBtn = luoEv.target.closest('.luo_tab');
        if (!luoBtn) return;
        luoState.category = luoBtn.getAttribute('data-cat');
        luoState.page = 1;
        luoLoad();
    });

    luoPagerEl.addEventListener('click', function (luoEv) {
        var luoBtn = luoEv.target.closest('.luo_page_btn');
        if (!luoBtn || luoBtn.disabled) return;
        luoState.page = Number(luoBtn.getAttribute('data-page')) || 1;
        luoLoad();
    });

    function luoDoSearch() {
        luoState.q = luoSearchInput.value.trim();
        luoState.page = 1;
        luoSearchTip.textContent = luoState.q
            ? '正在按「' + luoState.q + '」检索，命中的条目会显示匹配度分数。'
            : '不填关键词就列出全部；填了就按关键词打分排序，只留命中的条目。';
        luoLoad();
    }

    luoSearchBtn.addEventListener('click', luoDoSearch);

    luoSearchInput.addEventListener('keydown', function (luoEv) {
        if (luoEv.key === 'Enter') {
            luoEv.preventDefault();
            luoDoSearch();
        }
    });

    luoResetBtn.addEventListener('click', function () {
        luoSearchInput.value = '';
        luoState.q = '';
        luoState.category = '全部';
        luoState.page = 1;
        luoSearchTip.textContent = '不填关键词就列出全部；填了就按关键词打分排序，只留命中的条目。';
        luoLoad();
    });

    console.log('[luo] 校园知识库页就绪，服务端口 409，数据表 luo_knowledge');
    luoLoad();
})();
