import io

# ================= font.html =================
p = 'C:/Users/Administrator/DeskBox/DeskBox/web/10/22/font.html'
s = io.open(p, encoding='utf-8').read()
rep = [
 ('.q-down{font-size:43px;transform:scaleY(.72)}',
  '.q-down{font-size:40px;transform:scaleY(.78);text-shadow:.9px 0 currentColor,-.9px 0 currentColor,0 .9px currentColor,0 -.9px currentColor}'),
 ('.heart-wrap::after{content:"";position:absolute;right:5.5px;top:-2.5px;width:8px;height:8px;',
  '.heart-wrap::after{content:"";position:absolute;right:7px;top:-2px;width:7px;height:7px;'),
]
for a, b in rep:
    if a not in s: print('FONT MISS', a[:50])
    s = s.replace(a, b)
io.open(p, 'w', encoding='utf-8').write(s)

# ================= svg.html =================
p = 'C:/Users/Administrator/DeskBox/DeskBox/web/10/22/svg.html'
s = io.open(p, encoding='utf-8').read()
rep = [
 ('<circle cx="21.6" cy="5.1" r="2.9" fill="#000"/>', '<circle cx="21.2" cy="3.8" r="3.4" fill="#000"/>'),
 ('<path d="M16.5 1.9v14.6l6.1 6.1" fill="none" stroke="#f8f8f8" stroke-width="2.9"',
  '<path d="M16.5 1.9v14.6l5.6 5.6" fill="none" stroke="#f8f8f8" stroke-width="2.9"'),
]
for a, b in rep:
    if a not in s: print('SVG MISS', a[:50])
    s = s.replace(a, b)
io.open(p, 'w', encoding='utf-8').write(s)
print('done')
