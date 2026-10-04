# QA report — HEYCAT Digital

Run against a production build (`npm run build && next start`) on 2026-10-04,
re-run in full after the boutique was added.
Everything below was executed against the running app over HTTP, driving the
real Server Actions — not inspected in source.

The browser extension was unavailable for this session, so there is **no visual
or responsive sign-off**. See "Not verified" at the end.

---

## Build

| Check | Result |
| --- | --- |
| `tsc --noEmit` | clean |
| `eslint src` | clean |
| `next build` | compiles, 28 routes generated |
| Static | `/{fr,en,ar}/menu` and `/{fr,en,ar}/boutique` prerendered |
| Dynamic | homepage + all admin, as intended |

---

## Customer journey

| Step | Result |
| --- | --- |
| `/` redirects to `/fr` | 307 → `/fr` |
| `/fr`, `/en`, `/ar` | 200 |
| `/fr/menu`, `/ar/menu` | 200 |
| Unknown path | 404 |
| `<html lang dir>` | `fr`/ltr, `en`/ltr, **`ar`/rtl** |
| Arabic actually renders | nav, hero, residents, visit, menu, reserve, footer all present in Arabic |
| Brand English preserved in Arabic | "Come", "#cats are", "Thanks for coming", "Catpuccino", "Esspurresso" all still English |
| Reservation submitted | 303 → `/fr?reserved=1#reserve`, row written, status `pending` |
| Reservation: unavailable time | rejected, French error returned |
| Reservation: past date | rejected, French error returned |
| Reservation: 40 guests (max 8) | rejected, French error returned |
| Analytics beacon, valid event | 200, row stored |
| Analytics beacon, junk event type | 400, nothing stored |

---

## Admin journey

| Step | Result |
| --- | --- |
| Every admin route, signed out | 307 → `/admin/login` |
| Every admin route, signed in | 200 (11 pages checked) |
| Expired session | 307 → `/admin/login` |
| **Change a price 650 → 780** | **visible on `/fr/menu` and `/ar/menu` immediately** |
| Toggle "sold out" | `available` flipped in one click from the category list |
| Confirm a reservation | `pending` → `confirmed`, dashboard updated |
| Invalid status (`status=owner`) | rejected, "Unknown status." |
| Save reservation rules | stored; public booking form appeared as a result |
| Empty states | admin events shows "No events yet"; public events section renders nothing |

---

## Floor plan and table booking

| Check | Result |
| --- | --- |
| 16 tables / 50 seats seeded from the owner's plan | yes |
| `/api/availability` returns all 16 with states | yes |
| Party of 4: the seven 2-seaters report `too-small` | tables 1, 2, 10, 11, 12, 15, 16 |
| Book table 7 at 13:00 | accepted, stored against the table |
| Table 7 at 13:00 afterwards | `taken` |
| **Table 7 at 14:00** (90-minute turn) | **`taken`** — the turn is honoured, not just the slot |
| Table 7 at 17:00 | `free` again |
| Second guest takes table 7 at 13:00 | rejected: "Cette table vient d'être prise." |
| Party of 4 forces a 2-seater | rejected: "Cette table est trop petite pour votre groupe." |
| Slot buttons show free-table counts | 16 → 8 after one booking of a 4-seater |
| Admin reservations list shows the table | column reads `7` |
| Admin reservation detail: table selector | 17 options, 7 disabled as unavailable, current one pre-selected |
| Admin floor plan page + live preview | 200, renders |
| Arabic: plan title, entrance, cat zone, bar, calendar note | all present, `dir="rtl"` |

### Fixed during this round

**Cascading re-renders in the booking form.** Clearing a no-longer-free table
selection was done with `setState` inside an effect, which re-rendered on every
availability poll. Caught by lint; now derived during render instead.

---

## The boutique

70 checks, all passing. Every write below posted a real Server Action the way a
browser with JavaScript disabled would — multipart body, the action's own
`$ACTION_ID_*`, the session cookie.

### Customer side

| Check | Result |
| --- | --- |
| `/fr/boutique`, `/en/boutique`, `/ar/boutique` | 200, prerendered |
| Products grouped under their shelf headings | yes, with each shelf's note |
| Every product page | 200 (5 seeded products) |
| Unknown product slug | 404 |
| Arabic shop | `dir="rtl"` |
| Sitemap | 72 boutique URLs — index plus every product, across all three locales |
| A product with no price | reads "ask at the counter", and its JSON-LD omits the offer rather than publishing a zero |
| Gallery | main photograph plus extras, stacked |
| Product JSON-LD | `Product` with offer only when a price exists |

### Admin side

| Check | Result |
| --- | --- |
| Shelves page signed out | 307 → `/admin/login` |
| Admin boutique list | grouped by shelf, gallery counts, featured and hidden badges, reorder arrows |
| Create a shelf (3 languages + note) | saved, appears on the public shop with its note |
| Create a product with a gallery, SKU, details, featured | saved, public page carries all of it |
| **Change a price 900 → 1250** | **visible on the product page, the shop index and `/ar/boutique` immediately** |
| Save with no gallery ticked | every extra photograph removed — the deselect-all path |
| Stock state from the list | one click cycles in stock → low → out → hidden |
| Reorder within a shelf | accepted; the end of the shelf reports "Already at the end" |
| **Hide a shelf** | **its products leave the shop, leave the homepage rail, and their own pages 404** |
| Un-hide it | everything comes back |
| **Delete a shelf that has products** | **the products survive as uncategorised and still appear in the shop** |
| Delete a product | gone from the shop, its page 404s |
| Nameless product | rejected, "A product needs a name." |
| Nameless shelf | rejected, "A category needs a name." |
| Stock state `owner` | rejected, "Unknown stock state." |
| Price `-5` | rejected, "That price does not look right." |
| POST a product write with a valid action ID and **no session** | 303 → `/admin/login`, nothing written |
| Same for a shelf write | 303 → `/admin/login` |

### Regression after the change

| Check | Result |
| --- | --- |
| All 13 admin pages | 200 |
| All 6 public pages | 200 |
| A menu price change still reaches `/fr/menu` | yes, and reverting works |
| `/api/availability` | 200 |
| Database after the run | back to the seeded five products, two shelves, 11 cats, 49 menu items, 16 tables |

---

## Security

| Check | Result |
| --- | --- |
| POST a Server Action with a **valid action ID but no session** | 303 → `/admin/login`, **database unchanged** |
| POST with no action ID | 500 from Next's router, database unchanged |
| Expired session cookie | rejected |
| Password storage | scrypt, random 16-byte salt, `timingSafeEqual` compare |
| Unknown email at login | still runs a hash, so timing does not reveal whether an account exists |
| Login rate limit | 8 attempts / 10 min, keyed on IP **and** email |
| Session tokens | only the SHA-256 is stored, so a database copy yields no live sessions |
| Upload validation | magic-byte sniffing, not the filename; random stored name; 8 MB cap |
| Admin pages | `robots: noindex, nofollow, nocache` |
| Analytics endpoint | fixed allow-list of event names |

---

## Accessibility

Measured on `/ar` (the hardest case — RTL plus a different script).

| Check | Result |
| --- | --- |
| Images | 140, **0 missing alt** |
| Headings | exactly one `<h1>`, 7 `<h2>` |
| Buttons without an accessible name | 0 |
| `lang` on `<html>` | correct per locale |
| Admin forms | every input labelled; reorder buttons carry `aria-label` naming the row |
| Keyboard | admin is plain forms — works without JavaScript entirely |
| Motion | all animation inside `prefers-reduced-motion: no-preference` |

---

## Bugs found and fixed during QA

**1. Cache invalidation never ran.** `guard()` called `invalidate()` on the line
after `await work()`, but every action ends in `done()`/`fail()`, which call
`redirect()`, which signals by throwing. So the line was unreachable: prices
saved to the database and the public site kept serving the old prerender. Found
by changing a price and watching the menu refuse to budge. Fixed by moving the
invalidation into a `finally`.

**2. Tag invalidation alone was not enough.** Even once `invalidate()` ran,
expiring the data-cache tag did not change a prerendered page. `invalidate()`
now also calls `revalidatePath` for `/[lang]` and `/[lang]/menu`.

**3. A hidden shelf leaked its products.** The admin screen says hiding a
category hides what sits on it. It did not: those products dropped out of
`/boutique` (they matched no visible group) but stayed in the homepage rail and
their own pages still rendered. `loadProducts` now requires the category to be
published, or absent.

**4. The boutique was not in the revalidation list.** `invalidate()` revalidated
`/[lang]` and `/[lang]/menu` only, and `/[lang]/boutique` is prerendered — so a
price saved in the dashboard would have been correct in the database and stale
on the shop page. Exactly bug 2 again, in a route that did not exist when bug 2
was fixed. Both boutique paths are now in the list.

**5. A duplicate name returned a 500.** Slugs are unique in the database and
were generated straight from the name, so a second "Latte", or re-adding
something deleted, hit a unique-constraint violation and the owner got an error
page instead of a saved record. This affected products, boutique shelves, menu
categories, menu items, cats and events — all six now go through
`uniqueSlug()`, which appends `-2`, `-3` and so on. Verified by saving the same
product, the same menu category and the same cat twice each: all six saved, with
distinct slugs and working pages.

The first four were real, would all have shipped silently, and every one of them
broke the same promise — that what the owner types in the dashboard is what the
customer sees. The fifth would have turned an ordinary day behind the counter
into a 500.

---

## Not verified

- **No visual check at any breakpoint.** The browser tooling was unavailable.
  Mobile, tablet, desktop and the RTL layout have been verified structurally
  (`dir`, logical properties, mirrored marquee and portrait origin) but nobody
  has looked at them. **Do this before showing the client.**
- **Arabic wording** — machine-written, needs a fluent reader.
- Media upload was verified by unit-level reasoning and the validation path, not
  by pushing a real file through the browser form.
- The boutique was verified over HTTP, like everything else here: no one has
  looked at the shop index, a product page or the gallery stack in a browser.
- No load or concurrency testing.
