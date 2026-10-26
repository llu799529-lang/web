# -*- coding: utf-8 -*-
"""把图标几何直接编译成 TrueType 字体（纯 Python，无第三方依赖）。
每个图标 = 若干闭合轮廓（非零环绕填充）；轮廓点全部 on-curve 折线点，
圆弧用足够密的点近似，30~40px 下与曲线不可分辨。
"""
import struct, math, os, re

UPM = 1000


# ---------------- 基础几何（y 向下，单位 = 设计像素） ----------------
def area(pts):
    a = 0.0
    for i in range(len(pts)):
        x1, y1 = pts[i]; x2, y2 = pts[(i + 1) % len(pts)]
        a += x1 * y2 - x2 * y1
    return a / 2


def fix(pts):
    """统一外轮廓的环绕方向（面积取正），否则重叠笔画会互相挖空"""
    return pts if area(pts) >= 0 else pts[::-1]


def rev(pts):
    return fix(pts)[::-1]


def circle(cx, cy, r, n=64):
    return fix([(cx + r * math.cos(2 * math.pi * i / n), cy + r * math.sin(2 * math.pi * i / n)) for i in range(n)])


def ring(cx, cy, r, w, n=64):
    return [circle(cx, cy, r, n), rev(circle(cx, cy, max(r - w, .2), n))]


def capsule(p1, p2, w, n=20):
    (x1, y1), (x2, y2) = p1, p2
    dx, dy = x2 - x1, y2 - y1
    L = math.hypot(dx, dy) or 1e-6
    ux, uy = dx / L, dy / L
    nx, ny = -uy, ux
    r = w / 2
    a = math.atan2(uy, ux)
    pts = [(x1 + nx * r, y1 + ny * r), (x2 + nx * r, y2 + ny * r)]
    for i in range(1, n + 1):                      # p2 端：+90° -> -90°
        t = a + math.pi / 2 - math.pi * i / n
        pts.append((x2 + r * math.cos(t), y2 + r * math.sin(t)))
    pts.append((x1 - nx * r, y1 - ny * r))
    for i in range(1, n + 1):                      # p1 端：-90° -> -270°
        t = a - math.pi / 2 - math.pi * i / n
        pts.append((x1 + r * math.cos(t), y1 + r * math.sin(t)))
    return fix(pts)



def _unit(P, Q):
    dx, dy = Q[0] - P[0], Q[1] - P[1]
    L = math.hypot(dx, dy) or 1e-6
    return (dx / L, dy / L)


def _isect(p1, d1, p2, d2):
    det = d1[0] * d2[1] - d1[1] * d2[0]
    if abs(det) < 1e-9:
        return None
    t = ((p2[0] - p1[0]) * d2[1] - (p2[1] - p1[1]) * d2[0]) / det
    return (p1[0] + d1[0] * t, p1[1] + d1[1] * t)


def stroke2(A, B, C, w, n=18):
    """两段折线的描边轮廓（外角圆弧、内角尖角、两端圆头），一次成环，避免轮廓重叠"""
    r = w / 2
    u1, u2 = _unit(A, B), _unit(B, C)
    n1, n2 = (-u1[1], u1[0]), (-u2[1], u2[0])
    cross = u1[0] * u2[1] - u1[1] * u2[0]
    innerP = cross > 0          # 左法线一侧为内侧

    def P(pt, nn, s=1.0):
        return (pt[0] + nn[0] * r * s, pt[1] + nn[1] * r * s)

    pts = [P(A, n1)]
    if innerP:
        m = _isect(P(B, n1), u1, P(B, n2), u2)
        pts.append(m or P(B, n1))
        pts.append(P(B, n2))
    else:
        a0 = math.atan2(n1[1], n1[0]); a1 = math.atan2(n2[1], n2[0])
        da = a1 - a0
        while da > math.pi: da -= 2 * math.pi
        while da < -math.pi: da += 2 * math.pi
        pts.append(P(B, n1))
        for k in range(1, n):
            a = a0 + da * k / n
            pts.append((B[0] + r * math.cos(a), B[1] + r * math.sin(a)))
        pts.append(P(B, n2))
    pts.append(P(C, n2))
    # C 端圆头
    a0 = math.atan2(n2[1], n2[0]); ac = math.atan2(u2[1], u2[0])
    d = ac - a0
    while d > math.pi: d -= 2 * math.pi
    while d < -math.pi: d += 2 * math.pi
    sgn = 1 if d > 0 else -1
    for k in range(1, n):
        a = a0 + sgn * math.pi * k / n
        pts.append((C[0] + r * math.cos(a), C[1] + r * math.sin(a)))
    pts.append(P(C, n2, -1))
    # 回程（另一侧）
    if innerP:
        a0 = math.atan2(n2[1], n2[0]); a1 = math.atan2(n1[1], n1[0])
        da = a1 - a0
        while da > math.pi: da -= 2 * math.pi
        while da < -math.pi: da += 2 * math.pi
        pts.append(P(B, n2, -1))
        for k in range(1, n):
            a = a0 - da * k / n * -1
            a = a0 + da * k / n
            pts.append((B[0] + r * math.cos(a), B[1] + r * math.sin(a)))
        pts.append(P(B, n1, -1))
    else:
        m = _isect(P(B, n1, -1), u1, P(B, n2, -1), u2)
        pts.append(P(B, n2, -1))
        pts.append(m or P(B, n1, -1))
        pts.append(P(B, n1, -1))
    pts.append(P(A, n1, -1))
    # A 端圆头
    a0 = math.atan2(n1[1], n1[0]); ac = math.atan2(-u1[1], -u1[0])
    d = ac - a0
    while d > math.pi: d -= 2 * math.pi
    while d < -math.pi: d += 2 * math.pi
    sgn = 1 if d > 0 else -1
    for k in range(1, n):
        a = a0 + sgn * math.pi * k / n
        pts.append((A[0] + r * math.cos(a), A[1] + r * math.sin(a)))
    return fix(pts)


def polyline(pts, w, n=20):
    return [capsule(pts[i], pts[i + 1], w, n) for i in range(len(pts) - 1)]


def rrect(x, y, w, h, r, n=12):
    r = min(r, w / 2, h / 2)
    pts = []
    for cx, cy, a0, a1 in [(x + r, y + r, -math.pi, -math.pi / 2),
                           (x + w - r, y + r, -math.pi / 2, 0),
                           (x + w - r, y + h - r, 0, math.pi / 2),
                           (x + r, y + h - r, math.pi / 2, math.pi)]:
        for i in range(n + 1):
            t = a0 + (a1 - a0) * i / n
            pts.append((cx + r * math.cos(t), cy + r * math.sin(t)))
    return fix(pts)


def rring(x, y, w, h, r, sw):
    return [rrect(x, y, w, h, r), rev(rrect(x + sw, y + sw, w - 2 * sw, h - 2 * sw, max(r - sw, .1)))]


def ellipse(cx, cy, rx, ry, n=48):
    return fix([(cx + rx * math.cos(2 * math.pi * i / n), cy + ry * math.sin(2 * math.pi * i / n)) for i in range(n)])


def round_poly(pts, r, n=8):
    out = []
    L = len(pts)
    for i in range(L):
        p0, p1, p2 = pts[(i - 1) % L], pts[i], pts[(i + 1) % L]
        v1 = (p0[0] - p1[0], p0[1] - p1[1]); l1 = math.hypot(*v1) or 1e-6
        v2 = (p2[0] - p1[0], p2[1] - p1[1]); l2 = math.hypot(*v2) or 1e-6
        rr = min(r, l1 / 2, l2 / 2)
        a = (p1[0] + v1[0] / l1 * rr, p1[1] + v1[1] / l1 * rr)
        b = (p1[0] + v2[0] / l2 * rr, p1[1] + v2[1] / l2 * rr)
        out.append(a)
        for k in range(1, n):
            u = k / n
            out.append(((1 - u) ** 2 * a[0] + 2 * (1 - u) * u * p1[0] + u * u * b[0],
                        (1 - u) ** 2 * a[1] + 2 * (1 - u) * u * p1[1] + u * u * b[1]))
        out.append(b)
    return fix(out)


def sample_path(d, steps=24):
    toks = re.findall(r'[A-Za-z]|-?\d*\.?\d+', d)
    i = 0; cmd = None; cur = (0., 0.); start = (0., 0.); pts = []

    def nums(n):
        nonlocal i
        v = [float(toks[i + k]) for k in range(n)]
        i += n
        return v

    while i < len(toks):
        if toks[i].isalpha():
            cmd = toks[i]; i += 1
            if cmd in 'Zz':
                pts.append(start); cur = start; continue
        if cmd in 'Mm':
            x, y = nums(2)
            if cmd == 'm': x, y = cur[0] + x, cur[1] + y
            cur = (x, y); start = cur; pts.append(cur)
            cmd = 'L' if cmd == 'M' else 'l'
        elif cmd in 'Ll':
            x, y = nums(2)
            if cmd == 'l': x, y = cur[0] + x, cur[1] + y
            cur = (x, y); pts.append(cur)
        elif cmd in 'Cc':
            x1, y1, x2, y2, x, y = nums(6)
            if cmd == 'c':
                x1, y1 = cur[0] + x1, cur[1] + y1
                x2, y2 = cur[0] + x2, cur[1] + y2
                x, y = cur[0] + x, cur[1] + y
            p0 = cur
            for s in range(1, steps + 1):
                u = s / steps; v = 1 - u
                pts.append((v ** 3 * p0[0] + 3 * v * v * u * x1 + 3 * v * u * u * x2 + u ** 3 * x,
                            v ** 3 * p0[1] + 3 * v * v * u * y1 + 3 * v * u * u * y2 + u ** 3 * y))
            cur = (x, y)
        else:
            i += 1
    return pts


def dent(pts, cx, cy, r, depth):
    out = []
    for (x, y) in pts:
        d = math.hypot(x - cx, y - cy)
        if d < r:
            k = (1 - d / r) ** 1.6
            vx, vy = cx - x, cy - y
            L = math.hypot(vx, vy) or 1e-6
            x += vx / L * depth * k
            y += vy / L * depth * k
        out.append((x, y))
    return out


# ---------------- 字形 ----------------
GLYPHS = []


def glyph(name, code, W, H, contours):
    GLYPHS.append(dict(name=name, code=code, W=W, H=H, contours=contours))


# 1 心形（右上角带缺口）
h = sample_path("M17 29.4C17 29.4 1.6 20 1.6 10.6 1.6 5.6 5.4 1.6 9.9 1.6"
                "c3.2 0 5.7 1.9 7.1 4.2"
                "C18.6 3.9 19.6 5.8 21.5 5.6 23.2 5.4 23.5 3.2 24.3 1.5"
                "c4.4 0 8.1 4 8.1 9.1 0 9.4-15.4 18.8-15.4 18.8z", steps=26)
glyph('heart', 0xE900, 34, 30, [h])

# 2 时钟（实心圆 + 指针挖空）
glyph('clock', 0xE901, 30, 30,
      [circle(15, 15, 15)] + [rev(stroke2((15, 1.4), (15, 14.9), (21.9, 21.8), 2.7))])

# 3 下载箭头
glyph('down', 0xE902, 29, 31,
      [round_poly([(9.9, 0), (19.1, 0), (19.1, 14.2), (29, 14.2),
                   (14.5, 31), (0, 14.2), (9.9, 14.2)], 2.6, 8)])

# 4 勾选圈
glyph('check', 0xE903, 31, 31,
      [circle(15.5, 15.5, 15.5)] + [rev(stroke2((6.4, 16.2), (12.1, 21.9), (24.6, 8.4), 3.4))])

# 5 日历框（24 用文字叠上去）
glyph('cal', 0xE904, 30, 28, rring(1, 1, 28, 26, 6, 2) + [rrect(3, 8.2, 24, 2, 1)])

# 6 加号方框
glyph('plus', 0xE905, 22, 22,
      rring(1, 1, 20, 20, 4.8, 1.9)
      + polyline([(11, 6.3), (11, 15.7)], 1.9) + polyline([(6.3, 11), (15.7, 11)], 1.9))

# 7 清单
cont = []
for y in (3.2, 8.9, 14.6):
    cont.append(stroke2((0.9, y), (2.9, y + 2.1), (6.4, y - 1.9), 1.7))
    cont += polyline([(9.9, y), (22, y)], 1.8)
glyph('list', 0xE906, 22, 18, cont)

# 8 播放列表
cont = polyline([(0, 1.7), (25, 1.7)], 3.4) + polyline([(0, 10.7), (19, 10.7)], 3.4) \
       + polyline([(0, 19.7), (13, 19.7)], 3.4)
cont.append(ellipse(23.2, 21.0, 3.3, 2.7))
cont += polyline([(26.4, 8.2), (26.4, 21.0)], 1.9)
cont += polyline([(26.4, 7.6), (22.9, 6.2)], 2.1)
glyph('playlist', 0xE907, 27, 24, cont)

# 9 汉堡菜单
cont = []
for y in (1.3, 10.5, 19.7):
    cont += polyline([(0, y), (25, y)], 2.6)
glyph('menu', 0xE908, 25, 21, cont)


# ---------------- TrueType 组装 ----------------
def checksum(data):
    if len(data) % 4:
        data += b'\0' * (4 - len(data) % 4)
    s = 0
    for i in range(0, len(data), 4):
        s = (s + struct.unpack('>I', data[i:i + 4])[0]) & 0xFFFFFFFF
    return s


def build(path):
    glyf = b''
    loca = [0]
    hmtx = b''
    bb = [1e9, 1e9, -1e9, -1e9]
    max_pts = max_cont = 0

    # .notdef（空字形）
    glyf += struct.pack('>hhhhh', 0, 0, 0, 0, 0)
    loca.append(len(glyf))
    hmtx += struct.pack('>Hh', 500, 0)

    for g in GLYPHS:
        s = UPM / g['H']
        contours = []
        for c in g['contours']:
            want_pos = area(c) > 0
            pts = [(x * s, (g['H'] - y) * s) for (x, y) in c]
            if (area(pts) > 0) != want_pos:
                pts = pts[::-1]
            clean = []
            for p in pts:
                if not clean or abs(p[0] - clean[-1][0]) > 0.3 or abs(p[1] - clean[-1][1]) > 0.3:
                    clean.append(p)
            if len(clean) >= 3:
                contours.append(clean)
        adv = int(round(g['W'] * s))
        xs = [p[0] for c in contours for p in c]
        ys = [p[1] for c in contours for p in c]
        xmin, ymin, xmax, ymax = int(min(xs)), int(min(ys)), int(max(xs)), int(max(ys))
        bb = [min(bb[0], xmin), min(bb[1], ymin), max(bb[2], xmax), max(bb[3], ymax)]
        max_pts = max(max_pts, sum(len(c) for c in contours))
        max_cont = max(max_cont, len(contours))

        b = struct.pack('>hhhhh', len(contours), xmin, ymin, xmax, ymax)
        n = 0; ends = []
        for c in contours:
            n += len(c); ends.append(n - 1)
        b += struct.pack('>%dH' % len(ends), *ends) + struct.pack('>H', 0)
        flags = []; xd = []; yd = []
        px = py = 0
        for c in contours:
            for (x, y) in c:
                xi, yi = int(round(x)), int(round(y))
                xd.append(max(-32767, min(32767, xi - px)))
                yd.append(max(-32767, min(32767, yi - py)))
                px, py = xi, yi
                flags.append(0x01)
        b += struct.pack('>%dB' % len(flags), *flags)
        b += struct.pack('>%dh' % len(xd), *xd)
        b += struct.pack('>%dh' % len(yd), *yd)
        if len(b) % 4:
            b += b'\0' * (4 - len(b) % 4)
        glyf += b
        loca.append(len(glyf))
        hmtx += struct.pack('>Hh', adv, 0)

    num = len(GLYPHS) + 1
    xmin, ymin, xmax, ymax = [int(v) for v in bb]

    head = struct.pack('>IIIIHHQQhhhhHHhhh', 0x00010000, 0x00010000, 0, 0x5F0F3CF5,
                       0x0003, UPM, 0, 0, xmin, ymin, xmax, ymax, 0, 8, 2, 0, 0)
    hhea = struct.pack('>IhhhH' + 'h' * 11 + 'H', 0x00010000, UPM, 0, 0, 1000,
                       xmin, 0, xmax, 1, 0, 0, 0, 0, 0, 0, 0, num)
    maxp = struct.pack('>IH' + 'H' * 13, 0x00010000, num, max_pts, max_cont,
                       0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0)

    records = [(1, 'wbicon'), (2, 'Regular'), (4, 'wbicon'), (6, 'wbicon')]
    so = 6 + 12 * len(records)
    strings = b''; recs = b''
    for nid, s in records:
        u = s.encode('utf-16-be')
        recs += struct.pack('>HHHHHH', 3, 1, 0x409, nid, len(u), so + len(strings))
        strings += u
    name = struct.pack('>HHH', 0, len(records), so) + recs + strings

    post = struct.pack('>IihhIIIII', 0x00030000, 0, 0, 0, 0, 0, 0, 0, 0)

    first, last = GLYPHS[0]['code'], GLYPHS[-1]['code']
    segcount = 2
    os2 = struct.pack('>HhHHH', 4, 1000, 400, 5, 0)
    os2 += struct.pack('>8h', 650, 600, 0, 75, 650, 600, 0, 350)
    os2 += struct.pack('>hh', 50, 250) + struct.pack('>h', 0) + bytes(10)
    os2 += struct.pack('>IIII', 1, 0, 0, 0) + b'WBDY'
    os2 += struct.pack('>HHHhhhHH', 0x40, first, last, UPM, 0, 0, UPM, 0)
    os2 += struct.pack('>II', 1, 0)
    os2 += struct.pack('>hhHHH', 500, 700, 0, 32, 2)

    body = struct.pack('>%dH' % segcount, last, 0xFFFF) + b'\0\0' \
           + struct.pack('>%dH' % segcount, first, 0xFFFF) \
           + struct.pack('>%dh' % segcount, (1 - first) % 65536, 1) \
           + struct.pack('>%dH' % segcount, 0, 0)
    es4 = int(math.log2(segcount)); sr4 = 2 * (2 ** es4); rs4 = segcount * 2 - sr4
    fmt4 = struct.pack('>HHHHHHH', 4, 14 + len(body), 0, segcount * 2, sr4, es4, rs4) + body
    cmap = struct.pack('>HHHHI', 0, 1, 3, 1, 12) + fmt4

    loca_tbl = b''.join(struct.pack('>H', o // 2) for o in loca)

    tables = {'cmap': cmap, 'glyf': glyf, 'head': head, 'hhea': hhea, 'hmtx': hmtx,
              'loca': loca_tbl, 'maxp': maxp, 'name': name, 'OS/2': os2, 'post': post}

    tags = sorted(tables)
    offset = 12 + 16 * len(tags)
    directory = b''; data = b''; head_off = None
    for t in tags:
        d = tables[t]
        pad = (4 - len(d) % 4) % 4
        directory += struct.pack('>4sIII', t.encode('latin-1'), checksum(d), offset, len(d))
        if t == 'head':
            head_off = offset
        data += d + b'\0' * pad
        offset += len(d) + pad

    n = len(tags)
    es = int(math.log2(n)); sr = 16 * (2 ** es); rs = n * 16 - sr
    sfnt = bytearray(struct.pack('>IHHHH', 0x00010000, n, sr, es, rs) + directory + data)
    adj = (0xB1B0AFBA - checksum(bytes(sfnt))) & 0xFFFFFFFF
    sfnt[head_off + 8:head_off + 12] = struct.pack('>I', adj)
    open(path, 'wb').write(bytes(sfnt))
    return path


if __name__ == '__main__':
    out = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'wbfont.ttf')
    build(out)
    print('built', out, os.path.getsize(out), 'bytes; glyphs:', len(GLYPHS))
