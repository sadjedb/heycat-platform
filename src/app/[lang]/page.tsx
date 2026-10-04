import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { Hero } from "@/components/hero";
import { Statement } from "@/components/statement";
import { Residents } from "@/components/residents";
import { TheRoom } from "@/components/the-room";
import { Details } from "@/components/details";
import { Boutique } from "@/components/boutique";
import { MenuSection } from "@/components/menu-section";
import { Visit } from "@/components/visit";
import { Reserve } from "@/components/reserve";
import { Today } from "@/components/today";
import { Events } from "@/components/events";
import { PageView } from "@/components/page-view";
import { SiteFooter } from "@/components/site-footer";
import { getDictionary, isLocale } from "@/i18n";
import {
  getCats, getMenu, getMenuOptions, getProducts, getTodayFeature, getEvents,
} from "@/lib/content";
import { getSettings, policiesFor } from "@/lib/settings";
import { allTables } from "@/lib/availability";
import { t as translate } from "@/lib/i18n-field";
import { site } from "@/data/site";

/*
 * The homepage reads as one sequence, loud to quiet and back:
 *
 *   statement type + one big photograph   (Hero)
 *   quiet paragraphs, wide margins        (Statement)
 *   the cats, and you pick one            (Residents)
 *   an asymmetric mosaic of the room      (TheRoom)
 *   four small objects, close up          (Details)
 *   the shop, in two arches               (Boutique)
 *   the menu, priced, at full width       (MenuSection)
 *   a dark, final invitation              (Visit)
 *   a farewell and a few paw prints       (SiteFooter)
 */
export default async function Home(props: PageProps<"/[lang]">) {
  const { lang } = await props.params;
  const query = await props.searchParams;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);

  /*
   * Everything the page shows now comes from the database, in one parallel
   * read. Each call is individually cached and tagged, so the page is still
   * effectively static — the admin's save expires the tag and the next request
   * rebuilds it.
   */
  const [cats, menu, options, products, feature, events, settings] = await Promise.all([
    getCats(lang),
    getMenu(lang),
    getMenuOptions(lang),
    getProducts(lang),
    getTodayFeature(lang),
    getEvents(lang),
    getSettings(),
  ]);

  // Plan geometry only; live states arrive from /api/availability once the
  // guest has chosen a date and a time.
  const tables = await allTables(lang);

  const policies = policiesFor(settings, lang);

  // The reservation action redirects back here with its result in the query.
  const reserveStatus = {
    ok: query?.reserved === "1",
    error: typeof query?.reserve_error === "string" ? query.reserve_error : undefined,
  };

  const askTheStaff = settings.menuNotes.map((note) => ({
    title: translate(note.title, lang),
    body: translate(note.body, lang),
  }));

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] focus:rounded-full focus:bg-espresso focus:px-5 focus:py-3 focus:text-sm focus:text-cream"
      >
        {t.nav.skip}
      </a>

      <PageView />
      <SiteHeader t={t} lang={lang} />

      <main id="main" className="flex-1">
        <Hero t={t} cats={cats} />
        {settings.features.showTodayAtHeycat ? <Today t={t} feature={feature} /> : null}
        <Statement t={t} />
        <Residents t={t} cats={cats} />
        <TheRoom t={t} />
        <Details t={t} />
        {settings.features.showBoutique ? <Boutique t={t} lang={lang} products={products} /> : null}
        <MenuSection t={t} lang={lang} menu={menu} options={options} askTheStaff={askTheStaff} />
        {settings.features.showEvents ? <Events t={t} events={events} /> : null}
        <Reserve t={t} lang={lang} settings={settings} status={reserveStatus} tables={tables} />
        <Visit t={t} settings={settings} policies={policies} />
      </main>

      <SiteFooter t={t} lang={lang} cats={cats} />

      {/*
        Structured data. Only facts that are actually known are emitted — no
        address, hours or price range, because none are confirmed.
      */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CafeOrCoffeeShop",
            name: site.legalName,
            alternateName: site.name,
            description: t.meta.description,
            sameAs: [site.instagram.url],
            address: { "@type": "PostalAddress", addressCountry: "DZ" },
            servesCuisine: ["Brunch", "Coffee", "Desserts"],
            hasMenu: `${site.legalName} menu`,
            keywords: cats.map((c) => c.name).join(", "),
          }),
        }}
      />
    </>
  );
}
