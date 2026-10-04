#!/usr/bin/env python
"""
Turn the raw Instagram reference exports into web assets.

The reference posters carry HeyCat's own baked-in typography. The website has its
own typographic system, so we crop the posters down to the *photography* and let
the site set the type. Cat cards are cropped to the portrait circle they already
use. Interior screenshots are stripped of their letterbox bars.

Run from heycat/:  python scripts/prepare-assets.py
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
REFS = ROOT.parent / "references"
OUT = ROOT / "public" / "img"

MAX_EDGE = 1600

# Cat-card portrait circle, as fractions of the card. Measured across the set.
TEMPLATE_CX, TEMPLATE_CY, TEMPLATE_D = 0.507, 0.421, 0.629

# Cards whose title ribbon overlaps the portrait circle, as a fraction of the
# diameter to drop the top edge by.
RIBBON_NUDGE = {"shadow": 0.13, "suny": 0.10}
QUALITY = 82


def save(im: Image.Image, rel: str) -> str:
    dest = OUT / rel
    dest.parent.mkdir(parents=True, exist_ok=True)
    im = im.convert("RGB")
    if max(im.size) > MAX_EDGE:
        scale = MAX_EDGE / max(im.size)
        im = im.resize((round(im.width * scale), round(im.height * scale)), Image.LANCZOS)
    im.save(dest, "WEBP", quality=QUALITY, method=6)
    return f"/img/{rel}"


def crop_frac(im: Image.Image, left=0.0, top=0.0, right=1.0, bottom=1.0) -> Image.Image:
    w, h = im.size
    return im.crop((round(w * left), round(h * top), round(w * right), round(h * bottom)))


def trim_letterbox(im: Image.Image, dark: int = 30, share: float = 0.94) -> Image.Image:
    """
    Drop the black bars the phone screenshots were exported with. The bars carry a
    little UI chrome and compression noise, so a band counts as a bar when almost
    all of it is dark rather than when it is perfectly flat.
    """
    g = im.convert("RGB").convert("L")
    w, h = g.size
    px = g.load()
    xs = range(0, w, max(1, w // 200))
    ys = range(0, h, max(1, h // 200))

    def row_bar(y: int) -> bool:
        vals = [px[x, y] for x in xs]
        return sum(v < dark for v in vals) >= share * len(vals)

    def col_bar(x: int) -> bool:
        vals = [px[x, y] for y in ys]
        return sum(v < dark for v in vals) >= share * len(vals)

    top, bottom, left, right = 0, h - 1, 0, w - 1
    while top < bottom and row_bar(top):
        top += 1
    while bottom > top and row_bar(bottom):
        bottom -= 1
    while left < right and col_bar(left):
        left += 1
    while right > left and col_bar(right):
        right -= 1
    if right - left < w * 0.25 or bottom - top < h * 0.25:
        return im
    return im.crop((left, top, right + 1, bottom + 1))


def portrait_circle(im: Image.Image, slug: str = "") -> Image.Image:
    """
    Cat cards place the portrait on a soft tinted circle. Find that circle so the
    web portrait lines up exactly with a CSS `rounded-full` mask.

    The circle is only a few levels darker than the page, so we look for pixels in
    that narrow band. Dark ink (the name, the ribbon, the spec list) falls below it
    and is ignored, and the small tinted spec icons are too narrow to pass the
    coverage thresholds.
    """
    w, h = im.size
    band_top, band_bot = round(h * 0.16), round(h * 0.72)
    g = im.convert("RGB").convert("L")
    px = g.load()
    bg = px[4, 4]
    lo, hi = bg - 45, bg - 3

    def tinted(v: int) -> bool:
        return lo < v < hi

    def finish(cx: float, cy: float, diameter: float) -> Image.Image:
        """
        Crop the square the CSS circle will mask, applying the ribbon nudge. Both
        the measured and the fallback path end up here, so the nudge is applied
        either way.
        """
        top = cy - diameter / 2
        nudge = RIBBON_NUDGE.get(slug, 0.0)
        if nudge:
            # Drop the top edge and shrink to match, keeping the bottom put.
            bottom = top + diameter
            top += diameter * nudge
            diameter = bottom - top
        half = diameter / 2
        return im.crop(
            (
                max(0, round(cx - half)),
                max(0, round(top)),
                min(w, round(cx + half)),
                min(h, round(top + diameter)),
            )
        )

    def template() -> Image.Image:
        """Ten of the eleven cards measure within a whisker of these fractions."""
        return finish(TEMPLATE_CX * w, TEMPLATE_CY * h, TEMPLATE_D * w)

    def longest_run(values, inside, max_gap: int = 0) -> tuple[int, int]:
        """
        Longest stretch satisfying `inside`, as (start, end). A run survives up to
        `max_gap` consecutive failures: the faintest circle is dithered close
        enough to the page tone that a strict run snaps in the middle of it.
        """
        best = (0, 0)
        start = last = None
        for i, v in enumerate(values):
            if inside(v):
                if start is None:
                    start = i
                last = i
            elif last is not None and i - last > max_gap:
                if last + 1 - start > best[1] - best[0]:
                    best = (start, last + 1)
                start = last = None
        if last is not None and last + 1 - start > best[1] - best[0]:
            best = (start, last + 1)
        return best

    # Fit the circle from the tinted chords it leaves in each column.
    #
    # Only the circle's own tone counts, so the cat sitting on top of it is
    # irrelevant, and so are the name, the ribbon and the spec list — all of which
    # are darker ink. A chord has to be a reasonable fraction of the card tall,
    # which rejects the little tinted icons beside each spec row.
    min_chord = round(h * 0.05)
    chords: list[tuple[int, int, int]] = []
    for x in range(0, w, 2):
        col = [px[x, y] for y in range(band_top, band_bot)]
        start, end = longest_run(col, tinted, max_gap=round(h * 0.012))
        if end - start >= min_chord:
            chords.append((x, band_top + start, band_top + end))

    if len(chords) < 40:
        return template()

    left, right = chords[0][0], chords[-1][0]
    top = min(c[1] for c in chords)
    bottom = max(c[2] for c in chords)
    cx, cy = (left + right) / 2, (top + bottom) / 2
    # Prefer the vertical extent: the horizontal one can be clipped where the cat
    # covers the circle's own tone right out to the edge.
    diameter = max(bottom - top, right - left)

    if not (0.52 < diameter / w < 0.82) or abs(cx / w - 0.5) > 0.07:
        return template()

    return finish(cx, cy, diameter)


# ---------------------------------------------------------------- source tables

CATS = {
    "amira": "762902526",
    "stella": "763308554",
    "violetta": "764382544",
    "zola": "765035078",
    "dior": "765059271",
    "mishka": "765059272",
    "honey": "765187232",
    "suny": "765187441",
    "bouboule": "765198488",
    "shadow": "765214282",
    "choco": "765886721",
}

# slug -> (folder, id fragment, top crop fraction)
DISHES = {
    # BRUNCH — headline sits in the top third, dish below
    "big-suny-breakfast":      ("BRUNCH", "702637885", 0.26),
    "royal-cat-burrata":       ("BRUNCH", "702201178", 0.30),
    "ocean-cat-toast":         ("BRUNCH", "702383812", 0.30),
    "avocado-paw-toast":       ("BRUNCH", "702545592", 0.30),
    "the-forbidden-paw":       ("BRUNCH", "702877205", 0.32),
    "velvet-shrimp-croissant": ("BRUNCH", "703157672", 0.30),
    "happy-shadow-toast":      ("BRUNCH", "703227560", 0.28),
    "heycat-salad":            ("BRUNCH", "703247543", 0.28),
    "mischief-perla-toast":    ("BRUNCH", "703317966", 0.30),
    "berry-meow-toast":        ("BRUNCH", "703382700", 0.30),
    "kitty-bliss-bowl":        ("BRUNCH", "703467974", 0.30),
    "meowmon-bagel":           ("BRUNCH", "749584747", 0.4),
    "purrfect-cherry-brioche": ("BRUNCH", "749665517", 0.4),
    # DESSERTS — headline top ~0.30, plate below
    "chocolate-cookie":        ("DESERTS", "701444896", 0.34),
    "hazelnut-tiramisu":       ("DESERTS", "702298672", 0.32),
    "pistachio-cookie":        ("DESERTS", "702305247", 0.32),
    "classic-tiramisu":        ("DESERTS", "702353072", 0.32),
    "san-sebastian-cheesecake":("DESERTS", "702501908", 0.36),
    "matilda-cake":            ("DESERTS", "702604186", 0.34),
    "raspberry-cookie":        ("DESERTS", "702702749", 0.34),
    "hazelnut-cookie":         ("DESERTS", "702800709", 0.34),
    "pistachio-tiramisu":      ("DESERTS", "703199236", 0.30),
    # HOT DRINKS — cup sits low, headline is a small kraft label in-frame
    "affogato":                ("HOT DRINKS", "698296873", 0.10),
    "spanish-latte-hot":       ("HOT DRINKS", "698583403", 0.10),
    "matcha-latte-hot":        ("HOT DRINKS", "698606695", 0.10),
    "americano-hot":           ("HOT DRINKS", "698736852", 0.10),
    "catppuccino":             ("HOT DRINKS", "700245921", 0.10),
    "cream-cheese-hot-chocolate": ("HOT DRINKS", "700266939", 0.10),
    "esspuresso":              ("HOT DRINKS", "700723506", 0.10),
    # ICED DRINKS
    "iced-spanish-latte":      ("ICED DRINKS", "696510393", 0.36),
    "iced-matcha":             ("ICED DRINKS", "696767943", 0.28),
    "iced-tiramisu-matcha":    ("ICED DRINKS", "698283606", 0.28),
    "strawberry-acai":         ("ICED DRINKS", "698283623", 0.32),
    "iced-latte":              ("ICED DRINKS", "698283633", 0.30),
    "iced-americano":          ("ICED DRINKS", "698296819", 0.26),
    "iced-tiramisu-latte":     ("ICED DRINKS", "698324801", 0.38),
    "milkshake-banane":        ("ICED DRINKS", "700343347", 0.32),
    "iced-karkade":            ("ICED DRINKS", "700657913", 0.28),
    "milkshake-strawberry":    ("ICED DRINKS", "700907129", 0.34),
    # BUBBLE DRINKS
    "iced-blueberry-bubble-matcha": ("BUBBLE DRINKS", "697100367", 0.40),
    "iced-strawberry-bubble-matcha": ("BUBBLE DRINKS", "700135279", 0.40),
    "iced-bubble-ube":         ("BUBBLE DRINKS", "700581291", 0.30),
    "iced-bubble-matcha":      ("BUBBLE DRINKS", "700723485", 0.28),
    "iced-bubble-tea":         ("BUBBLE DRINKS", "702590043", 0.28),
    # JUICE
    "strawberry-juice":        ("JUICE", "702930463", 0.4),
    "cocktail-juice":          ("JUICE", "703181520", 0.4),
    "orange-juice":            ("JUICE", "703335632", 0.45),
    "banana-juice":            ("JUICE", "703587713", 0.4),
}

PLACE = {
    "cat-pod":        "interior/asfasfasfasfasfasf.png",
    "cat-shelves":    "interior/asfasffasasfsfasfas.png",
    "dining-room":    "interior/caca.png",
    "thanks-poster":  "interior/faasffas.png",
    "washroom":       "interior/fsafasf as.png",
    "heycat-wall":    "interior/fsafasfasfasf.png",
    "menu-card":      "interior/fsafasfasfasfasfasf.png",
    "climbing-wall":  "interior/fsafasfasfasfasfasfasfasfas.png",
    "counter":        "interior/fsafasfasfasfasfasfasfsa.png",
    "terrace":        "interior/svafvasvas v.png",
    "boutique":       "interior/fasfasfasfasfas.png",
    "storefront":     "exterior/unnamed.webp",
}

SHOP = {
    # Boutique corner — the café sells cat-shaped tableware and printed goods.
    # Slugs describe what is actually in each frame.
    "spoons": "branding/SaveClip.App_750737890_18101426309595996_6684460571215519510_n.jpg",
    "spoons-dark": "branding/SaveClip.App_751224852_18101426660595996_6222788096810285141_n.jpg",
    "spoons-gold": "branding/SaveClip.App_751469390_18101426558595996_4155285781210250479_n.jpg",
    "cups": "branding/SaveClip.App_752485014_18101454770595996_7587573776397411070_n.jpg",
    "tote": "branding/SaveClip.App_752597134_18101454707595996_6969938772679774761_n.jpg",
    "cat-mug": "branding/SaveClip.App_753205077_18101454800595996_5172306059427780128_n.jpg",
    "cat-bowl": "branding/SaveClip.App_753225406_18101454827595996_3039584396736205981_n.jpg",
}


def find(folder: str, fragment: str) -> Path | None:
    base = REFS / folder
    if not base.exists():
        return None
    for p in sorted(base.iterdir()):
        if fragment in p.name and "(1)" not in p.name:
            return p
    return None


def main() -> int:
    if not REFS.exists():
        print(f"references/ not found at {REFS}", file=sys.stderr)
        return 1

    manifest: dict[str, dict[str, str]] = {"cats": {}, "dishes": {}, "place": {}, "shop": {}}
    missing: list[str] = []

    for slug, frag in CATS.items():
        src = find("cats", frag)
        if not src:
            missing.append(f"cat {slug}")
            continue
        manifest["cats"][slug] = save(
            portrait_circle(Image.open(src), slug), f"cats/{slug}.webp"
        )

    for slug, (folder, frag, top) in DISHES.items():
        src = find(f"menu/{folder}", frag)
        if not src:
            missing.append(f"dish {slug}")
            continue
        manifest["dishes"][slug] = save(crop_frac(Image.open(src), top=top), f"menu/{slug}.webp")

    for slug, rel in PLACE.items():
        src = REFS / rel
        if not src.exists():
            missing.append(f"place {slug}")
            continue
        manifest["place"][slug] = save(trim_letterbox(Image.open(src)), f"place/{slug}.webp")

    for slug, rel in SHOP.items():
        src = REFS / rel
        if not src.exists():
            missing.append(f"shop {slug}")
            continue
        manifest["shop"][slug] = save(Image.open(src), f"shop/{slug}.webp")

    (OUT / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")

    total = sum(len(v) for v in manifest.values())
    print(f"wrote {total} assets to {OUT}")
    for m in missing:
        print(f"  MISSING: {m}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
