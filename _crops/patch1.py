import io
p = r'C:/Users/Administrator/DeskBox/DeskBox/web/10/22/font.html'
s = io.open(p, encoding='utf-8').read()
rep = [
 (".statusbar{height:30px;flex:none;display:flex;align-items:center;padding:0 20px 0 14px;position:relative;font-size:15px}",
  ".statusbar{height:30px;flex:none;display:flex;align-items:center;padding:0 8px 0 12px;position:relative;font-size:15px}"),
 (".appbar{height:66px;flex:none;display:flex;align-items:center;padding:0 30px 0 20px}",
  ".appbar{height:66px;flex:none;display:flex;align-items:center;padding:0 26px 0 20px}"),
 (".menu{margin-left:auto;width:30px;height:21px;", ".menu{margin-left:auto;width:25px;height:21px;"),
 ("color:#b8b8b8;font-size:15px;", "color:#a8a8a8;font-size:15px;"),
 ("justify-content:center;padding:0 13px;", "justify-content:center;padding:0 11px;"),
 (".tabbar{flex:none;height:61px;background:#fff;display:flex;padding-top:10px;position:relative;z-index:2}",
  ".tabbar{flex:none;height:61px;background:#fff;display:flex;padding:10px 24px 0;position:relative;z-index:2}"),
 (".pl-arrow{width:11px;height:11px;border-top:2px solid #c6c6c6;border-right:2px solid #c6c6c6;transform:rotate(45deg);flex:none;margin-top:-2px}",
  ".pl-arrow{color:#b8b8b8;font-size:14px;flex:none;margin-top:-2px}"),
 ("padding:0 14px 0 10px;position:relative;z-index:3;", "padding:0 22px 0 10px;position:relative;z-index:3;"),
 (".p-list{margin-left:18px;width:27px;height:24px;", ".p-list{margin-left:25px;width:27px;height:24px;"),
 (".p-list b:nth-child(1){top:0;width:27px}", ".p-list b:nth-child(1){top:0;width:25px}"),
 (".p-list b:nth-child(2){top:9px;width:20px}", ".p-list b:nth-child(2){top:9px;width:19px}"),
 (".p-list b:nth-child(3){top:18px;width:14px}", ".p-list b:nth-child(3){top:18px;width:13px}"),
 (".p-list i{position:absolute;right:0;bottom:-2px;font-size:13px;line-height:1}",
  ".p-list i{position:absolute;right:-1px;bottom:-1px;font-size:12px;line-height:1}"),
 ("border-left:1.6px solid #6a6a6a;border-bottom:1.6px solid #6a6a6a;transform:rotate(-45deg) translateY(-1.4px)",
  "border-left:2px solid #656565;border-bottom:2px solid #656565;transform:rotate(-45deg) translateY(-1.6px)"),
 ("flex:1;height:1.8px;border-radius:1px;background:#6a6a6a", "flex:1;height:2px;border-radius:1px;background:#656565"),
 ('<i class="pl-arrow"></i>', '<i class="fa-solid fa-chevron-right pl-arrow"></i>'),
]
miss = 0
for a, b in rep:
    if a not in s:
        print('MISS', a[:60]); miss += 1
    s = s.replace(a, b)
io.open(p, 'w', encoding='utf-8').write(s)
print('ok miss=', miss)
