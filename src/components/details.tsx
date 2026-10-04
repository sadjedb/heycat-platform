import Image from "next/image";
import { Reveal } from "./reveal";
import type { Dictionary } from "@/i18n";

/*
 * Small details.
 *
 * A deliberate change of scale after the mosaic: four tight frames and four
 * short lines. These are the objects that give the place away — the die-cut
 * lid, the plate that greets you, the shelf of things to take home.
 */

/* src here; title, line and alt live in the dictionary. */
const DETAILS = [
  { key: "lid", src: "/img/menu/iced-bubble-matcha.webp" },
  { key: "plates", src: "/img/menu/pistachio-cookie.webp" },
  { key: "band", src: "/img/menu/classic-tiramisu.webp" },
  { key: "shop", src: "/img/shop/tote.webp" },
] as const;

export function Details({ t }: { t: Dictionary }) {
  return (
    <section className="border-y border-sand/70 bg-shell/55">
      <div className="mx-auto max-w-[88rem] px-5 py-20 sm:px-8 sm:py-24 lg:px-12">
        <ul className="grid list-none grid-cols-2 gap-x-5 gap-y-10 p-0 lg:grid-cols-4 lg:gap-x-8">
          {DETAILS.map((d, i) => {
            const copy = t.details[d.key];
            return (
            <Reveal as="li" key={d.src} delay={i * 70}>
              <div className="relative aspect-square w-full overflow-hidden rounded-[1rem] bg-cream">
                <Image
                  src={d.src}
                  alt={copy.alt}
                  fill
                  sizes="(min-width: 1024px) 21vw, 44vw"
                  className="object-cover"
                />
              </div>
              <h3 className="mt-4 font-display text-[1.15rem] leading-tight">
                {copy.title}
              </h3>
              <p className="mt-1.5 text-[0.85rem] leading-relaxed text-taupe">
                {copy.line}
              </p>
            </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
