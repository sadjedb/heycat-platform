import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Logo, PawMark, PawRule } from "@/components/brand";
import { SiteHeader } from "@/components/site-header";
import { fill, getDictionary, isLocale, locales } from "@/i18n";
import { CURRENCY } from "@/data/menu";
import { getMenu, getMenuOptions } from "@/lib/content";
import { getSettings } from "@/lib/settings";
import { t as translate } from "@/lib/i18n-field";
import { site } from "@/data/site";

/*
 * The full menu, on its own page.
 *
 * This is the one people will meet through a QR code on the table, so it is
 * built to be read on a phone held in one hand and to print cleanly on A4 —
 * everything in one flow, no tabs to discover, no images competing with the
 * prices. `print:` utilities strip the chrome and set it in two columns.
 */

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata(props: PageProps<"/[lang]/menu">): Promise<Metadata> {
  const { lang } = await props.params;
  if (!isLocale(lang)) return {};
  const t = getDictionary(lang);
  return {
    title: t.meta.menuTitle,
    description: t.meta.menuDescription,
    alternates: {
      canonical: `/${lang}/menu`,
      languages: Object.fromEntries(locales.map((l) => [l, `/${l}/menu`])),
    },
  };
}

export default async function MenuPage(props: PageProps<"/[lang]/menu">) {
  const { lang } = await props.params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);

  const [menu, options, settings] = await Promise.all([
    getMenu(lang),
    getMenuOptions(lang),
    getSettings(),
  ]);
  const askTheStaff = settings.menuNotes.map((note) => ({
    title: translate(note.title, lang),
    body: translate(note.body, lang),
  }));

  return (
    <>
      <SiteHeader t={t} lang={lang} />
      <main className="mx-auto max-w-[62rem] px-5 pt-[calc(var(--header-h)+2.5rem)] pb-14 sm:px-8 sm:pb-20 print:max-w-none print:py-0">
      <header className="flex flex-col items-center text-center">
        <Link
          href={`/${lang}`}
          className="text-[2.2rem] leading-none sm:text-[2.6rem]"
          aria-label={site.legalName}
        >
          <Logo />
        </Link>
        <h1 className="mt-8 font-display text-[clamp(2rem,6vw,3rem)] leading-[1.05]">
          {t.meta.menuTitle}
        </h1>
        <PawRule className="mt-6" />
        <p className="mt-5 text-[0.85rem] text-mist">{fill(t.menu.pricesIn, { currency: CURRENCY })}</p>
      </header>

      {/*
        Two print columns keep the whole menu on one sheet. On screen it stays a
        single readable column at phone width and splits at sm.
      */}
      <div className="mt-14 gap-x-14 sm:columns-2 print:mt-8 print:gap-x-10">
        {menu.map((category) => (
          <section
            key={category.slug}
            className="mb-12 break-inside-avoid print:mb-7"
          >
            <h2 className="font-display text-[1.45rem] text-cocoa">{category.name}</h2>
            <p className="mt-1.5 text-[0.8rem] leading-relaxed text-mist">
              {category.note}
            </p>

            <ul className="mt-5 m-0 list-none p-0">
              {category.items.map((item) => (
                <li
                  key={item.slug}
                  className="border-b border-espresso/10 py-2.5 last:border-b-0"
                >
                  <div className="flex items-baseline gap-3">
                    <span className="text-[0.98rem]">{item.name}</span>
                    <span
                      aria-hidden="true"
                      className="min-w-4 flex-1 translate-y-[-0.25em] border-b border-dotted border-espresso/25"
                    />
                    {item.price !== null ? (
                      <span className="shrink-0 text-[0.92rem] tabular-nums">
                        {item.price} {CURRENCY}
                      </span>
                    ) : (
                      <span className="shrink-0 text-[0.78rem] text-mist">—</span>
                    )}
                  </div>
                  {item.flavours ? (
                    <p className="mt-0.5 text-[0.78rem] text-taupe">
                      {item.flavours.join(" · ")}
                    </p>
                  ) : null}
                  {item.description ? (
                    <p lang="fr" className="mt-0.5 text-[0.78rem] leading-relaxed text-taupe">
                      {item.description}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        ))}

        <section className="mb-12 break-inside-avoid print:mb-7">
          <h2 className="font-display text-[1.45rem] text-cocoa">{t.menu.options}</h2>
          <ul className="mt-5 m-0 list-none p-0">
            {options.map((o) => (
              <li
                key={o.name}
                className="flex items-baseline gap-3 border-b border-espresso/10 py-2.5 last:border-b-0"
              >
                <span className="text-[0.98rem]">{o.name}</span>
                <span
                  aria-hidden="true"
                  className="min-w-4 flex-1 translate-y-[-0.25em] border-b border-dotted border-espresso/25"
                />
                <span className="shrink-0 text-[0.92rem] tabular-nums">
                  {o.price} {CURRENCY}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-12 break-inside-avoid print:mb-7">
          {askTheStaff.map((n) => (
            <p key={n.title} className="mt-3 flex items-start gap-3 text-[0.88rem] text-taupe">
              <PawMark className="mt-1 h-3.5 w-3.5 shrink-0 text-taupe/60" />
              <span>
                <span className="font-display text-espresso">{n.title}</span> — {n.body}
              </span>
            </p>
          ))}
        </section>
      </div>

      <footer className="mt-10 flex flex-col items-center gap-6 border-t border-sand pt-10 text-center print:mt-6 print:pt-4">
        <p className="text-[0.78rem] text-mist">{t.menu.printHint}</p>
        <Link
          href={`/${lang}`}
          className="inline-flex items-center gap-2.5 rounded-full border border-espresso/22 px-6 py-3 text-[0.75rem] font-medium tracking-[0.16em] uppercase transition-colors hover:border-espresso/55 print:hidden"
        >
          {t.menu.backToSite}
        </Link>
      </footer>
      </main>
    </>
  );
}
