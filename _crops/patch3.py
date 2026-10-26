import io

# ================= font.html =================
p = 'C:/Users/Administrator/DeskBox/DeskBox/web/10/22/font.html'
s = io.open(p, encoding='utf-8').read()
rep = [
 ('.fa-clock{font-size:36px}', '.fa-clock{font-size:32px}'),
 ('.q-down{font-size:40px}', '.q-down{font-size:43px;transform:scaleY(.72)}'),
 ('.fa-circle-check{font-size:35px}', '.fa-circle-check{font-size:32px}'),
 ('.cal24 b{position:absolute;left:0;right:0;top:9px;text-align:center;font-size:13px;',
  '.cal24 b{position:absolute;left:0;right:0;top:8.5px;text-align:center;font-size:14px;'),
 ('.heart-wrap::after{content:"";position:absolute;right:6px;top:-3px;width:9px;height:9px;',
  '.heart-wrap::after{content:"";position:absolute;right:5.5px;top:-2.5px;width:8px;height:8px;'),
]
for a, b in rep:
    if a not in s: print('FONT MISS', a[:50])
    s = s.replace(a, b)
io.open(p, 'w', encoding='utf-8').write(s)

# ================= svg.html =================
p = 'C:/Users/Administrator/DeskBox/DeskBox/web/10/22/svg.html'
s = io.open(p, encoding='utf-8').read()
rep = [
 # 时钟缩小
 ('<svg width="33" height="33" viewBox="0 0 33 33" aria-hidden="true">',
  '<svg width="30" height="30" viewBox="0 0 33 33" aria-hidden="true">'),
 # 勾选缩小
 ('<svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true">',
  '<svg width="31" height="31" viewBox="0 0 34 34" aria-hidden="true">'),
 # 下载箭头重画（29x30，矮胖造型）
 ('<svg width="31" height="46" viewBox="0 0 31 46" fill="currentColor" aria-hidden="true">',
  '<svg width="29" height="30" viewBox="0 0 29 30" fill="currentColor" aria-hidden="true">'),
 ('<path stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"\n                d="M11.4 1.8h8.2v16.6h8.1a1.9 1.9 0 0 1 1.4 3.2L17.5 43.9a2.1 2.1 0 0 1-3.1 0L2.5 21.6a1.9 1.9 0 0 1 1.4-3.2h7.5z"/>',
  '<path stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"\n                d="M11.4 1.8h6.2v11.4h9.6c1.5 0 2.3 1.7 1.3 2.8L17.7 28.6a2.1 2.1 0 0 1-3.2 0L3.7 16c-1-1.1-.2-2.8 1.3-2.8h6.4z"/>'),
 # 音乐馆音符：更细的横梁、更小的符头
 ('<svg width="25" height="24" viewBox="0 0 25 24" fill="none" stroke="currentColor" aria-hidden="true">\n          <circle cx="4.2" cy="19.6" r="2.9" stroke-width="2" fill="#fff"/>\n          <circle cx="17.6" cy="21.2" r="2.9" stroke-width="2" fill="#fff"/>\n          <path d="M7.1 19.6V5.1M20.5 21.2V7.7" stroke-width="2" stroke-linecap="round"/>\n          <path d="M7.1 5.1 20.5 7.7" stroke-width="2.6" stroke-linecap="round"/>',
  '<svg width="25" height="24" viewBox="0 0 25 24" fill="none" stroke="currentColor" aria-hidden="true">\n          <circle cx="4.1" cy="20" r="2.6" stroke-width="1.9" fill="#fff"/>\n          <circle cx="17.7" cy="21.4" r="2.6" stroke-width="1.9" fill="#fff"/>\n          <path d="M6.7 20V4.6M20.3 21.4V7.4" stroke-width="1.9" stroke-linecap="round"/>\n          <path d="M6.7 4.6 20.3 7.4" stroke-width="2.2" stroke-linecap="round"/>'),
 # 24 字号再大一点
 ('font-size="14.5"', 'font-size="15"'),
]
for a, b in rep:
    if a not in s: print('SVG MISS', a[:60])
    s = s.replace(a, b)
io.open(p, 'w', encoding='utf-8').write(s)
print('done')
