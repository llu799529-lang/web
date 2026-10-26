import sys
from PIL import Image, ImageChops
a_path, b_path, out = sys.argv[1], sys.argv[2], sys.argv[3]
a = Image.open(a_path).convert('RGB')          # 原图
b = Image.open(b_path).convert('RGB')          # 渲染
if b.size != a.size: b = b.resize(a.size)
W,H = a.size
sheet = Image.new('RGB', (W*2+16, H), (255,0,255))
sheet.paste(a,(0,0)); sheet.paste(b,(W+16,0))
sheet.save(out)
# 叠加差异
diff = ImageChops.difference(a,b).convert('L').point(lambda v: 255 if v>45 else 0)
diff.save(out.replace('.png','_diff.png'))
print('ok', a.size, b.size)
