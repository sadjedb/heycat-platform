import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Eyebrow, PawRule } from "@/components/brand";
import { ProductCard } from "@/components/product-card";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PageView } from "@/components/page-view";
import { TrackedLink } from "@/components/tracked-link";
import { getCats, getShop } from "@/lib/content";
import { getSettings, whatsappLink } from "@/lib/settings";
import { getDictionary, isLocale, locales } from "@/i18n";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata(props: PageProps<"/[lang]/boutique">): Promise<Metadata> {
  const { lang } = await props.params;
  if (!isLocale(lang)) return {};
  const t = getDictionary(lang);
  return {
    title: t.shop.title,
    description: t.shop.intro,
    alternates: {
      canonical: `/${lang}/boutique`,
      languages: Object.fromEntries(locales.map((l) => [l, `/${l}/boutique`])),
    },
  };
}

/*
 * The shop.
 *
 * A catalogue, not a checkout. The café sells at its counter; this page makes
 * what it sells findable and gives one honest route to buying — a WhatsApp
 * message with the product already named. A cart that cannot take payment would
 * be a dead button, and the brief ruled that out.
 */
export default async function BoutiquePage(props: PageProps<"/[lang]/boutique">) {
  const { lang } = await props.params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);

  const [groups, settings, cats] = await Promise.all([
    getShop(lang),
    getSettings(),
    getCats(lang),
  ]);
  if (!settings.features.showBoutique) notFound();

  const wa = whatsappLink(settings, settings.contact.whatsappGreeting || undefined);

  return (
    <>
      <PageView />
      <SiteHeader t={t} lang={lang} />

      <main id="main" className="flex-1 pt-[calc(var(--header-h)+2.5rem)]">
        <div className="mx-auto max-w-[88rem] px-5 pb-24 sm:px-8 sm:pb-32 lg:px-12">
          <header className="flex flex-col items-center text-center">
            <Eyebrow>{t.boutique.eyebrow}</Eyebrow>
            <h1 className="mt-6 max-w-3xl font-display text-[clamp(2.3rem,5.4vw,4rem)] leading-[1.02]">
              {t.shop.title}
            </h1>
            <p className="prose-measure mt-6">{t.shop.intro}</p>
            <PawRule className="mt-8" />
          </header>

          {groups.length === 0 ? (
            <p className="mt-16 text-center text-[0.95rem] text-taupe">{t.shop.empty}</p>
          ) : (
            <>
              {groups.length > 1 ? (
                <nav aria-label={t.shop.title} className="mt-12 flex flex-wrap justify-center gap-2">
                  {groups.map((g) => (
                    <a
                      key={g.slug}
                      href={`#${g.slug}`}
                      className="rounded-full border border-espresso/15 px-5 py-2.5 text-[0.78rem] font-medium tracking-[0.13em] text-taupe uppercase transition-colors hover:border-espresso/45 hover:text-espresso"
                    >
                      {g.name || t.shop.title}
                    </a>
                  ))}
                </nav>
              ) : null}

              {groups.map((group) => (
                <section key={group.slug} id={group.slug} className="mt-16 scroll-mt-32 sm:mt-20">
                  {group.name ? (
                    <div className="mb-8">
                      <h2 className="font-display text-[clamp(1.6rem,3.4vw,2.3rem)] leading-tight">
                        {group.name}
                      </h2>
                      {group.note ? (
                        <p className="mt-2 text-[0.92rem] text-taupe">{group.note}</p>
                      ) : null}
                    </div>
                  ) : null}

                  <ul className="m-0 grid list-none grid-cols-2 gap-x-5 gap-y-10 p-0 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-8">
                    {group.products.map((product) => (
                      <li key={product.slug}>
                        <ProductCard t={t} lang={lang} product={product} />
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </>
          )}

          {wa ? (
            <div className="mt-20 flex justify-center">
              <TrackedLink
                href={wa}
                event="whatsapp_click"
                external
                className="inline-flex items-center rounded-full bg-espresso px-7 py-3.5 text-[0.78rem] font-medium tracking-[0.16em] text-cream uppercase transition-colors hover:bg-cocoa"
              >
                {t.common.whatsapp}
              </TrackedLink>
            </div>
          ) : null}

          <p className="mt-10 text-center">
            <Link
              href={`/${lang}`}
              className="text-[0.8rem] tracking-[0.1em] text-taupe uppercase hover:text-espresso"
            >
              ← {t.menu.backToSite}
            </Link>
          </p>
        </div>
      </main>

      <SiteFooter t={t} lang={lang} cats={cats} />
    </>
  );
}
