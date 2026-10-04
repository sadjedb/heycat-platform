import Link from "next/link";
import { Logo, PawMark } from "./brand";
import { site } from "@/data/site";
import type { PublicCat } from "@/lib/content";
import type { Dictionary, Locale } from "@/i18n";

/*
 * The quiet close. The café's own farewell, the mark, and a last roll-call of
 * the residents — which is also the page's plainest bit of SEO.
 */
export function SiteFooter({ t, lang, cats }: { t: Dictionary; lang: Locale; cats: PublicCat[] }) {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-cream">
      <div className="mx-auto max-w-[88rem] px-5 py-16 text-center sm:px-8 sm:py-20 lg:px-12">
        <Link href={`/${lang}`} className="inline-block text-[2.6rem] sm:text-[3.2rem]">
          <Logo />
          <span className="sr-only">{t.footer.backToTop}</span>
        </Link>

        <p className="mt-8 font-display text-[clamp(1.4rem,3.4vw,2rem)] text-cocoa italic">
          “{site.farewell}”
        </p>

        {/* Paw prints in the pebbles, the way they run along the counter. */}
        <div
          aria-hidden="true"
          className="mt-8 flex items-center justify-center gap-5 text-taupe/30"
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <PawMark
              key={i}
              className="h-4 w-4"
              style={{ transform: `rotate(${(i % 2 ? 9 : -9) + i}deg)` }}
            />
          ))}
        </div>

        <p className="mx-auto mt-10 max-w-xl text-[0.8rem] leading-relaxed text-mist">
          {t.footer.inResidence}: {cats.map((c) => c.name).join(" · ")}
        </p>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-sand/70 pt-7 text-[0.78rem] text-mist sm:flex-row">
          <p>
            © {year} {site.legalName}
          </p>
          <a
            href={site.instagram.url}
            target="_blank"
            rel="noreferrer"
            className="tracking-[0.1em] text-taupe underline-offset-4 hover:underline"
          >
            {site.instagram.handle}
          </a>
        </div>
      </div>
    </footer>
  );
}
