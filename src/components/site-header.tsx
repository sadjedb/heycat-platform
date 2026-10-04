"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "./brand";
import { site } from "@/data/site";
import { otherLocales, type Dictionary, type Locale } from "@/i18n";

/*
 * The masthead floats over the cream hero, so the type is dark throughout and
 * only the bar itself fades in — once the page has scrolled, a cream backdrop
 * and hairline appear so the links stay legible over photography below.
 */
export function SiteHeader({ t, lang }: { t: Dictionary; lang: Locale }) {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  /*
   * Absolute, not bare "#residents": the masthead also renders on /menu, where a
   * bare hash points at a section that is not on the page and silently does
   * nothing. Next scrolls to the hash when the route is already current, so the
   * homepage behaviour is unchanged.
   */
  const nav = [
    { href: `/${lang}#residents`, label: t.nav.cats },
    { href: `/${lang}#room`, label: t.nav.room },
    { href: `/${lang}#menu`, label: t.nav.menu },
    { href: `/${lang}#visit`, label: t.nav.visit },
  ];

  // Swap only the locale segment, so the switch keeps you on the same page.
  const others = otherLocales(lang);
  const other = others[0];
  const otherHref = pathname.replace(/^\/[^/]+/, `/${other}`) || `/${other}`;

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Keep the page still behind the open mobile sheet.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header
      className={[
        "fixed inset-x-0 top-0 z-50 text-espresso transition-colors duration-500 print:hidden",
        solid
          ? "border-b border-sand/70 bg-cream/92 backdrop-blur-md"
          : "border-b border-transparent",
      ].join(" ")}
    >
      <div className="mx-auto flex max-w-[88rem] items-center justify-between gap-6 px-5 py-4 sm:px-8 lg:px-12">
        <Link
          href={`/${lang}`}
          className="shrink-0 text-[1.45rem] leading-none sm:text-[1.6rem]"
          aria-label={`${site.legalName} — ${t.nav.home}`}
        >
          <Logo showSub={false} />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-9 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group relative py-1 text-[0.8rem] font-medium tracking-[0.14em] uppercase"
            >
              {item.label}
              <span
                aria-hidden="true"
                className="absolute -bottom-0.5 left-0 h-px w-0 bg-current transition-[width] duration-400 ease-[var(--ease-settle)] group-hover:w-full"
              />
            </Link>
          ))}

          <Link
            href={otherHref}
            hrefLang={other}
            className="text-[0.8rem] font-medium tracking-[0.14em] text-taupe uppercase transition-colors hover:text-espresso"
          >
            {other}
          </Link>

          <a
            href={site.instagram.url}
            target="_blank"
            rel="noreferrer"
            className={[
              "rounded-full border border-espresso/25 px-5 py-2 text-[0.75rem] font-medium",
              "tracking-[0.16em] uppercase transition-colors duration-300",
              "hover:border-espresso hover:bg-espresso hover:text-cream",
            ].join(" ")}
          >
            {t.nav.instagram}
          </a>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          className="-me-2 flex h-11 w-11 items-center justify-center md:hidden"
        >
          <span className="sr-only">{open ? t.nav.close : t.nav.open}</span>
          <span aria-hidden="true" className="relative block h-3.5 w-6">
            <span
              className={[
                "absolute left-0 block h-px w-full bg-current transition-transform duration-300",
                open ? "top-1.5 rotate-45" : "top-0",
              ].join(" ")}
            />
            <span
              className={[
                "absolute left-0 block h-px w-full bg-current transition-transform duration-300",
                open ? "top-1.5 -rotate-45" : "top-3",
              ].join(" ")}
            />
          </span>
        </button>
      </div>

      {/* Mobile sheet — full-bleed cream, large touch targets. */}
      <div
        id="mobile-nav"
        hidden={!open}
        className="border-t border-sand/70 bg-cream text-espresso md:hidden"
      >
        <nav aria-label="Primary" className="px-5 pt-2 pb-7 sm:px-8">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block border-b border-sand/70 py-4 font-display text-2xl"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href={otherHref}
            hrefLang={other}
            onClick={() => setOpen(false)}
            className="block border-b border-sand/70 py-4 font-display text-2xl"
          >
            {t.switchTo}
          </Link>
          <a
            href={site.instagram.url}
            target="_blank"
            rel="noreferrer"
            onClick={() => setOpen(false)}
            className="mt-6 inline-flex rounded-full bg-espresso px-6 py-3 text-[0.75rem] font-medium tracking-[0.16em] text-cream uppercase"
          >
            {site.instagram.handle}
          </a>
        </nav>
      </div>
    </header>
  );
}
