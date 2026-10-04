import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PawMark, PawRule } from "@/components/brand";
import { ProductCard } from "@/components/product-card";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PageView } from "@/components/page-view";
import { TrackedLink } from "@/components/tracked-link";
import { getCats, getProduct, getProducts } from "@/lib/content";
import { getSettings, whatsappLink } from "@/lib/settings";
import { getDictionary, fill, isLocale, locales } from "@/i18n";
import { siteUrl } from "@/data/site";

export async function generateMetadata(
  props: PageProps<"/[lang]/boutique/[slug]">,
): Promise<Metadata> {
  const { lang, slug } = await props.params;
  if (!isLocale(lang)) return {};
  const product = await getProduct(slug, lang);
  if (!product) return {};
  return {
    title: product.name,
    description: product.description,
    alternates: {
      canonical: `/${lang}/boutique/${slug}`,
      languages: Object.fromEntries(locales.map((l) => [l, `/${l}/boutique/${slug}`])),
    },
    openGraph: product.image
      ? { images: [{ url: product.image, alt: product.name }] }
      : undefined,
  };
}

/*
 * One product.
 *
 * Gallery, description, stock, and a single route to buying: a WhatsApp message
 * with the product's name already in it. That is how the café actually sells
 * these — there is no payment provider and none was asked for, so a cart would
 * be a button that does nothing.
 */
export default async function ProductPage(props: PageProps<"/[lang]/boutique/[slug]">) {
  const { lang, slug } = await props.params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);

  const [product, settings, cats, all] = await Promise.all([
    getProduct(slug, lang),
    getSettings(),
    getCats(lang),
    getProducts(lang),
  ]);
  if (!product || !settings.features.showBoutique) notFound();

  const images = [product.image, ...product.gallery].filter(Boolean) as string[];
  const wa = whatsappLink(settings, fill(t.shop.enquireMessage, { product: product.name }));
  const out = product.stock === "out";

  const related = all
    .filter((p) => p.slug !== product.slug && p.category?.slug === product.category?.slug)
    .slice(0, 4);

  return (
    <>
      <PageView />
      <SiteHeader t={t} lang={lang} />

      <main id="main" className="flex-1 pt-[calc(var(--header-h)+2.5rem)]">
        <div className="mx-auto max-w-[88rem] px-5 pb-24 sm:px-8 sm:pb-32 lg:px-12">
          <p className="mb-8">
            <Link
              href={`/${lang}/boutique`}
              className="text-[0.8rem] tracking-[0.1em] text-taupe uppercase hover:text-espresso"
            >
              ← {t.shop.backToShop}
            </Link>
          </p>

          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            {/*
              The gallery is a plain stack, not a carousel: at most three
              photographs, and a carousel would hide two of them behind a
              control nobody asked for.
            */}
            <div className="space-y-4">
              {images.map((src, i) => (
                <div
                  key={src}
                  className="relative aspect-[4/5] w-full overflow-hidden rounded-[1.25rem] bg-shell"
                >
                  <Image
                    src={src}
                    alt={i === 0 ? product.name : `${product.name} — ${i + 1}`}
                    fill
                    priority={i === 0}
                    sizes="(min-width: 1024px) 50vw, 92vw"
                    className={out ? "object-cover opacity-60 saturate-50" : "object-cover"}
                  />
                </div>
              ))}
              {images.length === 0 ? (
                <div className="flex aspect-[4/5] w-full items-center justify-center rounded-[1.25rem] bg-shell">
                  <PawMark className="h-10 w-10 text-mist" />
                </div>
              ) : null}
            </div>

            <div className="lg:sticky lg:top-32 lg:self-start">
              {product.category ? (
                <p className="eyebrow">{product.category.name}</p>
              ) : null}

              <h1 className="mt-4 font-display text-[clamp(2rem,4.6vw,3.2rem)] leading-[1.05]">
                {product.name}
              </h1>

              <p className="mt-5 flex flex-wrap items-baseline gap-x-4 gap-y-2">
                {product.price !== null ? (
                  <span className="font-display text-[1.5rem] tabular-nums">
                    {product.price} DA
                  </span>
                ) : (
                  <span className="text-[1rem] text-taupe">{t.shop.askPrice}</span>
                )}
                <span
                  className={[
                    "rounded-full px-3 py-1 text-[0.7rem] font-medium tracking-[0.08em] uppercase",
                    product.stock === "in-stock"
                      ? "bg-matcha/12 text-matcha"
                      : product.stock === "low"
                        ? "bg-gold/15 text-[#8a6410]"
                        : "bg-espresso/10 text-taupe",
                  ].join(" ")}
                >
                  {t.shop.stock[product.stock as keyof typeof t.shop.stock]}
                </span>
              </p>

              {product.description ? (
                <p className="prose-measure mt-6 text-[1.02rem]">{product.description}</p>
              ) : null}

              <PawRule className="mt-8" width="6rem" />

              {product.details ? (
                <div className="mt-8">
                  <h2 className="eyebrow">{t.shop.details}</h2>
                  <p className="prose-measure mt-3 text-[0.95rem]">{product.details}</p>
                </div>
              ) : null}

              {wa && !out ? (
                <TrackedLink
                  href={wa}
                  event="whatsapp_click"
                  slug={product.slug}
                  external
                  className="mt-9 inline-flex items-center gap-3 rounded-full bg-espresso px-7 py-3.5 text-[0.78rem] font-medium tracking-[0.16em] text-cream uppercase transition-colors hover:bg-cocoa"
                >
                  <PawMark className="h-4 w-4" />
                  {t.shop.enquire}
                </TrackedLink>
              ) : null}

              {!wa ? (
                <p className="mt-9 text-[0.86rem] leading-relaxed text-mist">
                  {t.visit.pendingNote}
                </p>
              ) : null}
            </div>
          </div>

          {related.length ? (
            <section className="mt-24">
              <h2 className="font-display text-[clamp(1.4rem,3vw,2rem)]">
                {fill(t.shop.alsoIn, { category: product.category?.name ?? "" })}
              </h2>
              <ul className="m-0 mt-8 grid list-none grid-cols-2 gap-x-5 gap-y-10 p-0 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-8">
                {related.map((p) => (
                  <li key={p.slug}>
                    <ProductCard t={t} lang={lang} product={p} />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </main>

      <SiteFooter t={t} lang={lang} cats={cats} />

      {/*
        Product structured data. Price is omitted when the café has not set one —
        an offer with no price is better left unstated than published as zero.
      */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name,
            description: product.description,
            image: images.map((src) => `${siteUrl}${src}`),
            ...(product.price !== null
              ? {
                  offers: {
                    "@type": "Offer",
                    price: product.price,
                    priceCurrency: "DZD",
                    availability:
                      product.stock === "out"
                        ? "https://schema.org/OutOfStock"
                        : "https://schema.org/InStock",
                    url: `${siteUrl}/${lang}/boutique/${product.slug}`,
                  },
                }
              : {}),
          }),
        }}
      />
    </>
  );
}
