import Image from "next/image";
import { Eyebrow, PawMark } from "./brand";
import { Reveal } from "./reveal";
import type { Dictionary } from "@/i18n";
import type { PublicFeature } from "@/lib/content";

/*
 * "Today at HEYCAT".
 *
 * The café's own printed menu lists a Cake Of The Day, which is an open
 * invitation for this. It renders only on days the owner has set one — the
 * homepage never shows yesterday's cake, and never shows an empty frame.
 *
 * Designed as a band rather than a card so it reads as part of the café's
 * editorial rhythm instead of a CMS widget bolted onto the page.
 */
export function Today({ t, feature }: { t: Dictionary; feature: PublicFeature | null }) {
  if (!feature) return null;

  return (
    <section className="border-y border-sand/70 bg-cocoa text-cream">
      <div className="mx-auto max-w-[88rem] px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
        <Reveal>
          <div className="grid items-center gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
            {feature.image ? (
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[1.25rem] bg-espresso/40 lg:aspect-[3/4]">
                <Image
                  src={feature.image}
                  alt={feature.title}
                  fill
                  sizes="(min-width: 1024px) 32vw, 92vw"
                  className="object-cover"
                />
              </div>
            ) : null}

            <div className={feature.image ? "" : "mx-auto max-w-2xl text-center"}>
              <div className="[&_.eyebrow]:text-cream/55">
                <Eyebrow>{t.today.eyebrow}</Eyebrow>
              </div>
              <h2 className="mt-5 font-display text-[clamp(1.9rem,4.4vw,3rem)] leading-[1.05]">
                {feature.title}
              </h2>
              {feature.description ? (
                <p className="mt-4 max-w-[46ch] leading-relaxed text-cream/70">
                  {feature.description}
                </p>
              ) : null}
              <p className="mt-6 inline-flex items-center gap-2.5 text-[1.05rem] text-[#e4a94f]">
                <PawMark className="h-4 w-4" />
                {feature.price !== null ? (
                  <span className="tabular-nums">{feature.price} DA</span>
                ) : (
                  <span>{t.today.noPrice}</span>
                )}
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
