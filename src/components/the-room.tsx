import Image from "next/image";
import { Eyebrow, PawRule } from "./brand";
import { Reveal } from "./reveal";
import type { Dictionary } from "@/i18n";

/*
 * The café.
 *
 * The interior photographs are phone screenshots a few hundred pixels wide, so
 * they are laid out as a mosaic of modest panels rather than blown up
 * full-bleed. The asymmetry does the work a big picture would have done.
 *
 * The spans below tile the six-column grid exactly — three bands of 3+3, 4+2
 * and 3+3 — so no cell is ever left hanging. Below `sm` it collapses to one
 * column and each frame takes a fixed ratio instead.
 *
 * Every caption describes something actually visible in its frame.
 */

/* src + span here; the caption and alt text live in the dictionary. */
const FRAMES = [
  { key: "counter", src: "/img/place/counter.webp", span: "sm:col-span-3 sm:row-span-2" },
  { key: "pod", src: "/img/place/cat-pod.webp", span: "sm:col-span-3" },
  { key: "climb", src: "/img/place/climbing-wall.webp", span: "sm:col-span-3" },
  { key: "dining", src: "/img/place/dining-room.webp", span: "sm:col-span-4 sm:row-span-2" },
  { key: "washroom", src: "/img/place/washroom.webp", span: "sm:col-span-2 sm:row-span-2" },
  { key: "wall", src: "/img/place/heycat-wall.webp", span: "sm:col-span-3 sm:row-span-2" },
  { key: "terrace", src: "/img/place/terrace.webp", span: "sm:col-span-3 sm:row-span-2" },
] as const;

export function TheRoom({ t }: { t: Dictionary }) {
  return (
    <section id="room" className="">
      <div className="mx-auto max-w-[88rem] px-5 py-24 sm:px-8 sm:py-32 lg:px-12">
        <header className="flex flex-col items-center text-center">
          <Eyebrow>{t.room.eyebrow}</Eyebrow>
          <h2 className="mt-6 max-w-3xl font-display text-[clamp(2.3rem,5.4vw,4rem)] leading-[1.02]">
            {t.room.headA}
            <em className="text-rust"> {t.room.headB}</em>
          </h2>
          <PawRule className="mt-8" />
        </header>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-6 sm:auto-rows-[8.5rem] lg:auto-rows-[11rem]">
          {FRAMES.map((frame, i) => {
            const copy = t.room.frames[frame.key];
            return (
            <Reveal
              key={frame.src}
              as="figure"
              delay={(i % 3) * 80}
              className={`group flex flex-col sm:h-full ${frame.span}`}
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[1.25rem] bg-shell sm:aspect-auto sm:flex-1">
                <Image
                  src={frame.src}
                  alt={copy.alt}
                  fill
                  sizes="(min-width: 1280px) 32vw, (min-width: 640px) 48vw, 92vw"
                  className="object-cover transition-transform duration-[1200ms] ease-[var(--ease-drift)] group-hover:scale-[1.045] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                />
              </div>
              <figcaption className="mt-3 text-[0.82rem] text-taupe">
                {copy.caption}
              </figcaption>
            </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
