"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Eyebrow, PawMark } from "./brand";
import { CatAvatar } from "./cat-avatar";
import type { PublicCat } from "@/lib/content";
import { fill, type Dictionary } from "@/i18n";

/*
 * The residents.
 *
 * HeyCat publishes a card per cat — a portrait on a circle, a title, a short
 * spec list. That card is the right idea; a grid of eleven identical ones is
 * not. So: one cat at full size, the rest as a rail of portraits you pick from.
 *
 * Every line shown here is theirs. Nothing about any cat is invented.
 */
export function Residents({ t, cats }: { t: Dictionary; cats: PublicCat[] }) {
  // The admin can unpublish every cat; the section then has nothing to show.
  if (cats.length === 0) return null;
  return <ResidentsInner t={t} cats={cats} />;
}

function ResidentsInner({ t, cats }: { t: Dictionary; cats: PublicCat[] }) {
  const [active, setActive] = useState(0);
  const railRef = useRef<HTMLDivElement>(null);
  const cat = cats[active];

  // Left/right arrows move between cats the way a listbox would.
  const onRailKey = (e: React.KeyboardEvent) => {
    const delta = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const next = (active + delta + cats.length) % cats.length;
    setActive(next);
    const btn = railRef.current?.querySelectorAll("button")[next];
    (btn as HTMLButtonElement | undefined)?.focus();
  };

  return (
    <section id="residents" className="border-y border-sand/70 bg-shell/55">
      <div className="mx-auto max-w-[88rem] px-5 py-24 sm:px-8 sm:py-32 lg:px-12">
        <header className="max-w-2xl">
          <Eyebrow>{t.residents.eyebrow}</Eyebrow>
          <h2 className="mt-6 font-display text-[clamp(2.3rem,5.4vw,4rem)] leading-[1.02]">
            {t.residents.headA}
            <br />
            <em className="text-rust">{t.residents.headB}</em>
          </h2>
          <p className="prose-measure mt-6">{t.residents.body}</p>
        </header>

        <div className="mt-14 grid gap-10 lg:mt-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16">
          {/* Portrait */}
          <div className="relative mx-auto w-full max-w-[23rem] lg:max-w-[28rem]">
            <div className="relative aspect-square overflow-hidden rounded-full bg-cream">
              {/* All eleven stay mounted and cross-fade; no flash between cats. */}
              {cats.map((c, i) => (
                <Image
                  key={c.slug}
                  src={c.image}
                  alt={fill(t.residents.portraitAlt, { name: c.name, breed: c.breed })}
                  fill
                  sizes="(min-width: 1024px) 28rem, 23rem"
                  priority={i === 0}
                  className={[
                    "object-cover transition-opacity duration-500 ease-[var(--ease-settle)]",
                    i === active ? "opacity-100" : "opacity-0",
                  ].join(" ")}
                />
              ))}
            </div>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-espresso/8 ring-inset"
            />
          </div>

          {/* Dossier */}
          <div aria-live="polite">
            <p className="font-hand text-[clamp(3rem,7vw,4.6rem)] leading-none text-cocoa">
              {cat.name}
            </p>
            <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-cocoa px-4 py-1.5 text-[0.74rem] font-medium tracking-[0.1em] text-cream">
              <PawMark className="h-3 w-3" />
              {cat.title}
            </p>

            <dl className="mt-8 border-t border-espresso/12">
              <div className="flex gap-5 border-b border-espresso/12 py-3.5">
                <dt className="w-32 shrink-0 text-[0.78rem] font-semibold tracking-[0.06em] text-espresso">
                  {t.residents.breed}
                </dt>
                <dd className="text-[0.95rem] text-taupe">{cat.breed}</dd>
              </div>
              {cat.traits.map((t) => (
                <div
                  key={t.label}
                  className="flex gap-5 border-b border-espresso/12 py-3.5"
                >
                  <dt className="w-32 shrink-0 text-[0.78rem] font-semibold tracking-[0.06em] text-espresso">
                    {t.label}
                  </dt>
                  <dd className="text-[0.95rem] text-taupe">{t.value}</dd>
                </div>
              ))}
            </dl>

            {cat.funFact ? (
              <p className="mt-7 font-display text-[1.25rem] leading-snug text-cocoa italic">
                {cat.funFact}
              </p>
            ) : null}
          </div>
        </div>

        {/* The rail. Horizontal scroll on small screens, wraps on large. */}
        <div
          ref={railRef}
          role="group"
          aria-label={t.residents.choose}
          onKeyDown={onRailKey}
          className="mt-14 flex gap-3 overflow-x-auto pb-3 sm:gap-4 lg:flex-wrap lg:justify-center lg:overflow-visible lg:pb-0"
        >
          {cats.map((c, i) => (
            <button
              key={c.slug}
              type="button"
              onClick={() => setActive(i)}
              aria-pressed={i === active}
              className="group flex shrink-0 flex-col items-center gap-2"
            >
              <CatAvatar
                cat={c}
                decorative
                sizes="74px"
                className={[
                  "h-16 w-16 transition duration-400 ease-[var(--ease-settle)] sm:h-[4.6rem] sm:w-[4.6rem]",
                  i === active
                    ? "ring-2 ring-cocoa ring-offset-4 ring-offset-shell"
                    : "opacity-65 group-hover:opacity-100",
                ].join(" ")}
              />
              <span
                className={[
                  "text-[0.74rem] tracking-[0.04em] transition-colors",
                  i === active ? "text-espresso" : "text-mist group-hover:text-taupe",
                ].join(" ")}
              >
                {c.name}
              </span>
              <span className="sr-only">{c.title}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
