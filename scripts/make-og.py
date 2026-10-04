#!/usr/bin/env python
"""
Build the Open Graph card: public/og.jpg, 1200x630.

A share card is landscape; the site's best photograph is a 3:4 portrait, so it
cannot simply be reused — cropped to 1.91:1 it loses the plate. This composes a
proper card instead: the café's own line on the left, the photograph on the
right, the mark on top.

Fonts are lifted from the woff2 files next/font already downloaded into .next,
so the card is set in the same faces as the site. Run `npm run build` once
first, then:

    python scripts/make-og.py
"""
from __future__ import annotations

import io
import sys
from pathlib import Path

import pymupdf
from fontTools.ttLib import TTFont
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
MEDIA = ROOT / ".next" / "static" / "media"
OUT = ROOT / "public" / "og.jpg"

W, H = 1200, 630
CREAM = (249, 244, 238)
ESPRESSO = (36, 22, 16)
RUST = (140, 74, 38)
TAUPE = (123, 101, 82)

BEANS = [
    (33.5, 22.8, 11.3, 16.2, -14),
    (66.5, 22.8, 11.3, 16.2, 14),
    (13.2, 53.8, 8.7, 12.4, -22),
    (86.8, 53.8, 8.7, 12.4, 22),
]
PAD = (
    "M50 48.6C54.6 48.6 57.6 50.6 58.9 53.2C60.4 56.2 61.4 59.8 63.2 62.8"
    "C66 67.2 71.2 70.4 75.2 73.6C78.4 76.2 81 79.2 81 83.2"
    "C81 87.6 78.8 91.6 75.2 93.9C71.6 96.1 66.6 96.3 63.1 94"
    "C59.2 91.4 54.8 88.6 50 86.9C45.2 88.6 40.8 91.4 36.9 94"
    "C33.4 96.3 28.4 96.1 24.8 93.9C21.2 91.6 19 87.6 19 83.2"
    "C19 79.2 21.6 76.2 24.8 73.6C28.8 70.4 34 67.2 36.8 62.8"
    "C38.6 59.8 39.6 56.2 41.1 53.2C42.4 50.6 45.4 48.6 50 48.6Z"
)


def paw_image(px: int, rgb: tuple[int, int, int]) -> Image.Image:
    """Rasterise the mark with an alpha channel, at the size wanted."""
    beans = "".join(
        f'<g transform="translate({cx} {cy}) rotate({rot})">'
        f'<path d="M0 -{ry}C{rx * 1.27:.2f} -{ry * 0.62:.2f} {rx * 1.27:.2f} '
        f'{ry * 0.62:.2f} 0 {ry}C-{rx * 1.27:.2f} {ry * 0.62:.2f} '
        f'-{rx * 1.27:.2f} -{ry * 0.62:.2f} 0 -{ry}Z"/></g>'
        for cx, cy, rx, ry, rot in BEANS
    )
    hexcol = "#%02X%02X%02X" % rgb
    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 2 100 100">'
        f'<g fill="{hexcol}">{beans}<path d="{PAD}"/></g></svg>'
    )
    doc = pymupdf.open(stream=svg.encode(), filetype="svg")
    pix = doc[0].get_pixmap(alpha=True, dpi=int(px / 100 * 72 * 2))
    img = Image.open(io.BytesIO(pix.tobytes("png"))).convert("RGBA")
    return img.resize((px, px), Image.LANCZOS)


def load_font(family: str, style: str, size: int, weight: int | None = None, needed: str = ""):
    """
    Find the next/font woff2 for a family, convert in memory, and size it.

    next/font splits each face into several unicode-range subsets, so matching on
    the name alone will happily return a file with no Latin in it. Every
    candidate is checked against the characters actually being set.
    """
    wanted = set(needed) - {" "}
    for p in sorted(MEDIA.glob("*.woff2")):
        try:
            f = TTFont(str(p))
        except Exception:
            continue
        name = f["name"]
        fam = name.getDebugName(16) or name.getDebugName(1) or ""
        sub = name.getDebugName(17) or name.getDebugName(2) or ""
        if family.lower() not in fam.lower() or style.lower() != sub.lower():
            continue
        covered = set()
        for table in f["cmap"].tables:
            covered |= {chr(c) for c in table.cmap}
        if not wanted <= covered:
            continue
        buf = io.BytesIO()
        f.flavor = None
        f.save(buf)
        buf.seek(0)
        font = ImageFont.truetype(buf, size)
        if weight is not None:
            try:
                font.set_variation_by_axes([weight])
            except Exception:
                pass
        return font
    raise SystemExit(f"no {family} {style} subset covers {needed!r} — run `npm run build` first")


def main() -> int:
    photo_path = ROOT / "public" / "img" / "menu" / "big-suny-breakfast.webp"
    if not photo_path.exists():
        print("run scripts/prepare-assets.py first", file=sys.stderr)
        return 1

    card = Image.new("RGB", (W, H), CREAM)
    draw = ImageDraw.Draw(card)

    # Right half: the photograph, cropped to fill rather than squeezed.
    panel_x = 660
    pw, ph = W - panel_x, H
    photo = Image.open(photo_path).convert("RGB")
    scale = max(pw / photo.width, ph / photo.height)
    photo = photo.resize((round(photo.width * scale), round(photo.height * scale)), Image.LANCZOS)
    left = (photo.width - pw) // 2
    top = int((photo.height - ph) * 0.42)
    card.paste(photo.crop((left, top, left + pw, top + ph)), (panel_x, 0))

    # Left: the mark, the café's own line, the wordmark.
    x = 76
    card.paste(paw_image(64, ESPRESSO), (x, 74), paw_image(64, ESPRESSO))

    line1, line2, line3 = "Come", "where", "#cats are"
    sub1 = "C O F F E E   S H O P"
    sub2 = "Eleven cats in residence · Algeria"
    serif = load_font("Playfair Display", "Regular", 92, 500, line1 + line3)
    serif_it = load_font("Playfair Display", "Italic", 92, 500, line2)
    brand = load_font("Fredoka", "Regular", 34, 600, "HEYCAT")
    small = load_font("Inter", "Regular", 21, 500, sub1 + sub2)

    draw.text((x, 168), line1, font=serif, fill=ESPRESSO)
    draw.text((x + 13, 262), line2, font=serif_it, fill=ESPRESSO)
    draw.text((x + 26, 356), line3, font=serif, fill=RUST)

    draw.text((x, 486), "HEYCAT", font=brand, fill=ESPRESSO)
    draw.text((x + 2, 530), sub1, font=small, fill=TAUPE)
    draw.text((x, 566), sub2, font=small, fill=TAUPE)

    card.save(OUT, "JPEG", quality=88, optimize=True)
    print(f"wrote {OUT} ({OUT.stat().st_size // 1024} KB)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
