import Image from "next/image";
import Link from "next/link";
import { Eyebrow, PawMark } from "./brand";
import { Reveal } from "./reveal";
import type { Dictionary } from "@/i18n";
import type { PublicProduct } from "@/lib/content";
import type { Locale } from "@/i18n";

/*
 * The boutique.
 *
 * Two arched niches by the counter hold a small shop — the interior photograph
 * of them is captioned, in the café's own words, "accessoires chats décoratifs".
 * The product shots are the highest-resolution assets in the whole set, so this
 * runs as a wide rail of tall frames rather than a tight grid.
 *
 * No prices here even when the café sets them: this is a rail of photographs
 * pointing at the shop, and the product's own page is where the numbers live.
 * Featured items come first, and anything unphotographed is left to the full
 * shop page rather than shown as an empty frame.
 */



export function Boutique({
  t,
  lang,
  products,
}: {
  t: Dictionary;
  lang: Locale;
  products: PublicProduct[];
}) {
  const shown = products
    .filter((p) => p.image)
    .sort((a, b) => Number(b.featured) - Number(a.featured));

  if (shown.length === 0) return null;
  return (
    <section id="boutique" className="overflow-hidden">
      <div className="mx-auto max-w-[88rem] px-5 py-24 sm:px-8 sm:py-32 lg:px-12">
        <header className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end lg:gap-16">
          <div>
            <Eyebrow>{t.boutique.eyebrow}</Eyebrow>
            <h2 className="mt-6 font-display text-[clamp(2.1rem,4.8vw,3.5rem)] leading-[1.04]">
              {t.boutique.headA}
              <br />
              <em className="text-rust">{t.boutique.headB}</em>
            </h2>
          </div>
          <div>
            <p className="prose-measure">{t.boutique.body}</p>
            <p className="mt-4 inline-flex items-center gap-2.5 text-[0.82rem] text-mist">
              <PawMark className="h-3.5 w-3.5 shrink-0" />
              {t.boutique.askInside}
            </p>
          </div>
        </header>

        {/*
          A rail: it scrolls on small screens and still scrolls on large ones if
          the shelf grows. `snap` keeps a frame aligned at rest either way.
        */}
        <Reveal className="mt-12 sm:mt-16">
          <ul
            className="-mx-5 flex snap-x snap-mandatory list-none gap-4 overflow-x-auto px-5 pb-4 sm:-mx-8 sm:gap-5 sm:px-8 lg:mx-0 lg:px-0"
            aria-label={t.boutique.eyebrow}
          >
            {shown.map((item) => {
              return (
                <li
                  key={item.slug}
                  className={[
                    "group shrink-0 snap-start",
                    "w-[12.5rem] sm:w-[15rem]",
                  ].join(" ")}
                >
                  <Link
                    href={`/${lang}/boutique/${item.slug}`}
                    className="block"
                    aria-label={item.name}
                  >
                  <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[1.1rem] bg-shell">
                    <Image
                      src={item.image!}
                      alt={item.name}
                      fill
                      sizes="(min-width: 640px) 22rem, 17rem"
                      loading="lazy"
                      className="object-cover transition-transform duration-[1100ms] ease-[var(--ease-drift)] group-hover:scale-[1.05] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                    />
                  </div>
                  <p className="mt-3 text-[0.82rem] leading-relaxed text-taupe">
                    {item.name}
                  </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Reveal>

        <div className="mt-10 flex justify-center">
          <Link
            href={`/${lang}/boutique`}
            className="group inline-flex items-center gap-2.5 rounded-full border border-espresso/22 px-7 py-3.5 text-[0.78rem] font-medium tracking-[0.16em] uppercase transition-colors duration-300 hover:border-espresso/55"
          >
            {t.shop.seeAll}
            <PawMark className="h-3.5 w-3.5 transition-transform duration-400 ease-[var(--ease-settle)] group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
