# -*- coding: utf-8 -*-
import io

BASE = 'C:/Users/Administrator/DeskBox/DeskBox/web/10/22/'

CSS = """
/* ================= 交互层 ================= */
button{font:inherit;color:inherit;background:none;border:0;padding:0;cursor:pointer}
.tab,.chip,.pl-item,.quick-a,.promo-col,.uc-mail,.p-play,.p-list,.search,.pl-tools>*,.uc-name,.uc-avatar{cursor:pointer}
.tab:active,.chip:active,.pl-item:active,.quick-a:active,.promo-col:active,.p-play:active,.p-list:active,
.search:active,.pl-tools>:active,.uc-name:active{opacity:.62}

/* 占位子页面 */
.view{position:absolute;left:0;right:0;top:30px;bottom:117px;background:var(--bg);z-index:6;
  transform:translateX(100%);transition:transform .32s cubic-bezier(.32,.72,0,1);
  display:flex;flex-direction:column;will-change:transform}
.view.show{transform:none}
.vhead{height:54px;flex:none;display:flex;align-items:center;gap:12px;padding:0 20px}
.vback{width:34px;height:34px;border-radius:50%;background:rgba(0,0,0,.05);display:flex;align-items:center;
  justify-content:center;color:#333;font-size:15px;transition:background .15s}
.vback:active{background:rgba(0,0,0,.11)}
.vtitle{font-size:20px;font-weight:600;letter-spacing:.3px}
.vbody{flex:1;display:flex;align-items:center;justify-content:center;padding-bottom:70px}
.vempty{text-align:center}
.vico{display:flex;align-items:center;justify-content:center;width:92px;height:92px;border-radius:50%;
  background:#fff;color:#cfcfcf;margin:0 auto 18px;font-size:38px}
.vt1{font-size:16px;color:#8e8e8e}
.vt2{font-size:13px;color:#b0b0b0;margin-top:8px}

/* 侧边抽屉 */
.mask{position:absolute;inset:0;background:rgba(0,0,0,.32);opacity:0;pointer-events:none;transition:opacity .25s;z-index:7}
.mask.show{opacity:1;pointer-events:auto}
.drawer{position:absolute;top:0;right:0;bottom:0;width:296px;background:#fff;z-index:8;
  transform:translateX(100%);transition:transform .32s cubic-bezier(.32,.72,0,1);
  display:flex;flex-direction:column;box-shadow:-8px 0 30px rgba(0,0,0,.07)}
.drawer.show{transform:none}
.dhead{display:flex;align-items:center;gap:12px;padding:64px 22px 20px;border-bottom:1px solid #f2f2f2}
.dava{width:44px;height:44px}
.dinfo b{font-size:17px}
.dinfo span{display:block;font-size:12px;color:#a4a4a4;margin-top:3px}
.ditem{padding:17px 22px;text-align:left;font-size:15.5px;color:#333;border-bottom:1px solid #f7f7f7;width:100%}
.ditem:active{background:#f6f6f6}

/* 轻提示 */
.toast{position:absolute;left:50%;bottom:208px;transform:translate(-50%,10px);background:rgba(28,28,28,.86);
  color:#fff;font-size:14px;padding:9px 18px;border-radius:20px;opacity:0;pointer-events:none;
  transition:opacity .2s,transform .2s;z-index:9;white-space:nowrap;max-width:440px;overflow:hidden}
.toast.show{opacity:1;transform:translate(-50%,0)}

/* 搜索页 */
.sview{position:absolute;inset:0;background:var(--bg);z-index:10;transform:translateY(-101%);
  transition:transform .32s cubic-bezier(.32,.72,0,1);display:flex;flex-direction:column}
.sview.show{transform:none}
.sbar{height:76px;flex:none;display:flex;align-items:center;gap:12px;padding:28px 18px 0}
.sfield{flex:1;height:40px;background:#fff;border-radius:20px;display:flex;align-items:center;gap:8px;padding:0 14px;color:#a8a8a8}
.sfield input{flex:1;border:0;outline:0;background:none;font:inherit;font-size:15px;color:#1a1a1a;min-width:0}
.sfield input::placeholder{color:#b8b8b8}
.scancel{font-size:15px;color:var(--g);padding:6px 4px;flex:none}
.sbody{padding:6px 20px}
.slabel{font-size:13px;color:#9c9c9c;margin:16px 0 12px}
.stags{display:flex;flex-wrap:wrap;gap:10px}
.stag{height:34px;padding:0 15px;border-radius:17px;background:#fff;border:1px solid #ececec;font-size:14px;color:#444;display:flex;align-items:center}
.stag:active{background:#f2f2f2}

/* 状态 */
.chip.on{border-color:#9fe4c6;background:#f0fbf6;color:#25a97a}
.p-play .i-pause{display:none}
.p-play.playing .i-play{display:none}
.p-play.playing .i-pause{display:block}
"""

DOM = """
  <!-- ================= 交互层 ================= -->
  <!-- 占位子页面（点歌单 / 点其他 tab 时从右侧滑入） -->
  <section class="view" id="subView" aria-hidden="true">
    <div class="vhead">
      <button class="vback" type="button" aria-label="返回">%(back)s</button>
      <h2 class="vtitle">标题</h2>
    </div>
    <div class="vbody">
      <div class="vempty">
        <span class="vico">%(empty)s</span>
        <p class="vt1">这里还什么都没有</p>
        <p class="vt2">演示占位页 · 点左上角返回</p>
      </div>
    </div>
  </section>

  <!-- 侧边抽屉 -->
  <div class="mask" id="mask"></div>
  <aside class="drawer" id="drawer" aria-hidden="true">
    <div class="dhead">
      <img class="dava" src="images/avatar.jpg" alt="">
      <div class="dinfo"><b>lemon</b><span>5 个月 VIP · 快领</span></div>
    </div>
    <button class="ditem" type="button">播放设置</button>
    <button class="ditem" type="button">定时关闭</button>
    <button class="ditem" type="button">音质与下载</button>
    <button class="ditem" type="button">关于本页</button>
  </aside>

  <!-- 轻提示 -->
  <div class="toast" id="toast" role="status"></div>

  <!-- 搜索页 -->
  <section class="sview" id="searchView" aria-hidden="true">
    <div class="sbar">
      <div class="sfield">%(search)s<input id="sinput" type="text" placeholder="搜索歌曲、歌手、歌单"></div>
      <button class="scancel" type="button" id="scancel">取消</button>
    </div>
    <div class="sbody">
      <div class="slabel">热门搜索</div>
      <div class="stags">
        <button class="stag" type="button">比我幸福</button>
        <button class="stag" type="button">陈晓东</button>
        <button class="stag" type="button">粤语慢歌</button>
        <button class="stag" type="button">跑步歌单</button>
        <button class="stag" type="button">王力宏</button>
      </div>
    </div>
  </section>
"""

JS = """
<script>
/* ---------------- 交互脚本 ---------------- */
(function(){
  var $ = function(s, r){ return (r || document).querySelector(s) };
  var $$ = function(s, r){ return Array.prototype.slice.call((r || document).querySelectorAll(s)) };

  /* 轻提示 */
  var toastEl = $('#toast'), tTimer;
  function toast(msg){
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(tTimer);
    tTimer = setTimeout(function(){ toastEl.classList.remove('show') }, 1500);
  }

  /* 占位子页面 */
  var sub = $('#subView'), subTitle = $('.vtitle', sub), subNote = $('.vt2', sub);
  function openPage(title, note){
    subTitle.textContent = title;
    subNote.textContent = note || '演示占位页 · 点左上角返回';
    sub.classList.add('show');
    sub.setAttribute('aria-hidden', 'false');
  }
  function closePage(){
    sub.classList.remove('show');
    sub.setAttribute('aria-hidden', 'true');
  }

  /* 底部 tab */
  var tabs = $$('.tab'), cur = 3;
  tabs.forEach(function(t, i){
    t.addEventListener('click', function(e){
      e.preventDefault();
      if (i === cur) return;
      tabs.forEach(function(x){ x.classList.remove('on') });
      t.classList.add('on'); cur = i;
      var name = t.querySelector('.lb').textContent;
      openPage(name, '「' + name + '」这个 tab 还没做 · 点左上角回「我的」');
    });
  });

  /* 返回：恢复「我的」tab */
  $('.vback', sub).addEventListener('click', function(){
    closePage();
    tabs.forEach(function(x, i){ x.classList.toggle('on', i === 3) });
    cur = 3;
  });

  /* 歌单 -> 详情占位 */
  $$('.pl-item').forEach(function(it){
    it.addEventListener('click', function(){
      var name = it.querySelector('.pl-name').textContent;
      var cnt = it.querySelector('.pl-count').textContent;
      openPage(name, cnt + ' · 歌单详情待实现');
    });
  });

  /* 四宫格 */
  $$('.quick-a').forEach(function(a){
    a.addEventListener('click', function(){
      var n = a.querySelector('.qn').textContent;
      var v = a.querySelector('.qv').textContent;
      if (n === '喜欢') openPage('我喜欢的音乐', '共 ' + v + ' 首 · 演示占位页');
      else if (n === '最近') openPage('最近播放', '共 ' + v + ' 首 · 演示占位页');
      else toast(n + '：' + (v ? v + ' 首' : '暂无内容'));
    });
  });

  /* 活动中心 / 会员中心 / 私信 */
  $$('.promo-col').forEach(function(c, i){
    c.addEventListener('click', function(){
      if (i === 0) openPage('活动中心', '好书福利最后 2 天');
      else openPage('会员中心', '5 个月 VIP，快领');
    });
  });
  $('.uc-mail').addEventListener('click', function(){ toast('暂无新私信') });

  /* 播放 / 暂停 */
  var play = $('#playBtn');
  play.addEventListener('click', function(){
    var on = play.classList.toggle('playing');
    play.setAttribute('aria-label', on ? '暂停' : '播放');
    toast(on ? '正在播放：比我幸福 - 陈晓东' : '已暂停');
  });

  /* 播放列表 */
  $('.p-list').addEventListener('click', function(){ openPage('当前播放列表', '3 首 · 演示占位页') });

  /* 智能分类芯片 */
  $$('.chip').forEach(function(c){
    c.addEventListener('click', function(){
      if (c.classList.contains('more')) { toast('更多智能分类'); return }
      c.classList.toggle('on');
      toast(c.classList.contains('on') ? '已选「' + c.textContent + '」' : '取消「' + c.textContent + '」');
    });
  });

  /* 新建歌单 / 歌单管理 */
  $$('.pl-tools > *').forEach(function(el, i){
    el.addEventListener('click', function(){ toast(i === 0 ? '新建歌单' : '歌单管理') });
  });

  /* 搜索 */
  var sv = $('#searchView'), si = $('#sinput');
  $('.search').addEventListener('click', function(){
    sv.classList.add('show');
    sv.setAttribute('aria-hidden', 'false');
    setTimeout(function(){ si.focus() }, 220);
  });
  function closeSearch(){
    sv.classList.remove('show');
    sv.setAttribute('aria-hidden', 'true');
    si.value = ''; si.blur();
  }
  $('#scancel').addEventListener('click', closeSearch);
  $$('.stag').forEach(function(t){
    t.addEventListener('click', function(){ si.value = t.textContent; si.focus(); toast('搜索：' + t.textContent) });
  });
  si.addEventListener('keydown', function(e){
    if (e.key === 'Enter' && si.value.trim()) toast('搜索：' + si.value.trim());
  });

  /* 抽屉 */
  var mask = $('#mask'), drawer = $('#drawer');
  $('#menuBtn').addEventListener('click', function(){
    mask.classList.add('show'); drawer.classList.add('show');
    drawer.setAttribute('aria-hidden', 'false');
  });
  function closeDrawer(){
    mask.classList.remove('show'); drawer.classList.remove('show');
    drawer.setAttribute('aria-hidden', 'true');
  }
  mask.addEventListener('click', closeDrawer);
  $$('.ditem').forEach(function(d){
    d.addEventListener('click', function(){ closeDrawer(); toast(d.textContent + '（演示）') });
  });

  /* Esc 逐层关闭 */
  document.addEventListener('keydown', function(e){
    if (e.key !== 'Escape') return;
    if (sv.classList.contains('show')) { closeSearch(); return }
    if (drawer.classList.contains('show')) { closeDrawer(); return }
    if (sub.classList.contains('show')) closePage();
  });
})();
</script>
"""

ICONS = {
    'font.html': {
        'back': '<i class="fa-solid fa-chevron-left"></i>',
        'empty': '<i class="iconfont icon-yinle"></i>',
        'search': '<i class="iconfont icon-sousuotianchong"></i>',
        'play_old': '<span class="p-play"><i class="fa-solid fa-play"></i></span>',
        'play_new': ('<span class="p-play" id="playBtn" role="button" aria-label="播放">'
                     '<i class="fa-solid fa-play i-play"></i>'
                     '<i class="fa-solid fa-pause i-pause"></i></span>'),
        'menu_old': '<i class="wb wb-menu"></i>',
        'menu_new': '<i class="wb wb-menu" id="menuBtn" role="button" aria-label="更多"></i>',
    },
    'svg.html': {
        'back': ('<svg width="9" height="16" viewBox="0 0 9 16" fill="none" stroke="currentColor" aria-hidden="true">'
                 '<path d="M7.4 1.6 1.6 8l5.8 6.4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'),
        'empty': ('<svg width="34" height="33" viewBox="0 0 25 24" fill="none" stroke="currentColor" aria-hidden="true">'
                  '<circle cx="4.1" cy="20" r="2.6" stroke-width="1.9"/><circle cx="17.7" cy="21.4" r="2.6" stroke-width="1.9"/>'
                  '<path d="M6.7 20V4.6M20.3 21.4V7.4" stroke-width="1.9" stroke-linecap="round"/>'
                  '<path d="M6.7 4.6 20.3 7.4" stroke-width="2.2" stroke-linecap="round"/></svg>'),
        'search': ('<svg width="17" height="17" viewBox="0 0 19 19" fill="none" stroke="currentColor" aria-hidden="true">'
                   '<circle cx="8" cy="8" r="6.6" stroke-width="1.8"/><path d="M12.9 12.9 17.9 17.9" stroke-width="1.9" stroke-linecap="round"/></svg>'),
        'play_old': """<span class="p-play">
      <svg width="15" height="16" viewBox="0 0 15 16" fill="currentColor" aria-hidden="true">
        <path d="M1.4 1.9a1.8 1.8 0 0 1 2.7-1.5l9.5 6.1a1.8 1.8 0 0 1 0 3l-9.5 6.1a1.8 1.8 0 0 1-2.7-1.5z"/>
      </svg>
    </span>""",
        'play_new': """<span class="p-play" id="playBtn" role="button" aria-label="播放">
      <svg class="i-play" width="15" height="16" viewBox="0 0 15 16" fill="currentColor" aria-hidden="true">
        <path d="M1.4 1.9a1.8 1.8 0 0 1 2.7-1.5l9.5 6.1a1.8 1.8 0 0 1 0 3l-9.5 6.1a1.8 1.8 0 0 1-2.7-1.5z"/>
      </svg>
      <svg class="i-pause" width="13" height="15" viewBox="0 0 13 15" fill="currentColor" aria-hidden="true">
        <rect x="1" y="1" width="3.6" height="13" rx="1.6"/><rect x="8.4" y="1" width="3.6" height="13" rx="1.6"/>
      </svg>
    </span>""",
        'menu_old': '<svg width="25" height="21" viewBox="0 0 25 21" fill="#4b4b4b" aria-hidden="true" style="margin-left:auto">',
        'menu_new': '<svg id="menuBtn" role="button" width="25" height="21" viewBox="0 0 25 21" fill="#4b4b4b" aria-hidden="true" style="margin-left:auto">',
    },
}

for fname, ic in ICONS.items():
    p = BASE + fname
    s = io.open(p, encoding='utf-8').read()

    s = s.replace('</style>', CSS + '\n</style>', 1)
    s = s.replace('  </nav>\n</div>', '  </nav>\n' + (DOM % ic).rstrip() + '\n</div>', 1)
    s = s.replace('</body>', JS + '</body>', 1)

    assert ic['play_old'] in s, fname + ' play markup not found'
    s = s.replace(ic['play_old'], ic['play_new'])
    assert ic['menu_old'] in s, fname + ' menu markup not found'
    s = s.replace(ic['menu_old'], ic['menu_new'])

    io.open(p, 'w', encoding='utf-8').write(s)
    print('patched', fname)
