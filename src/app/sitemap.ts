import type { MetadataRoute } from "next";
import { siteUrl } from "@/data/site";
import { locales } from "@/i18n/locales";

import { db } from "@/lib/db";

/* Every page exists in all three locales; each entry points at its twins. */
const paths = ["", "/menu", "/boutique"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  const products = await db.product.findMany({
    where: { published: true, NOT: { stock: "unlisted" } },
    select: { slug: true },
  });
  const allPaths = [...paths, ...products.map((p) => `/boutique/${p.slug}`)];

  return locales.flatMap((lang) =>
    allPaths.map((path) => ({
      url: `${siteUrl}/${lang}${path}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: path === "" ? 1 : 0.8,
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [l, `${siteUrl}/${l}${path}`]),
        ),
      },
    })),
  );
}
