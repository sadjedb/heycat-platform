/*
 * Seed the database from the content the site already shipped with.
 *
 * Everything here comes out of src/data/*.ts, which was itself transcribed from
 * the café's own printed menu and published cat cards. The seed is the one-time
 * migration from "content compiled into the bundle" to "content the owner can
 * edit" — after this runs, src/data/* is reference material only.
 *
 * Safe to re-run: every write is an upsert keyed on slug, so re-seeding restores
 * the café's original wording without duplicating anything. It will overwrite
 * admin edits to seeded records, which is why `npm run db:seed` is a deliberate
 * command and not part of `db:migrate`.
 *
 *   npm run db:seed
 */
import crypto from "node:crypto";
import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { cats } from "../src/data/cats.ts";
import { menu, options } from "../src/data/menu.ts";
import { site } from "../src/data/site.ts";
import { seedTables } from "../src/data/floorplan.ts";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set — copy .env.example to .env");

const db = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url }) });

/** Same scheme as src/lib/auth.ts; duplicated so the seed has no Next imports. */
function hashPassword(plain: string): string {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(plain.normalize("NFKC"), salt, 64);
  return `scrypt:${salt.toString("base64")}:${hash.toString("base64")}`;
}

/**
 * The café's own words are English, and that was a deliberate call when the site
 * was built: translating a café's own menu item names or cat cards would be
 * putting words in its mouth. So the seed writes the same string to every
 * locale, and the admin can diverge any of them later.
 */
function sameEverywhere(value: string) {
  return { fr: value, en: value, ar: value };
}

async function seedAdmin() {
  const email = process.env.SEED_ADMIN_EMAIL ?? "owner@heycat.local";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "heycat-change-me";

  const existing = await db.admin.findUnique({ where: { email } });
  if (existing) {
    console.log(`  admin ${email} already exists — left alone`);
    return;
  }
  await db.admin.create({
    data: {
      email,
      name: "HEYCAT",
      passwordHash: hashPassword(password),
      role: "owner",
    },
  });
  console.log(`  admin created: ${email} / ${password}  <- CHANGE THIS PASSWORD`);
}

/** Register an already-generated asset so admin screens can pick it. */
async function mediaFor(url: string | undefined) {
  if (!url) return null;
  const filename = url.split("/").pop() ?? url;
  const row = await db.media.upsert({
    where: { url },
    create: {
      url,
      filename,
      mime: url.endsWith(".png") ? "image/png" : "image/webp",
      bytes: 0,
      generated: true,
    },
    update: {},
  });
  return row.id;
}

async function seedMenu() {
  for (const [ci, category] of menu.entries()) {
    const cat = await db.menuCategory.upsert({
      where: { slug: category.slug },
      create: {
        slug: category.slug,
        name: sameEverywhere(category.name),
        note: sameEverywhere(category.note),
        source: category.source,
        position: ci,
      },
      update: {
        name: sameEverywhere(category.name),
        note: sameEverywhere(category.note),
        source: category.source,
        position: ci,
      },
    });

    for (const [ii, item] of category.items.entries()) {
      const imageId = await mediaFor(item.image);
      const data = {
        categoryId: cat.id,
        name: sameEverywhere(item.name),
        description: item.description ? sameEverywhere(item.description) : undefined,
        flavours: item.flavours ?? undefined,
        price: item.price,
        imageId,
        accent: item.accent ?? null,
        position: ii,
      };
      await db.menuItem.upsert({
        where: { slug: item.slug },
        create: { slug: item.slug, ...data },
        update: data,
      });
    }
  }

  for (const [i, option] of options.entries()) {
    const slug = option.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const existing = await db.menuOption.findFirst({ where: { position: i } });
    const data = { name: sameEverywhere(option.name), price: option.price, position: i };
    if (existing) {
      await db.menuOption.update({ where: { id: existing.id }, data });
    } else {
      await db.menuOption.create({ data });
    }
    void slug;
  }
}

async function seedCats() {
  for (const [i, cat] of cats.entries()) {
    const imageId = await mediaFor(cat.image);
    const data = {
      name: sameEverywhere(cat.name),
      title: sameEverywhere(cat.title),
      breed: sameEverywhere(cat.breed),
      traits: {
        fr: cat.traits,
        en: cat.traits,
        ar: cat.traits,
      },
      funFact: cat.funFact ? sameEverywhere(cat.funFact) : undefined,
      imageId,
      position: i,
      // The café confirmed it runs adoptions but has published no policy and no
      // per-cat status, so every cat starts unlisted. The owner sets these.
      adoption: "not-listed",
    };
    await db.cat.upsert({
      where: { slug: cat.slug },
      create: { slug: cat.slug, ...data },
      update: data,
    });
  }
}

async function seedProducts() {
  /*
   * The boutique, from the café's own product photographs.
   *
   * No prices anywhere: HeyCat has never published one for the shop, and
   * inventing them is exactly what this project does not do. `price: null`
   * renders as "ask at the counter" until the owner fills them in.
   */
  const categories = [
    { slug: "tableware", name: "Tableware", note: "Cups, bowls and spoons with a cat on them." },
    { slug: "bags", name: "Bags", note: "To carry the rest home in." },
  ];

  const byCategory: Record<string, string> = {};
  for (const [i, c] of categories.entries()) {
    const row = await db.productCategory.upsert({
      where: { slug: c.slug },
      create: {
        slug: c.slug,
        name: sameEverywhere(c.name),
        note: sameEverywhere(c.note),
        position: i,
      },
      update: { name: sameEverywhere(c.name), note: sameEverywhere(c.note), position: i },
    });
    byCategory[c.slug] = row.id;
  }

  const shelf = [
    {
      slug: "cat-teaspoons",
      url: "/img/shop/spoons.webp",
      name: "Cat teaspoons",
      category: "tableware",
      description: "Teaspoons with a ceramic cat's head for a handle.",
      details: "Sold singly. Colours vary with what has come in.",
      gallery: ["/img/shop/spoons-dark.webp", "/img/shop/spoons-gold.webp"],
      featured: true,
    },
    {
      slug: "cat-mug",
      url: "/img/shop/cat-mug.webp",
      name: "Cat mug",
      category: "tableware",
      description: "A small mug moulded into a cat's head, glazed white.",
      gallery: [],
    },
    {
      slug: "cat-bowl",
      url: "/img/shop/cat-bowl.webp",
      name: "Cat-face bowl",
      category: "tableware",
      description: "A shallow bowl with a cat's face glazed into it.",
      gallery: [],
    },
    {
      slug: "cat-cup-saucer",
      url: "/img/shop/cups.webp",
      name: "Cup and saucer",
      category: "tableware",
      description: "A cat-shaped cup on its matching dish.",
      gallery: [],
    },
    {
      slug: "heycat-tote",
      url: "/img/shop/tote.webp",
      name: "HEYCAT tote bag",
      category: "bags",
      description:
        "Cotton tote printed with the café's own black cat, the one framed by the door.",
      details: "The same illustration as the Thanks for coming poster.",
      gallery: [],
      featured: true,
    },
  ];

  for (const [i, product] of shelf.entries()) {
    const imageId = await mediaFor(product.url);
    const data = {
      name: sameEverywhere(product.name),
      description: sameEverywhere(product.description),
      details: product.details ? sameEverywhere(product.details) : undefined,
      categoryId: byCategory[product.category],
      price: null,
      imageId,
      position: i,
      stock: "in-stock",
      featured: product.featured ?? false,
    };
    const row = await db.product.upsert({
      where: { slug: product.slug },
      create: { slug: product.slug, ...data },
      update: data,
    });

    for (const [gi, url] of (product.gallery ?? []).entries()) {
      const mediaId = await mediaFor(url);
      if (!mediaId) continue;
      await db.productImage.upsert({
        where: { productId_mediaId: { productId: row.id, mediaId } },
        create: { productId: row.id, mediaId, position: gi },
        update: { position: gi },
      });
    }
  }
}

async function seedFloor() {
  for (const [i, table] of seedTables.entries()) {
    const data = {
      seats: table.seats,
      shape: table.shape,
      zone: table.zone,
      x: table.x,
      y: table.y,
      width: table.width,
      height: table.height,
      label: table.label ? sameEverywhere(table.label) : undefined,
      position: i,
    };
    await db.table.upsert({
      where: { number: table.number },
      create: { number: table.number, ...data },
      update: data,
    });
  }
}

async function seedSettings() {
  /*
   * Only what the project actually knows. Everything else stays empty so the
   * public site says "to be confirmed" instead of showing something invented.
   * `update: {}` means re-seeding never clobbers what the owner has since typed.
   */
  await db.setting.upsert({
    where: { key: "social" },
    create: {
      key: "social",
      value: {
        instagramHandle: site.instagram.handle,
        instagramUrl: site.instagram.url,
        // Inferred from the reference material, never confirmed by the café.
        instagramVerified: false,
        facebookUrl: "",
        tiktokUrl: "",
      },
    },
    update: {},
  });

  await db.setting.upsert({
    where: { key: "contact" },
    create: { key: "contact", value: { country: site.city } },
    update: {},
  });

  // The printed menu's two item-less sections, verbatim.
  await db.setting.upsert({
    where: { key: "menuNotes" },
    create: {
      key: "menuNotes",
      value: [
        {
          title: { fr: "For cats", en: "For cats", ar: "For cats" },
          body: sameEverywhere("Please check with our staff the availability."),
        },
        {
          title: { fr: "Salted", en: "Salted", ar: "Salted" },
          body: sameEverywhere("Please check with our staff the availability."),
        },
      ],
    },
    update: {},
  });
}

async function main() {
  console.log("Seeding HEYCAT…");
  await seedAdmin();
  await seedMenu();
  console.log(`  menu: ${menu.length} categories, ${menu.reduce((n, c) => n + c.items.length, 0)} items, ${options.length} options`);
  await seedCats();
  console.log(`  cats: ${cats.length}`);
  await seedProducts();
  await seedFloor();
  console.log(`  floor: ${seedTables.length} tables, ${seedTables.reduce((n, t) => n + t.seats, 0)} seats`);
  console.log("  boutique: 2 categories, 5 products (no prices — none published)");
  await seedSettings();
  console.log("  settings: Instagram handle only; everything else left for the owner");
  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
