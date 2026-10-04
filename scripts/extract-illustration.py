#!/usr/bin/env python
"""
Lift the illustrated cats out of the printed menu.

Page 1 sets the word MENU vertically as a cat tower, with flat black cats on the
letter shelves — real brand illustration that exists nowhere else. This pulls two
of them out onto transparency.

The cats overlap the brown letters, so a colour key would take the letters with
it. Instead the background is flood-filled inward from the border: everything
reachable from the edge that is not the cat's black goes transparent, while the
cream shapes *enclosed* by the cat — its eyes, whiskers and the outline on its
tail — are unreachable and survive.

Run from heycat/:  python scripts/extract-illustration.py
"""
from __future__ import annotations

import collections
import io
import sys
from pathlib import Path

import pymupdf
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
PDF = ROOT.parent / "references" / "menu" / "hey-cat-menu-1.pdf"
OUT = ROOT / "public" / "img" / "art"

# (slug, page, clip in PDF points)
CATS = [
    ("cat-sitting", 0, (24, 212, 128, 378)),
    ("cat-with-cup", 0, (82, 618, 208, 806)),
]

DPI = 420
# The cat is near-neutral black; the letters behind it are a dark but strongly
# saturated brown, so darkness alone would keep them. Both tests must pass.
INK_MAX = 78
INK_CHROMA = 30


def cut_out(img: Image.Image) -> Image.Image:
    """Make everything reachable from the border, and not ink, transparent."""
    img = img.convert("RGBA")
    w, h = img.size
    px = img.load()

    def is_ink(x: int, y: int) -> bool:
        r, g, b, _ = px[x, y]
        return (r + g + b) / 3 <= INK_MAX and max(r, g, b) - min(r, g, b) <= INK_CHROMA

    seen = [[False] * w for _ in range(h)]
    q: collections.deque[tuple[int, int]] = collections.deque()
    for x in range(w):
        for y in (0, h - 1):
            if not is_ink(x, y) and not seen[y][x]:
                seen[y][x] = True
                q.append((x, y))
    for y in range(h):
        for x in (0, w - 1):
            if not is_ink(x, y) and not seen[y][x]:
                seen[y][x] = True
                q.append((x, y))

    while q:
        x, y = q.popleft()
        px[x, y] = (0, 0, 0, 0)
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < w and 0 <= ny < h and not seen[ny][nx] and not is_ink(nx, ny):
                seen[ny][nx] = True
                q.append((nx, ny))
    return img


def trim(img: Image.Image) -> Image.Image:
    box = img.getbbox()
    return img.crop(box) if box else img


def main() -> int:
    if not PDF.exists():
        print(f"menu PDF not found at {PDF}", file=sys.stderr)
        return 1
    OUT.mkdir(parents=True, exist_ok=True)
    doc = pymupdf.open(PDF)

    for slug, page_no, rect in CATS:
        pix = doc[page_no].get_pixmap(dpi=DPI, clip=pymupdf.Rect(*rect))
        img = Image.open(io.BytesIO(pix.tobytes("png")))
        img = trim(cut_out(img))
        if max(img.size) > 900:
            scale = 900 / max(img.size)
            img = img.resize((round(img.width * scale), round(img.height * scale)), Image.LANCZOS)
        dest = OUT / f"{slug}.png"
        img.save(dest, "PNG", optimize=True)
        print(f"{dest.name}: {img.width}x{img.height}, {dest.stat().st_size // 1024} KB")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
