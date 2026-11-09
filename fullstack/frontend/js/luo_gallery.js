/*
 * 姓名：罗亚博 | 学号：8409
 * 时间：2026-11-09 | 大模型：DeepSeek-V4.1-Flash
 * 功能名称：图片列表页脚本（调 /api/gallery，渲染网格、分类、分页、大图与原始 JSON）
 */

(function () {
    'use strict';

    var luoTabs = document.getElementById('luoTabs');
    var luoGrid = document.getElementById('luoGrid');
    var luoPager = document.getElementById('luoPager');
    var luoApiUrl = document.getElementById('luoApiUrl');
    var luoApiMeta = document.getElementById('luoApiMeta');
    var luoApiState = document.getElementById('luoApiState');
    var luoCatHint = document.getElementById('luoCatHint');
    var luoRaw = document.getElementById('luoRaw');
    var luoRawHint = document.getElementById('luoRawHint');

    var luoLightbox = document.getElementById('luoLightbox');
    var luoLightImg = document.getElementById('luoLightImg');
    var luoLightTitle = document.getElementById('luoLightTitle');
    var luoLightDesc = document.getElementById('luoLightDesc');
    var luoLightClose = document.getElementById('luoLightClose');

    var luoState = { category: '全部', page: 1, pageSize: 9 };
    var luoCategories = [];
    var luoList = [];

    function luoEscape(text) {
        return String(text === undefined || text === null ? '' : text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

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

        return '/api/gallery?' + luoQuery.join('&');
    }

    function luoRenderTabs() {
        var luoAll = luoCategories.reduce(function (sum, item) { return sum + item.count; }, 0);
        var luoHtml = '<button type="button" class="luo_tab' +
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

    function luoRenderGrid(list) {
        if (!list || !list.length) {
            luoGrid.innerHTML = '<p class="luo_empty">这个分类下还没有图片。</p>';
            return;
        }

        luoGrid.innerHTML = list.map(function (row, index) {
            return '<figure class="luo_card_img" data-i="' + index + '" tabindex="0">' +
                '<div class="luo_thumb">' +
                '<img src="' + luoEscape(row.image_url) + '" alt="' + luoEscape(row.title) + '" loading="lazy">' +
                '<span class="luo_cat_on">' + luoEscape(row.category) + '</span>' +
                '</div>' +
                '<figcaption class="luo_cap">' +
                '<div class="luo_cap_head"><b>' + luoEscape(row.title) + '</b>' +
                '<span>' + Number(row.likes).toLocaleString('zh-CN') + ' 赞</span></div>' +
                '<p>' + luoEscape(row.description) + '</p>' +
                '</figcaption>' +
                '</figure>';
        }).join('');

        /* 图片加载失败时做一点降级，避免大片空白 */
        Array.prototype.forEach.call(luoGrid.querySelectorAll('img'), function (img) {
            img.addEventListener('error', function () {
                img.style.opacity = '0.15';
                console.error('[luo] 图片加载失败：', img.getAttribute('src'));
            });
        });
    }

    function luoRenderPager(meta) {
        luoPager.innerHTML =
            '<button type="button" class="luo_page_btn" id="luoPrev"' +
            (meta.page <= 1 ? ' disabled' : '') + '>上一页</button>' +
            '<span class="luo_pager_info">第 ' + meta.page + ' / ' + meta.totalPages +
            ' 页　共 ' + meta.total + ' 张</span>' +
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
        luoRaw.innerHTML = luoHighlight(JSON.stringify(json, null, 2)) +
            '\n\n<span class="luo_k">-- 本次后端执行的 SQL --</span>\n' + luoEscape(sqlText || '');
    }

    function luoOpenLightbox(index) {
        var row = luoList[index];
        if (!row) {
            return;
        }

        luoLightImg.src = row.image_url;
        luoLightImg.alt = row.title;
        luoLightTitle.textContent = row.title + '　·　' + row.category;
        luoLightDesc.textContent = row.description + '　（' + row.created_at + '，' + row.likes + ' 赞）';
        luoLightbox.hidden = false;

        console.log('[luo] 打开大图：', row.title, row.image_url);
    }

    function luoCloseLightbox() {
        luoLightbox.hidden = true;
        luoLightImg.src = '';
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
        luoList = luoData.list || [];
        luoApiState.textContent = luoData.staticMode
            ? '静态快照 · 未连后端'
            : 'HTTP 200 · ' + luoData.total + ' 张 · ' + luoData.elapsed + ' ms';
        luoApiMeta.textContent = luoData.pageSize + ' 张/页 · 第 ' +
            luoData.page + '/' + luoData.totalPages + ' 页';
        luoCatHint.textContent = luoData.category;
        luoRawHint.textContent = 'data.list · ' + luoData.list.length + ' 条';

        luoRenderTabs();
        luoRenderGrid(luoList);
        luoRenderPager(luoData);
        luoShowRaw(json, luoData.sql);
    }

    function luoLoadSnapshot() {
        luoFetchJson('data/gallery.json').then(function (snap) {
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
            luoGrid.innerHTML = '<p class="luo_empty">读取失败：' + luoEscape(err.message) + '</p>';
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
    });

    luoGrid.addEventListener('click', function (ev) {
        var luoCard = ev.target.closest('.luo_card_img');
        if (luoCard) {
            luoOpenLightbox(Number(luoCard.getAttribute('data-i')));
        }
    });

    luoGrid.addEventListener('keydown', function (ev) {
        if (ev.key !== 'Enter' && ev.key !== ' ') {
            return;
        }

        var luoCard = ev.target.closest('.luo_card_img');
        if (luoCard) {
            ev.preventDefault();
            luoOpenLightbox(Number(luoCard.getAttribute('data-i')));
        }
    });

    luoLightClose.addEventListener('click', luoCloseLightbox);

    luoLightbox.addEventListener('click', function (ev) {
        if (ev.target === luoLightbox) {
            luoCloseLightbox();
        }
    });

    document.addEventListener('keydown', function (ev) {
        if (ev.key === 'Escape' && !luoLightbox.hidden) {
            luoCloseLightbox();
        }
    });

    luoLoad();
})();
