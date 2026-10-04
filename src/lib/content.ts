import "server-only";

import { unstable_cache, revalidatePath, revalidateTag } from "next/cache";
import { db } from "./db";
import { t } from "./i18n-field";
import type { Locale } from "@/i18n/locales";

/*
 * The public site's read layer.
 *
 * Two jobs:
 *
 * 1. Resolve database rows into exactly the shapes the existing components
 *    already accept. The components were written against static data and work
 *    well; this layer hands them the same objects so that moving to a database
 *    did not mean rewriting the site.
 *
 * 2. Cache. Café content changes a few times a week, so every read is wrapped in
 *    a tagged cache and the admin's mutations call `invalidate()`. Pages stay
 *    effectively static, and an edit still shows up immediately.
 *
 * `unstable_cache` is deprecated in favour of the `use cache` directive, which
 * needs `cacheComponents: true` — a repo-wide change to rendering semantics.
 * That is the right migration later; it is not worth destabilising a working
 * site for today.
 */

export const TAGS = {
  menu: "menu",
  cats: "cats",
  products: "products",
  events: "events",
  feature: "feature",
  settings: "settings",
} as const;

export type ContentTag = (typeof TAGS)[keyof typeof TAGS];

/**
 * Call after any admin write so the public site picks it up at once.
 *
 * Two steps, and both are needed:
 *
 * 1. Expire the data cache for the tags that changed. "max" expires
 *    immediately; the single-argument form is deprecated in Next 16.
 * 2. Revalidate the public routes themselves. The menu page is prerendered,
 *    and a prerendered page keeps serving its stored HTML no matter how stale
 *    the data cache behind it is — expiring the tag alone changes nothing a
 *    visitor can see. This was a real bug, caught by changing a price and
 *    watching the public page keep the old one.
 *
 * Both route patterns are dynamic (`[lang]`), so `type` is required.
 */
export function invalidate(...tags: ContentTag[]) {
  for (const tag of tags.length ? tags : Object.values(TAGS)) revalidateTag(tag, "max");
  revalidatePath("/[lang]", "page");
  revalidatePath("/[lang]/menu", "page");
  revalidatePath("/[lang]/boutique", "page");
  revalidatePath("/[lang]/boutique/[slug]", "page");
}

// ------------------------------------------------------------------ view models

export type PublicMenuItem = {
  slug: string;
  name: string;
  description?: string;
  flavours?: string[];
  price: number | null;
  image?: string;
  accent?: string;
  available: boolean;
  featured: boolean;
};

export type PublicMenuCategory = {
  slug: string;
  name: string;
  note: string;
  source: string;
  items: PublicMenuItem[];
};

export type PublicCat = {
  slug: string;
  name: string;
  title: string;
  breed: string;
  traits: { label: string; value: string }[];
  funFact?: string;
  image: string;
  adoption: string;
  adoptionNote?: string;
};

export type PublicProduct = {
  slug: string;
  name: string;
  description?: string;
  details?: string;
  price: number | null;
  image?: string;
  gallery: string[];
  stock: string;
  featured: boolean;
  category?: { slug: string; name: string };
};

export type PublicProductCategory = {
  slug: string;
  name: string;
  note?: string;
  products: PublicProduct[];
};

export type PublicEvent = {
  slug: string;
  title: string;
  description?: string;
  location?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  date: string;
  time?: string;
  image?: string;
};

export type PublicFeature = {
  title: string;
  description?: string;
  price: number | null;
  image?: string;
  date: string;
};

// ------------------------------------------------------------------- readers

const loadMenu = unstable_cache(
  async () =>
    db.menuCategory.findMany({
      where: { published: true },
      orderBy: { position: "asc" },
      include: {
        items: {
          orderBy: { position: "asc" },
          include: { image: { select: { url: true } } },
        },
      },
    }),
  ["menu-categories"],
  { tags: [TAGS.menu] },
);

export async function getMenu(locale: Locale): Promise<PublicMenuCategory[]> {
  const rows = await loadMenu();
  return rows.map((category) => ({
    slug: category.slug,
    name: t(category.name, locale),
    note: t(category.note, locale),
    source: category.source,
    items: category.items.map((item) => ({
      slug: item.slug,
      name: t(item.name, locale),
      description: item.description ? t(item.description, locale) || undefined : undefined,
      flavours: Array.isArray(item.flavours) ? (item.flavours as string[]) : undefined,
      price: item.price,
      image: item.image?.url,
      accent: item.accent ?? undefined,
      available: item.available,
      featured: item.featured,
    })),
  }));
}

const loadOptions = unstable_cache(
  async () =>
    db.menuOption.findMany({
      where: { available: true },
      orderBy: { position: "asc" },
    }),
  ["menu-options"],
  { tags: [TAGS.menu] },
);

export async function getMenuOptions(locale: Locale) {
  const rows = await loadOptions();
  return rows.map((o) => ({ name: t(o.name, locale), price: o.price }));
}

const loadCats = unstable_cache(
  async () =>
    db.cat.findMany({
      where: { published: true },
      orderBy: { position: "asc" },
      include: { image: { select: { url: true } } },
    }),
  ["cats"],
  { tags: [TAGS.cats] },
);

export async function getCats(locale: Locale): Promise<PublicCat[]> {
  const rows = await loadCats();
  return rows.map((cat) => {
    const traits = cat.traits as Record<string, { label: string; value: string }[]> | null;
    const forLocale =
      traits?.[locale] ?? traits?.fr ?? Object.values(traits ?? {})[0] ?? [];
    return {
      slug: cat.slug,
      name: t(cat.name, locale),
      title: t(cat.title, locale),
      breed: t(cat.breed, locale),
      traits: Array.isArray(forLocale) ? forLocale : [],
      funFact: cat.funFact ? t(cat.funFact, locale) || undefined : undefined,
      image: cat.image?.url ?? "",
      adoption: cat.adoption,
      adoptionNote: cat.adoptionNote ? t(cat.adoptionNote, locale) || undefined : undefined,
    };
  });
}

const loadProducts = unstable_cache(
  async () =>
    db.product.findMany({
      where: {
        published: true,
        NOT: { stock: "unlisted" },
        // Hiding a shelf hides what sits on it, which is what the admin screen
        // promises. Without this a product on a hidden shelf would vanish from
        // /boutique but stay reachable at its own URL.
        OR: [{ categoryId: null }, { category: { published: true } }],
      },
      orderBy: [{ position: "asc" }],
      include: {
        image: { select: { url: true } },
        category: true,
        gallery: {
          orderBy: { position: "asc" },
          include: { media: { select: { url: true } } },
        },
      },
    }),
  ["products"],
  { tags: [TAGS.products] },
);

function toProduct(
  row: Awaited<ReturnType<typeof loadProducts>>[number],
  locale: Locale,
): PublicProduct {
  return {
    slug: row.slug,
    name: t(row.name, locale),
    description: row.description ? t(row.description, locale) || undefined : undefined,
    details: row.details ? t(row.details, locale) || undefined : undefined,
    price: row.price,
    image: row.image?.url,
    gallery: row.gallery.map((g) => g.media.url),
    stock: row.stock,
    featured: row.featured,
    category: row.category
      ? { slug: row.category.slug, name: t(row.category.name, locale) }
      : undefined,
  };
}

export async function getProducts(locale: Locale): Promise<PublicProduct[]> {
  const rows = await loadProducts();
  return rows.map((row) => toProduct(row, locale));
}

/** One product, for its own page. */
export async function getProduct(
  slug: string,
  locale: Locale,
): Promise<PublicProduct | null> {
  const rows = await loadProducts();
  const row = rows.find((r) => r.slug === slug);
  return row ? toProduct(row, locale) : null;
}

const loadProductCategories = unstable_cache(
  async () =>
    db.productCategory.findMany({
      where: { published: true },
      orderBy: { position: "asc" },
    }),
  ["product-categories"],
  { tags: [TAGS.products] },
);

/**
 * The shop, grouped.
 *
 * Products with no category fall into a final unnamed group rather than
 * disappearing — losing a product because nobody filed it is the worse failure.
 */
export async function getShop(locale: Locale): Promise<PublicProductCategory[]> {
  const [rows, categories] = await Promise.all([loadProducts(), loadProductCategories()]);
  const products = rows.map((row) => toProduct(row, locale));

  const groups: PublicProductCategory[] = categories.map((c) => ({
    slug: c.slug,
    name: t(c.name, locale),
    note: c.note ? t(c.note, locale) || undefined : undefined,
    products: products.filter((p) => p.category?.slug === c.slug),
  }));

  const orphans = products.filter((p) => !p.category);
  if (orphans.length) {
    groups.push({ slug: "other", name: "", products: orphans });
  }
  return groups.filter((g) => g.products.length > 0);
}

/** Upcoming (and today's) published events, soonest first. */
const loadEvents = unstable_cache(
  async (today: string) =>
    db.event.findMany({
      where: { published: true, date: { gte: today } },
      orderBy: [{ date: "asc" }, { position: "asc" }],
      include: { image: { select: { url: true } } },
    }),
  ["events"],
  { tags: [TAGS.events] },
);

export async function getEvents(locale: Locale): Promise<PublicEvent[]> {
  const rows = await loadEvents(todayISO());
  return rows.map((e) => ({
    slug: e.slug,
    title: t(e.title, locale),
    description: e.description ? t(e.description, locale) || undefined : undefined,
    location: e.location ? t(e.location, locale) || undefined : undefined,
    ctaLabel: e.ctaLabel ? t(e.ctaLabel, locale) || undefined : undefined,
    ctaUrl: e.ctaUrl ?? undefined,
    date: e.date,
    time: e.time ?? undefined,
    image: e.image?.url,
  }));
}

const loadFeature = unstable_cache(
  async (today: string) =>
    db.feature.findFirst({
      where: { active: true, date: today },
      include: { image: { select: { url: true } } },
    }),
  ["feature"],
  { tags: [TAGS.feature] },
);

/** "Today at HEYCAT" — null on any day the owner has not set one. */
export async function getTodayFeature(locale: Locale): Promise<PublicFeature | null> {
  const row = await loadFeature(todayISO());
  if (!row) return null;
  return {
    title: t(row.title, locale),
    description: row.description ? t(row.description, locale) || undefined : undefined,
    price: row.price,
    image: row.image?.url,
    date: row.date,
  };
}

/** Local calendar date as YYYY-MM-DD. Used as a cache key, so it rolls daily. */
export function todayISO(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}
