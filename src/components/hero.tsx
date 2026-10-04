import Image from "next/image";
import { Eyebrow, PawMark } from "./brand";
import { CatAvatar } from "./cat-avatar";
import type { PublicCat } from "@/lib/content";
import { site } from "@/data/site";
import type { Dictionary } from "@/i18n";

/*
 * The opening scene.
 *
 * Not a centred hero over a stock photograph. HeyCat already owns a line worth
 * shouting — it is painted across the café's own wall — so the type carries the
 * page and the photography answers it from the right.
 *
 * The image is the Big Suny Breakfast: their own shot, their own light, and the
 * toast is plated as a pair of cat ears. It sits in an arch, the shape used for
 * every niche and doorway in the café. Underneath, the eleven residents run
 * past as portraits, because that is the fact that makes this café this café.
 */
export function Hero({ t, cats }: { t: Dictionary; cats: PublicCat[] }) {
  const strip = [...cats, ...cats];
  const corner = cats.find((c) => c.slug === "suny") ?? cats[0];

  return (
    <section id="top" className="relative overflow-hidden pt-28 sm:pt-32">
      {/* A soft warm wash, the colour of the café's lit plaster. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 h-[38rem] w-[38rem] rounded-full bg-[radial-gradient(circle,rgba(184,134,43,0.17),transparent_68%)] blur-2xl"
        style={{ insetInlineEnd: "-8rem" }}
      />

      <div className="relative mx-auto grid max-w-[88rem] gap-12 px-5 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:px-12">
        <div className="order-2 lg:order-1">
          <Eyebrow>{t.hero.eyebrow}</Eyebrow>

          <h1 className="mt-7 font-display leading-[0.9] tracking-[-0.03em]">
            <span className="block text-[clamp(3.1rem,11.5vw,8.4rem)]">Come</span>
            <span className="block ps-[0.14em] text-[clamp(3.1rem,11.5vw,8.4rem)] italic">
              where
            </span>
            <span className="block ps-[0.28em] text-[clamp(2.3rem,8.2vw,6rem)] text-rust">
              #cats are
            </span>
          </h1>

          <p className="prose-measure mt-8 text-[1.03rem]">{t.hero.body}</p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <a
              href="#menu"
              className="inline-flex items-center rounded-full bg-espresso px-7 py-3.5 text-[0.78rem] font-medium tracking-[0.16em] text-cream uppercase transition-colors duration-300 hover:bg-cocoa"
            >
              {t.hero.seeMenu}
            </a>
            <a
              href="#residents"
              className="group inline-flex items-center gap-2.5 rounded-full border border-espresso/22 px-7 py-3.5 text-[0.78rem] font-medium tracking-[0.16em] uppercase transition-colors duration-300 hover:border-espresso/55"
            >
              {t.hero.meetCats}
              <PawMark className="h-3.5 w-3.5 transition-transform duration-400 ease-[var(--ease-settle)] group-hover:translate-x-1" />
            </a>
          </div>
        </div>

        {/* The arch — the café's own doorway shape, holding its own photograph. */}
        <figure className="relative order-1 mx-auto w-full max-w-[26rem] lg:order-2 lg:max-w-none">
          <div className="relative aspect-[3/4] overflow-hidden rounded-t-[999px] rounded-b-[1.75rem] bg-shell">
            <Image
              src="/img/menu/big-suny-breakfast.webp"
              alt={t.hero.heroAlt}
              fill
              priority
              sizes="(min-width: 1024px) 42vw, (min-width: 640px) 60vw, 88vw"
              className="object-cover"
            />
          </div>

          {/* A resident peers in from the corner. */}
          <CatAvatar
            cat={corner}
            alt={t.hero.sunyAlt}
            sizes="128px"
            className="absolute -bottom-5 -start-1 h-24 w-24 border-[5px] border-cream sm:-start-4 sm:h-28 sm:w-28 lg:-start-8 lg:h-32 lg:w-32"
          />

          <figcaption className="mt-7 ms-auto max-w-[15rem] text-end text-[0.78rem] leading-relaxed text-taupe lg:mt-6">
            <span className="font-display text-[0.95rem] text-espresso italic">
              Big Suny Breakfast
            </span>
            <br />
            {t.hero.dishCaption}
          </figcaption>
        </figure>
      </div>

      {/* The residents, running. Doubles as the handover into the next section. */}
      <div className="relative mt-16 border-y border-sand/70 bg-shell/60 py-5 sm:mt-20">
        <div className="marquee" data-marquee>
          <ul className="marquee__track m-0 flex list-none items-center gap-8 p-0 sm:gap-12">
            {strip.map((cat, i) => (
              <li
                key={`${cat.slug}-${i}`}
                className="flex shrink-0 items-center gap-3"
                aria-hidden={i >= cats.length}
              >
                <CatAvatar
                  cat={cat}
                  decorative
                  sizes="48px"
                  className="h-11 w-11 sm:h-12 sm:w-12"
                />
                <span className="font-display text-[1.05rem] whitespace-nowrap sm:text-[1.2rem]">
                  {cat.name}
                </span>
                <PawMark className="h-3 w-3 text-taupe/45" />
              </li>
            ))}
          </ul>
        </div>
        <span className="sr-only">
          {t.hero.residentsAre} {cats.map((c) => c.name).join(", ")}.
        </span>
      </div>

      <p className="sr-only">
        {site.legalName}, {site.city}.
      </p>
    </section>
  );
}
