#!/usr/bin/env python3
"""Generate Terminaut app icons using only Python stdlib."""
import struct, zlib, math, os, sys

def make_png(w, h, pixels_rgba):
    def crc(data): return struct.pack('>I', zlib.crc32(data) & 0xffffffff)
    def chunk(tag, data):
        c = tag.encode() + data
        return struct.pack('>I', len(data)) + c + crc(c)
    ihdr = chunk('IHDR', struct.pack('>IIBBBBB', w, h, 8, 6, 0, 0, 0))
    raw = bytearray()
    for y in range(h):
        raw += b'\x00'
        for x in range(w):
            raw += bytes(pixels_rgba[y * w + x])
    idat = chunk('IDAT', zlib.compress(bytes(raw), 9))
    return b'\x89PNG\r\n\x1a\n' + ihdr + idat + chunk('IEND', b'')

def lerp(a, b, t): return int(a + (b - a) * t)

def aa_circle(dist, r, edge=1.5):
    """Anti-aliased circle mask 0..255."""
    d = r - dist
    if d >= edge: return 255
    if d <= 0: return 0
    return int(255 * d / edge)

def create_icon(size, path):
    pixels = []
    cx, cy = size / 2, size / 2
    R = size / 2 - max(2, size * 0.02)   # outer circle radius

    # Colour palette
    BG_R, BG_G, BG_B      = 201, 100, 66   # #C96442 orange
    DARK_R, DARK_G, DARK_B = 140,  65, 38   # darker ring
    FG_R, FG_G, FG_B       = 255, 255, 255   # white symbol

    for y in range(size):
        for x in range(size):
            dx, dy = x - cx, y - cy
            dist = math.sqrt(dx * dx + dy * dy)
            mask = aa_circle(dist, R)

            if mask == 0:
                pixels.append([0, 0, 0, 0])
                continue

            # Radial gradient: lighter centre → darker edge
            t = dist / R
            bg_r = lerp(BG_R + 30, DARK_R, t)
            bg_g = lerp(BG_G + 15, DARK_G, t)
            bg_b = lerp(BG_B + 10, DARK_B, t)

            # Normalised coords
            nx = dx / R          # -1..1
            ny = dy / R

            s = size / 256.0

            # ──────── Draw ">_" symbol ────────
            sym = 0.0  # how much white to mix in

            # ">" chevron:  two diagonal bars
            # top-right bar of ">"
            bar_w = 0.08 * s
            bar_len = 0.28 * s
            # translate so chevron is centred-left
            cx2, cy2 = nx + 0.18, ny
            # rotate 45° for top arm
            arm_top = abs(cx2 - cy2) < bar_w and 0 < (cx2 + cy2) < bar_len * 1.5
            arm_bot = abs(cx2 + cy2) < bar_w and 0 < (cx2 - cy2) < bar_len * 1.5
            if arm_top or arm_bot:
                sym = 1.0

            # "_" underline: horizontal bar
            ul_x0, ul_x1 = -0.55, 0.00
            ul_y0, ul_y1 =  0.42 * s, (0.42 + 0.12) * s
            if ul_x0 < nx < ul_x1 and ul_y0 < ny < ul_y1:
                sym = 1.0

            r = lerp(bg_r, FG_R, sym)
            g = lerp(bg_g, FG_G, sym)
            b = lerp(bg_b, FG_B, sym)

            pixels.append([r, g, b, mask])

    os.makedirs(os.path.dirname(path) or '.', exist_ok=True)
    data = make_png(size, size, pixels)
    with open(path, 'wb') as f:
        f.write(data)
    print(f'  ✓  {path}  ({size}×{size})')

print('Generating Terminaut icons…')
base = os.path.join(os.path.dirname(__file__), '..', 'build')
create_icon(1024, os.path.join(base, 'icon.png'))
create_icon(256,  os.path.join(base, 'icon256.png'))
create_icon(64,   os.path.join(base, 'icon64.png'))
print('Done.')
