import Image from "next/image";
import { Eyebrow, PawRule } from "./brand";
import { Reveal } from "./reveal";
import { site } from "@/data/site";
import type { Dictionary } from "@/i18n";

/*
 * The quiet beat after the hero.
 *
 * All type, wide margins, one small photograph — the interior shots are only a
 * few hundred pixels wide, so they are used at the size they can actually hold.
 * The closing line is HeyCat's own, framed by their door.
 */
export function Statement({ t }: { t: Dictionary }) {
  return (
    <section className="mx-auto max-w-[88rem] px-5 py-24 sm:px-8 sm:py-32 lg:px-12">
      <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        <Reveal className="lg:pt-2">
          <Eyebrow>{t.statement.eyebrow}</Eyebrow>
          <h2 className="mt-6 font-display text-[clamp(2.1rem,4.6vw,3.4rem)] leading-[1.05]">
            {t.statement.headA}
            <br />
            {t.statement.headB}
            <em className="text-rust"> {t.statement.headC}</em>.
          </h2>
        </Reveal>

        <Reveal delay={90}>
          <div className="grid gap-10 sm:grid-cols-[1.3fr_0.7fr] sm:gap-12">
            <div>
              <p className="prose-measure text-[1.05rem]">{t.statement.p1}</p>
              <p className="prose-measure mt-5 text-[1.05rem]">{t.statement.p2}</p>

              <PawRule className="mt-10" width="7rem" />

              <p className="mt-8 font-display text-[clamp(1.5rem,3vw,2.1rem)] leading-[1.25] text-cocoa italic">
                “{site.farewell}”
              </p>
              <p className="mt-3 text-[0.8rem] tracking-[0.06em] text-mist">
                — {t.statement.quoteSource}
              </p>
            </div>

            <figure className="relative self-start">
              <div className="relative aspect-[3/4] overflow-hidden rounded-[1.25rem] bg-shell">
                <Image
                  src="/img/place/thanks-poster.webp"
                  alt={t.statement.posterAlt}
                  fill
                  sizes="(min-width: 640px) 18vw, 60vw"
                  className="object-cover"
                />
              </div>
            </figure>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
