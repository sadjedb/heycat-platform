# HEYCAT — the brand, as read from the references

Everything below was reverse-engineered from the material in `../references/`.
No part of it is a guess about what a cat café "should" look like.

The café's own printed menu, `references/menu/hey-cat-menu-1.pdf`, is the
authoritative source for item names, prices and the logo artwork. Instagram
supplies the photography and the flavour variants. Where the two disagree — and
they do, on several drink names — the printed menu wins.

## What the references actually show

**The name.** The fascia reads `[paw] HEYCAT / COFFEE SHOP`. Not "Hey Cat DZ" —
that is the Instagram handle. The cat cards sign off `heycat / COFFEE SHOP` in
lowercase, so both cases are in use.

**The mark.** A paw whose four toes are coffee beans — each toe carries a centre
crease. It is the single best idea in the identity. The printed menu carries it
as vector art, so the bean centres, their two sizes (the inner pair taller than
the outer), their tilts and the pad's outline profile were all *measured* off it
and rebuilt in `src/components/brand.tsx`. The original is drawn slightly
asymmetric by hand; the web version is symmetrised, which reads as the same mark
and behaves better at 16px. The same geometry draws `src/app/icon.svg`.

**The wall.** `COME WHERE #CATS ARE`, painted in heavy black slab capitals across
a cream wall. That is the headline of this website, because the café already
wrote it.

**The farewell.** A framed poster by the door: a flat-illustrated black cat at a
café table, above `THANKS FOR COMING.` The same illustration is printed on the
yellow tote in the boutique corner.

## Personality, and the evidence for it

The category cliché is pastel, kawaii, cartoon paws. HeyCat is not that.

- **The room is a grown-up hospitality interior.** Travertine, walnut, an
  oxidised-copper counter with a warm LED strip beneath it, arched niches cut
  into cream plaster, black steel Crittall-style glazing, terracotta roofline.
  Sampled colours run espresso `#3F2106`, walnut `#69310E`, caramel `#CAA573`,
  warm sand `#E9CFA2` — no pink anywhere.
- **The play is in the details, not the palette.** Wooden paw prints set into
  white pebbles along the counter. Stools with a cat's head cut out of the seat.
  A washroom mural where the round mirror is the cat's eye. A die-cut menu card
  with two ears. Cold cups with cat-ear dome lids. Plates that say "Hello!" and
  "Who?" on the rim.
- **The food photography is genuinely editorial.** Raking golden light, palm
  shadows on warm sand linen, an overhead plate, a high-contrast serif headline,
  and a hairline rule broken by a small paw. That rule is reused here as the
  site's section divider.
- **The voice is warm and punning, and bilingual.** Item names are English puns
  — Catpuccino, Esspurresso, Meowchiato, Meowtcha latte, Meowmon Bagel,
  Purrfect Cherry Brioche, The Forbidden Paw. Descriptions are French: *"Bagel, fromage du chef, salade de
  roquette, tomates cerises, saumon fumé."* Dessert bands read "Meow, unwrap me."
- **The cats are characters, not décor.** Eleven of them, each with a published
  card: a studio portrait on a circle, a title ribbon — *The king of HeyCat*,
  *The princess of HeyCat*, *The little judge of HeyCat* — a breed, a short spec
  list, a fun fact. Shadow is the son of Yulia and best friends with Choco. That
  is the most distinctive thing this café owns.

**In five seconds the site should say:** a real, warm, grown-up café in Algeria
where eleven named cats actually live, and where the food is worth the trip on
its own.

## The system

Tokens live in `src/app/globals.css` under `@theme`.

| Role | Token | Value | Where it came from |
| --- | --- | --- | --- |
| Page | `cream` | `#f9f4ee` | the exact background of HeyCat's own cat cards |
| Surface | `shell` | `#f2eae0` | lit plaster |
| Ink | `espresso` | `#241610` | their print is warm near-black, never pure black |
| Primary | `cocoa` | `#43291a` | the title ribbon on every cat card |
| Muted | `taupe` / `mist` | `#7b6552` / `#a08f7e` | travertine and boucle |
| Accent | `gold` | `#b8862b` | the LED wash under the counter |
| Accent | `rust` | `#8c4a26` | the oxidised counter itself |
| Flavours | `matcha` `hibiscus` `berry` `ube` `citrus` `banana` | — | sampled from their own drink posters |

**Type.** Playfair Display for display — it is what their brunch and dessert
posters are set in. Fredoka for the wordmark and UI, the closest available match
to the rounded geometric sans on the fascia and the cups. Inter for running text.
Caveat for the handwritten cat names, echoing the doodled hearts on the cards.

**Motifs, and where each is used.**

| Motif | In the café | On the site |
| --- | --- | --- |
| Paw with coffee-bean toes | logo, wall relief | `PawMark`, footer, buttons |
| Hairline + paw | under every poster headline | `PawRule` section divider |
| Arch | doorways, retail niches, LED arcs | the hero image mask |
| Circle | cat tunnels, mirror-eye, their own cat cards | every cat portrait |
| Flavour colour-coding | one colour per drink poster | tints the paw standing in for an unphotographed item |
| Paw prints in pebbles | floor inlay at the counter | the footer's row of paws |
| Flat black cats | climbing the word MENU on the printed card | the 404 page |

**Motion.** One vocabulary: slow, weighted, never bouncy. A scroll reveal that
settles rather than pops, a continuous residents strip that pauses on hover, and
a slow image scale on hover. All of it sits inside
`@media (prefers-reduced-motion: no-preference)`, so with motion reduced nothing
moves, nothing is hidden, and the strip becomes an ordinary scroller.

## What was deliberately not done

- The site is not an Instagram feed on a page. The posters' baked-in typography
  is **cropped away** by `scripts/prepare-assets.py` so the site sets its own
  type over their photography.
- No pastel, no cartoon cats, no paw-print wallpaper, no glassmorphism, no
  fabricated reviews, statistics or awards.
- No invented facts. See `README.md` for the list of fields awaiting the café.
- The menu is not a grid of photo cards. It is a priced list, the way the café
  prints it, because a grid buries the prices and cannot hold the eight items
  that have no photograph at all.
- The café's own words are never translated — see `README.md` under Languages.
