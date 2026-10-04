import Image from "next/image";
import Link from "next/link";
import { Logo, PawRule } from "@/components/brand";
import { getDictionary, defaultLocale } from "@/i18n";

/*
 * 404.
 *
 * The illustration is the café's own: one of the flat black cats that climb the
 * word MENU down the side of their printed card, lifted out by
 * scripts/extract-illustration.py. It exists nowhere else on the site, which
 * makes this page feel found rather than generated.
 *
 * `not-found` renders outside the `[lang]` params, so it cannot know which
 * locale you were in — it uses the default.
 */
export default function NotFound() {
  const lang = defaultLocale;
  const t = getDictionary(lang);

  return (
    <main className="flex min-h-[80vh] flex-col items-center justify-center px-5 py-20 text-center sm:px-8">
      <Link href={`/${lang}`} className="text-[1.9rem] leading-none sm:text-[2.2rem]">
        <Logo />
      </Link>

      <div className="relative mt-12 h-44 w-auto sm:mt-16 sm:h-56">
        <Image
          src="/img/art/cat-sitting.png"
          alt={t.notFound.alt}
          width={567}
          height={843}
          priority
          className="h-full w-auto object-contain"
        />
      </div>

      <h1 className="mt-10 font-display text-[clamp(2rem,6vw,3.2rem)] leading-[1.05]">
        {t.notFound.title}
      </h1>
      <PawRule className="mt-6" width="7rem" />
      <p className="mt-6 max-w-[38ch] leading-relaxed text-taupe">{t.notFound.body}</p>

      <Link
        href={`/${lang}`}
        className="mt-9 inline-flex items-center rounded-full bg-espresso px-7 py-3.5 text-[0.78rem] font-medium tracking-[0.16em] text-cream uppercase transition-colors duration-300 hover:bg-cocoa"
      >
        {t.notFound.cta}
      </Link>
    </main>
  );
}
