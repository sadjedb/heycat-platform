# HEYCAT Digital — platform

The HEYCAT website plus a management system behind it. The public site is the
one that already existed; everything it shows now comes out of a database the
café owner edits themselves.

The original project is untouched at `../heycat/`. This is a separate copy.

---

## Run it

```bash
npm install
cp .env.example .env          # then fill in AUTH_SECRET (see below)
npx prisma generate           # build the typed client
npx prisma migrate deploy     # create the database
npm run db:seed               # load the café's real content + the first admin
npm run dev                   # http://localhost:3000
```

Production:

```bash
npm run build
npm start
```

### Environment variables

| Variable | Required | What it is |
| --- | --- | --- |
| `DATABASE_URL` | yes | `file:./dev.db` for SQLite, or a Postgres URL |
| `AUTH_SECRET` | yes | 32+ random bytes, base64. Signs nothing yet but reserved for cookie signing; **change it before deploying** |
| `NEXT_PUBLIC_SITE_URL` | yes | Real origin. Feeds `metadataBase`, `robots.txt`, `sitemap.xml` |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | no | Override the seeded login |
| `UPLOAD_DIR` | no | Where dashboard uploads are written. Defaults to `public/uploads`. Set it to a path outside the project if you deploy into a fresh directory each time, so photographs survive a redeploy |
| `NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY` | no | Only if you want a keyed Maps embed; the location block works without it |

Generate a secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Admin access

`http://localhost:3000/admin`

The seed creates **`owner@heycat.local` / `heycat-change-me`**. Change it
immediately — it is printed in the seed output precisely so it is not forgotten.
If the `Admin` table is empty, `/admin/login` turns into a first-run setup screen
instead, and the first account created becomes the owner.

### npm scripts

| Script | Does |
| --- | --- |
| `db:migrate` | Create/apply a migration in development |
| `db:deploy` | Apply existing migrations (use in production) |
| `db:seed` | Load the café's content. Idempotent — upserts by slug |
| `db:studio` | Prisma's data browser |
| `db:reset` | Drop and rebuild. Destroys everything |

---

## Deploying to a VPS

Running behind nginx with `next start` is the deployment this is built for.
Redeploying after a change:

```bash
git pull                      # or copy the files across
npm install                   # only if dependencies changed
npx prisma migrate deploy     # only if there are new migrations
npm run build                 # required: the server serves the build, not the source
# then restart the process (systemd, pm2, docker — whatever runs it)
```

**`npm run build` is not optional.** `next start` serves the last build; editing
a file on the server changes nothing until it is rebuilt.

### Two things that only break once it leaves a laptop

Both of these were found on the live site and are fixed in this code. They are
written down because the symptoms are confusing and the causes are invisible
locally.

**Server Action request bodies are capped at 1MB by default.** Uploads go
through a Server Action, so every photograph off a phone was rejected by the
framework before the app's own 8 MB check ever ran — and the rejection is a bare
`500 Internal Server Error`, with nothing in the dashboard explaining it.
`next.config.ts` now sets `experimental.serverActions.bodySizeLimit` to `12mb`,
comfortably above the app's own 8 MB limit so that oversized files get a
sentence instead of a crash.

**Files written into `public/` after the build are never served.** Next decides
what lives in `public/` when the project is built, so an uploaded image landed
on disk correctly and then 404'd — a successful upload that renders as a broken
image. `next dev` reads the folder on every request, which is exactly why this
cannot be reproduced locally. Uploads are now served by
`src/app/uploads/[...path]/route.ts`, which reads them off disk at request time.
That route is also what makes `UPLOAD_DIR` work.

### nginx

No special configuration is needed beyond a normal proxy. One setting matters:

```nginx
client_max_body_size 12m;   # must be at least the bodySizeLimit above
```

If it is lower than the upload limit, nginx rejects large uploads with its own
`413` before the app sees them. (On the current host it is already generous
enough — a 13 MB body reaches the app.)

### If uploads live outside the project

Set `UPLOAD_DIR=/var/lib/heycat/uploads`, create it, and give it to the user the
server runs as:

```bash
sudo mkdir -p /var/lib/heycat/uploads
sudo chown -R <the-user-node-runs-as> /var/lib/heycat/uploads
```

Nothing else changes — the route above serves it. If you would rather nginx
served those files directly, add a location block ahead of the proxy:

```nginx
location /uploads/ {
  alias /var/lib/heycat/uploads/;
  access_log off;
  expires 1y;
}
```

A folder the server cannot write to no longer produces a 500: the dashboard
says which directory it tried and that it needs write access.

### Server Action IDs across rebuilds

Next rotates Server Action IDs between builds, so a browser tab left open on the
old build gets "Failed to find Server Action" after a redeploy — a reload fixes
it. Setting `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` to a fixed value keeps the IDs
stable across builds, which matters more if the app is ever run as more than one
process behind a load balancer.

---

## What the owner can do without a developer

Everything below is wired end to end — saved in the dashboard, visible on the
public site immediately.

| Area | They can |
| --- | --- |
| **Menu** | Add/edit/delete categories and items, change prices, reorder, mark sold out with one click, add photos, set flavour variants, manage the OPTIONS add-ons, write all three languages |
| **Cats** | Add/edit/remove, photos, the trait list per language, adoption status and note, publish/hide, reorder |
| **Floor plan** | Add/edit/remove tables, set seats, shape, zone and position, close a table for the day, see a live preview of the room |
| **Reservations** | See pending first, filter and search, confirm / decline / cancel / complete, **assign or change the table**, internal notes, call or WhatsApp the guest in one click |
| **Today at HEYCAT** | Set the day's feature with photo and price; schedule future dates |
| **Events** | Create, publish/unpublish, photo, date, time, location, a CTA link |
| **Boutique** | Shelves (categories) with their own note, products on them, a main photograph plus an ordered gallery, optional price, reference/SKU, material-and-care details, stock state in one click from the list, feature a product, reorder within a shelf, hide a product or a whole shelf |
| **Media** | Upload JPEG/PNG/WebP/GIF up to 8 MB, set alt text per language, delete |
| **Settings** | Address, phone, email, WhatsApp number, opening hours, Google Maps link and embed, social links, reservation rules, which sections appear, house rules / reservation / adoption text |
| **Analytics** | Page views, menu opens, reservations, WhatsApp and Instagram clicks, language split, most-opened items, 7/30/90 day ranges |

---

## Architecture

```
src/
  app/
    [lang]/          public site — fr · en · ar, homepage + /menu + /boutique + 404
    admin/           dashboard, its own root layout
    api/track/       the analytics beacon
  components/        the original site's components, now taking data as props
  components/admin/  admin UI kit + media picker
  data/              the original static content — now reference only, read by the seed
  generated/prisma/  generated client (git-ignored)
  i18n/              en.ts · fr.ts · ar.ts, plus locales.ts
  lib/               db · auth · settings · content · analytics · upload · reservations
prisma/              schema.prisma · migrations · seed.ts
```

### Decisions worth knowing

**SQLite by default.** One café, a few hundred rows, and it has to run with no
cloud account and no Docker. Nothing is SQLite-specific beyond the provider —
point `DATABASE_URL` at Postgres, change one line in `schema.prisma`, migrate.

**No auth library.** The requirement is "one or two staff log in with a
password". `node:crypto` scrypt plus an opaque token in an HttpOnly cookie
covers it with no dependency to keep patched. Sessions live in the database so
that revoking one actually revokes it.

**Translations are JSON columns**, shaped `{ fr, en, ar }`, not a join table.
One café, three locales, and the admin edits all three on one screen. A missing
locale falls back to French rather than rendering blank. `src/lib/i18n-field.ts`
is the only module that knows the shape.

**The floor plan is data, not a picture.** Tables are rows with a percentage
position, drawn as SVG in the site's palette. An image with clickable hotspots
would have been quicker and would have gone stale the first time the café moved
a table — and it could not have carried live availability.

**The boutique is a catalogue, not a checkout.** The café is a physical
counter in Algeria; no payment provider was asked for and none is configured. A
cart that cannot take money is worse than an honest "ask us", so every product
links through to WhatsApp with its own name already in the message. Adding
payment later means a provider account and the café's decision, not a rewrite:
products already carry price, stock and a reference.

**Hiding a shelf hides what sits on it.** Products on a hidden category drop out
of the shop, out of the homepage rail, and their own pages 404 — rather than
staying quietly reachable by URL. Deleting a shelf does the opposite and keeps
its products, which simply become uncategorised and still appear; losing a
product because nobody filed it is the worse failure.

**A booking holds its table for a turn, not a slot.** A 13:00 sitting with a
90-minute turn still holds the table at 14:00. Matching on exact start time
would double-book the same table twice in an hour.

**Caching.** Every public read is wrapped in `unstable_cache` with a tag, and
every admin write expires those tags *and* revalidates the public routes. Both
halves are needed: the menu page is prerendered, and a prerendered page keeps
serving its stored HTML however stale the data cache behind it is. `use cache`
is the eventual successor but needs `cacheComponents: true`, which changes
rendering semantics across the whole app — not worth destabilising a working
site for today.

**The admin is English.** The public site is French-first; the dashboard is not
translated. It is a single `adminT` dictionary away if the owner wants French —
see Limitations.

---

## What is still needed from the café

Nothing on the public site is invented. Every unknown renders as "to be
confirmed", and the dashboard lists what is outstanding on its front page.

| Needed | Where it goes |
| --- | --- |
| Street address + Google Maps link | Settings → Contact, Location |
| Opening hours | Settings → Opening hours |
| Phone number | Settings → Contact |
| **WhatsApp number** | Settings → Contact — every WhatsApp button is hidden until this exists |
| Instagram handle **confirmation** | Settings → Social. `@heycat.dz` was inferred from the reference material, never confirmed. Tick the box once checked |
| Reservation days + time slots | Settings → Reservations. Until these exist the public form is replaced by a WhatsApp prompt |
| Confirm the floor plan matches the real room | Floor plan. Sixteen tables were seeded from the owner's drawing; seat counts for tables 15 and 16 were read off the picture and should be checked |
| Turn time (how long a table is held) | Settings → Reservations. Defaults to 90 minutes |
| House rules text | Settings → policies |
| How reservations work | Settings → policies |
| How adoption works | Settings → policies, and a status per cat under Cats |
| **Boutique prices** | Boutique → each product. Every one is deliberately empty: nothing the café has published prices the shop, so each reads "ask at the counter" until a price is typed in |
| Which boutique photographs belong to which product | Boutique. Five products were seeded from the café's own product shots; the groupings are a reading of the photographs, not a statement from the café |

Two menu questions carried over from the original build:

- **Brunch** and **Bubble & Juice** are not on the café's printed menu. They are
  real — the café photographs them — but nothing prices them, so they show no
  price and say why. Either supply that second card or hide those categories.
- Spanish Latte, Iced Americano, Iced Karkade and the two milkshakes appear on
  neither list. Their photographs are in the media library, unused.

---

## Limitations

Honest list, in rough order of how likely they are to matter.

1. **Uploads are written to local disk** (`public/uploads`, or `UPLOAD_DIR`) and
   served by a route handler. Correct for a single server; on a serverless host
   the filesystem is ephemeral. `saveUpload` in `src/lib/upload.ts` is the one
   function to swap for S3, and `src/app/uploads/[...path]/route.ts` the one to
   delete afterwards.
2. **The admin dashboard is English only.** The owner's language is French. The
   public site is fully trilingual; the dashboard is not. Adding it means one
   dictionary file and threading it the way the public site already does.
3. **Login rate limiting is in-process memory.** It resets on deploy and is
   per-instance. Fine for one server; a second instance wants it in the database.
4. **Analytics counts page views, not people.** There is no cookie and no
   identifier by design — which is also why there is no consent banner. The
   dashboard says so rather than implying unique visitors.
5. **Confirming a reservation does not notify the guest.** It records the
   decision and gives the café one-click call and WhatsApp. Automated SMS or
   email would need a provider account and the café's sign-off.
6. **No Instagram feed.** A curated link-out, deliberately: every unofficial feed
   integration breaks, and the brief asked not to build something fragile.
7. **The homepage is server-rendered rather than static**, because it reads
   `searchParams` to show the reservation result inline. Its data reads are all
   cached, so the per-request work is small. `/[lang]/menu` — the QR-code page,
   where speed matters most — is still fully prerendered.
8. **Arabic is machine-written by me, not a native speaker.** It is Modern
   Standard Arabic and the structure and RTL behaviour are right, but it should
   be read by someone fluent before launch.
9. **No automated test suite.** Verification was done by exercising the running
   app over HTTP (see the QA report).
10. **The boutique cannot take payment** — see "catalogue, not checkout" above.
    It is a decision, not an omission, but it is the first thing to revisit if
    the café wants to sell online.
11. **A product's gallery is ordered by the picker's layout**, not by dragging.
    Already-chosen photographs sort to the front in their saved order and show
    their position, so the sequence is stable and editable; it is not
    arbitrarily rearrangeable without re-ticking.
