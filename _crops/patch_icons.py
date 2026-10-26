import io

p = 'C:/Users/Administrator/DeskBox/DeskBox/web/10/22/font.html'
s = io.open(p, encoding='utf-8').read()

# 1) 引入自制图标字体
s = s.replace('<link rel="stylesheet" href="cdn/iconfont/iconfont.css">',
              '<link rel="stylesheet" href="cdn/iconfont/iconfont.css">\n<link rel="stylesheet" href="cdn/wbfont/wbfont.css">')

# 2) 注释更新
s = s.replace("""  · iconfont（项目 id 5244698）：音乐馆 / 动态 / 我的 / 搜索
  · Font Awesome 6 Free：心形、时钟、下载、勾选、信封、书签、宝石、播放等
  · 字形库里没有的（推荐 "24" 日历、加号、清单、汉堡菜单、右箭头、电池）用 CSS 绘制""",
"""  · iconfont（项目 id 5244698）：音乐馆 / 动态 / 我的 / 搜索
  · Font Awesome 6 Free：信封、书签、宝石、播放、音符、右箭头
  · 自绘图标字体 wbicon（cdn/wbfont）：心形、时钟、下载、勾选、日历、加号、清单、
    播放列表、汉堡菜单 —— 现成字形库里没有对得上的，按设计稿画好直接编译成字体""")

# 3) 图标尺寸/修饰样式
s = s.replace(""".fa-heart{font-size:34px}
.fa-clock{font-size:32px}
/* 下载箭头：竖条用 CSS，箭头尖用 fa-caret-down（字体图标里没有"粗箭头"字形） */
.dl{position:relative;width:29px;height:31px}
.dl::before{content:"";position:absolute;left:50%;top:0;transform:translateX(-50%);width:8.5px;height:16px;border-radius:2.5px 2.5px 0 0;background:currentColor}
.dl .fa-caret-down{position:absolute;left:50%;bottom:-1px;transform:translateX(-50%);font-size:36px;line-height:1}
.fa-circle-check{font-size:32px}
.heart-wrap{position:relative;display:inline-flex}
/* 心形右上角的缺口（截图里的 "喜欢" 图标带一个月牙形开口） */
.heart-wrap::after{content:"";position:absolute;right:7px;top:-2px;width:7px;height:7px;border-radius:50%;background:var(--bg)}""",
""".wb-heart{font-size:30px}
.wb-clock{font-size:30px}
.wb-down{font-size:31px}
.wb-check{font-size:31px}""")

s = s.replace(""".plus{width:22px;height:22px;border:2px solid #656565;border-radius:6px;position:relative}
.plus::before,.plus::after{content:"";position:absolute;left:50%;top:50%;background:#6a6a6a;transform:translate(-50%,-50%)}
.plus::before{width:11px;height:2px}
.plus::after{width:2px;height:11px}
.checklist{width:22px;height:18px;display:flex;flex-direction:column;justify-content:space-between}
.checklist span{display:flex;align-items:center;gap:4px;height:4px}
.checklist span::before{content:"";width:6px;height:3.4px;border-left:2px solid #656565;border-bottom:2px solid #656565;transform:rotate(-45deg) translateY(-1.6px)}
.checklist span::after{content:"";flex:1;height:2px;border-radius:1px;background:#656565}""",
""".wb-plus{font-size:22px;color:#656565}
.wb-list{font-size:18px;color:#656565}""")

s = s.replace(""".p-list{margin-left:25px;width:27px;height:24px;position:relative;color:var(--g);flex:none}
.p-list b{position:absolute;left:0;display:block;height:3.4px;border-radius:1.7px;background:var(--g)}
.p-list b:nth-child(1){top:0;width:25px}
.p-list b:nth-child(2){top:9px;width:19px}
.p-list b:nth-child(3){top:18px;width:13px}
.p-list i{position:absolute;right:-1px;bottom:-1px;font-size:12px;line-height:1}""",
""".p-list{margin-left:25px;color:var(--g);flex:none}
.wb-playlist{font-size:24px}""")

s = s.replace(""".menu{margin-left:auto;width:25px;height:21px;display:flex;flex-direction:column;justify-content:space-between}
.menu i{display:block;height:2.6px;border-radius:1.3px;background:#4b4b4b}""",
""".wb-menu{font-size:21px;color:#4b4b4b;margin-left:auto}""")

s = s.replace("""/* 推荐 · "24" 日历（字体图标库里没有对应字形，用 CSS 画） */
.cal24{width:30px;height:28px;border:2px solid currentColor;border-radius:6px;position:relative;display:block}
.cal24::before{content:"";position:absolute;left:3.5px;right:3.5px;top:5.5px;height:2px;background:currentColor}
.cal24 b{position:absolute;left:0;right:0;top:8.5px;text-align:center;font-size:14px;font-weight:400;letter-spacing:-.3px;line-height:1.05}""",
"""/* 推荐 · "24" 日历：日历框是自绘图标的字形，日期数字用文字 */
.cal24{position:relative;display:block;font-size:28px}
.cal24 b{position:absolute;left:0;right:0;top:8.5px;text-align:center;font-size:14px;font-weight:400;letter-spacing:-.3px;line-height:1.05}""")

# 4) 标记替换
s = s.replace('<div class="qi"><span class="heart-wrap"><i class="fa-solid fa-heart"></i></span></div>',
              '<div class="qi"><i class="wb wb-heart"></i></div>')
s = s.replace('<div class="qi"><i class="fa-solid fa-clock"></i></div>',
              '<div class="qi"><i class="wb wb-clock"></i></div>')
s = s.replace('<div class="qi"><span class="dl"><i class="fa-solid fa-caret-down"></i></span></div>',
              '<div class="qi"><i class="wb wb-down"></i></div>')
s = s.replace('<div class="qi"><i class="fa-solid fa-circle-check"></i></div>',
              '<div class="qi"><i class="wb wb-check"></i></div>')
s = s.replace('<span class="plus"></span>', '<i class="wb wb-plus"></i>')
s = s.replace('<span class="checklist"><span></span><span></span><span></span></span>',
              '<i class="wb wb-list"></i>')
s = s.replace("""    <span class="p-list">
      <b></b><b></b><b></b>
      <i class="fa-solid fa-music"></i>
    </span>""",
              '    <span class="p-list"><i class="wb wb-playlist"></i></span>')
s = s.replace('<div class="menu"><i></i><i></i><i></i></div>',
              '<i class="wb wb-menu"></i>')
s = s.replace('<span class="ti"><span class="cal24"><b>24</b></span></span>',
              '<span class="ti"><span class="cal24"><i class="wb wb-cal"></i><b>24</b></span></span>')

io.open(p, 'w', encoding='utf-8').write(s)
print('font.html icons -> wbicon')
