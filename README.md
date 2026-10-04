# HEYCAT Coffee Shop

The website for HeyCat Coffee Shop, a cat café in Algeria.

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind v4.
Four static pages — a homepage and a full menu, each in French and English —
no runtime data, no UI library.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npx next start
```

Read `BRAND.md` first — it explains where every colour, typeface and motif came
from, so changes can stay in the same language.

## Languages

French leads and English is the twin: the café is in Algeria and writes its own
dish descriptions in French. `/` redirects to `/fr`; `/en` is the same site.

All copy lives in `src/i18n/en.ts` and `src/i18n/fr.ts`. `Dictionary` is derived
from the English file, so a key missing from the French one is a **type error**,
not a blank on the page. Strings interpolate with `{placeholders}` via `fill()` —
they cannot be functions, because the dictionary is passed into Client Components
and has to stay serialisable.

**What is never translated:** anything HeyCat itself published. The wall slogan,
"Thanks for coming.", every menu category and item name, the "For cats" and
"Salted" notes, and all eleven cat cards stay in the café's own words in both
locales. Translating a café's own words would be putting words in its mouth.

Adding Arabic means an RTL pass over every layout, so it is a separate job — not
a third dictionary. `next.config.ts` redirects the bare root; if you later want
to pick a locale from `Accept-Language`, Next 16 does that in `proxy.ts`.

---

## Before this goes live

Nothing on this site is invented. These fields are blank because the reference
material does not contain them — fill them in and the page updates itself.

### `src/data/site.ts`

| Field | Status |
| --- | --- |
| `address`, `mapsUrl` | **needed** — renders "To be confirmed" until set |
| `hours` | **needed** — `[{ days: "Mon – Fri", open: "09:00 – 22:00" }, …]` |
| `phone`, `email` | optional — the row hides the link until set |
| `houseRules` | **needed** — confirmed the café has them; wording not supplied |
| `reservations` | **needed** — confirmed the café takes them; details not supplied |
| `adoption` | **needed** — confirmed the café does this; details not supplied |
| `instagram.handle` / `.url` | **verify** — inferred as `@heycat.dz`; correct it if wrong |

### `src/data/menu.ts`

Hot, Iced and Dessert come from the café's own printed menu (`hey-cat-menu-1.pdf`)
— names, prices, the OPTIONS add-ons and the two "check with our staff" notes,
all transcribed exactly, their spellings included ("Esspurresso", "Chesse Cake",
"Syrop arom"). Each price was paired to its item **by coordinate**, because the
PDF's text layer lists names and prices in different orders; reading it
sequentially silently mismatches several rows.

Two things need a decision from the café:

- **Brunch** and **Bubble & Juice** are not on that menu. They are real — the
  café photographs them, and a "MENU / Brunch & Dessert" card is visible on the
  tables — but they are unpriced here and the page says so rather than guessing.
  Either supply that second card, or drop the categories.
- Some Instagram names differ from the printed menu: the poster reads "Matcha
  Latte" where the menu says "Meowtcha latte", "Catppuccino" vs "Catpuccino",
  "Esspuresso" vs "Esspurresso". The printed menu wins throughout. A few posted
  drinks — Spanish Latte, Iced Americano, Iced Karkade, the milkshakes — are on
  neither list as separate items; their photographs sit unused in `public/img/menu/`.

### `src/data/cats.ts`

Complete and verbatim from the published cat cards. The one edit: Dior's card
reads "Persion", corrected to "Persian" to match the other Persian cards. Shadow
and Choco have no "Fun fact" row on their cards, so they have none here.

### The three confirmed blocks

The café has confirmed it takes **reservations**, runs **adoption**, and has
**house rules** — but has not supplied the wording for any of them. Each is
`null` in `site.ts`, and the Visit section renders the heading plus a line saying
the café is writing it. Drop in an array of strings and the block fills itself in:

```ts
houseRules: [
  "Let sleeping cats sleep.",
  "No picking up — they will come to you.",
],
```

### Deployment

Set `NEXT_PUBLIC_SITE_URL` to the real domain. It feeds `metadataBase`,
`robots.txt` and `sitemap.xml`, so Open Graph URLs and the sitemap resolve.

---

## The asset pipeline

`public/img/` is generated. Do not hand-edit it.

```bash
python scripts/prepare-assets.py     # needs Pillow
```

The script reads `../references/` and does three things:

1. **Crops the posters down to the photography.** HeyCat's menu posters carry
   their own headline typography. The site has its own, so the type is cropped
   off and only the dish or drink survives. Per-image crop fractions live in the
   `DISHES` table; nudge one if a sliver of lettering reappears.
2. **Finds the portrait circle on each cat card** by fitting the faint tinted
   chords it leaves in each column — which ignores both the cat sitting on it and
   the darker ink around it. The crop lines up exactly with the CSS
   `rounded-full` mask. Shadow's and Suny's cards lay the title ribbon over the
   circle, so `RIBBON_NUDGE` drops their top edge clear of it.
3. **Strips the black letterbox bars** the interior screenshots were exported
   with.

Everything is written as WebP, capped at 1600px on the long edge.

`scripts/make-og.py` builds the 1200x630 share card at `public/og.jpg`. It reads
the real Playfair and Fredoka faces out of the woff2 files `next/font` already
downloaded into `.next`, so run `npm run build` once before it. The card is
committed, so this only needs re-running if the wording or photograph changes.

The favicon is `src/app/icon.svg` — the paw mark, drawn from geometry measured
off the vector logo on the printed menu.

`scripts/extract-illustration.py` lifts the flat black cats out of the cat-tower
that spells MENU down the side of the printed card, onto transparency, into
`public/img/art/`. One of them is the 404. They are cut out by flood-filling the
background inward, so the cream shapes *enclosed* by each cat — eyes, whiskers —
survive while the brown letters behind it do not.

### A constraint worth knowing

The interior and exterior photographs are phone screenshots roughly **380px
wide**. The food and cat photography is 900–1600px. That asymmetry drove the art
direction: the hero and the menu lean on the high-resolution material, and the
café itself is a mosaic of modest panels rather than a full-bleed image that
would fall apart on a large screen. If better interior photography arrives, drop
it into `references/interior/`, update `PLACE` in the script, and `the-room.tsx`
can grow.

## Layout

```
src/
  app/
    [lang]/       layout (fonts, metadata, OG), homepage, /menu, 404
    globals.css   design tokens, motion, print rules
    icon.svg      the paw mark as favicon
    robots.ts · sitemap.ts
  components/     brand.tsx holds the paw mark, logo lockup, rule and eyebrow
  data/           cats.ts · menu.ts · site.ts — facts only
  i18n/           en.ts · fr.ts — every translatable string
scripts/          prepare-assets.py · make-og.py · extract-illustration.py
```

`/[lang]/menu` is the standalone menu, built for a QR code on the table: one
flow, no tabs, and `@media print` turns it into a two-column A4 card.

The homepage is one sequence, loud to quiet and back: hero → quiet statement →
the cats → the room → four small details → the boutique → the menu → a dark
invitation → a farewell. `src/app/[lang]/page.tsx` lists it in that order.
