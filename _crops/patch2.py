import io

# ---------- 两个文件共同的微调 ----------
for p in ['font.html', 'svg.html']:
    fp = 'C:/Users/Administrator/DeskBox/DeskBox/web/10/22/' + p
    s = io.open(fp, encoding='utf-8').read()
    s = s.replace("width:362px;height:40px;margin-left:19px;", "width:364px;height:40px;margin-left:15px;")
    io.open(fp, 'w', encoding='utf-8').write(s)

# ---------- SVG 版图标修正 ----------
fp = 'C:/Users/Administrator/DeskBox/DeskBox/web/10/22/svg.html'
s = io.open(fp, encoding='utf-8').read()
rep = [
 # 心形缺口改小
 ('<circle cx="22.7" cy="6.1" r="3.7" fill="#000"/>', '<circle cx="21.6" cy="5.1" r="2.9" fill="#000"/>'),
 # 勾选更大
 ('<path d="M8.9 17.7l5.5 5.6 10.9-12" fill="none" stroke="#f8f8f8" stroke-width="3.4"',
  '<path d="M8.4 17.6l5.4 5.5 11.8-13.2" fill="none" stroke="#f8f8f8" stroke-width="3.5"'),
 # 书签收窄
 ('<svg width="19" height="20" viewBox="0 0 19 20" fill="currentColor" aria-hidden="true">\n            <path d="M2.4 0h14.2A2.4 2.4 0 0 1 19 2.4V20l-9.5-5.9L0 20V2.4A2.4 2.4 0 0 1 2.4 0z"/>',
  '<svg width="17" height="20" viewBox="0 0 17 20" fill="currentColor" aria-hidden="true">\n            <path d="M2.2 0h12.6A2.2 2.2 0 0 1 17 2.2V20l-8.5-5.4L0 20V2.2A2.2 2.2 0 0 1 2.2 0z"/>'),
 # 宝石略小
 ('<svg width="20" height="19" viewBox="0 0 20 19" fill="currentColor" aria-hidden="true">',
  '<svg width="18" height="17" viewBox="0 0 20 19" fill="currentColor" aria-hidden="true">'),
 # 人像略小
 ('<svg width="26" height="29" viewBox="0 0 26 29"', '<svg width="25" height="28" viewBox="0 0 26 29"'),
 # 24 字号
 ('font-size="13.5"', 'font-size="14.5"'),
]
for a, b in rep:
    if a not in s:
        print('MISS', a[:50])
    s = s.replace(a, b)
io.open(fp, 'w', encoding='utf-8').write(s)
print('done')
