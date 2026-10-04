"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Eyebrow, PawMark, PawRule } from "./brand";
import { useIsDesktop } from "./use-desktop";
import { CURRENCY } from "@/data/menu";
import type { PublicMenuCategory, PublicMenuItem } from "@/lib/content";
import { fill, type Dictionary, type Locale } from "@/i18n";

/*
 * The menu.
 *
 * A menu is a priced list — that is what HeyCat prints, and it is what someone
 * deciding whether to come actually wants to read. So the list is the spine,
 * with a thumbnail on every dish they have photographed and, on a wide screen, a
 * large frame that follows whichever row you are on.
 *
 * A grid of photo cards was the earlier take and it was wrong: it buried the
 * prices, and it could not hold the eight items with no photograph at all.
 */
export function MenuSection({
  t,
  lang,
  menu,
  options,
  askTheStaff,
}: {
  t: Dictionary;
  lang: Locale;
  menu: PublicMenuCategory[];
  options: { name: string; price: number }[];
  askTheStaff: { title: string; body: string }[];
}) {
  const [active, setActive] = useState(menu[0]?.slug ?? "");

  // Every category can be hidden from the admin, so the section has to cope
  // with there being nothing to show.
  if (menu.length === 0) return null;

  return (
    <section id="menu" className="">
      <div className="mx-auto max-w-[88rem] px-5 py-24 sm:px-8 sm:py-32 lg:px-12">
        <header className="flex flex-col items-center text-center">
          <Eyebrow>{t.menu.eyebrow}</Eyebrow>
          <h2 className="mt-6 max-w-3xl font-display text-[clamp(2.3rem,5.4vw,4rem)] leading-[1.02]">
            {t.menu.headA}
            <br />
            <em className="text-rust">{t.menu.headB}</em>
          </h2>
          <PawRule className="mt-8" />
        </header>

        <div
          role="tablist"
          aria-label={t.menu.categories}
          className="mt-12 -mx-5 flex gap-2 overflow-x-auto px-5 pb-2 sm:mx-0 sm:justify-center sm:px-0 sm:pb-0"
        >
          {menu.map((cat) => {
            const selected = cat.slug === active;
            return (
              <button
                key={cat.slug}
                role="tab"
                id={`tab-${cat.slug}`}
                aria-selected={selected}
                aria-controls={`panel-${cat.slug}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActive(cat.slug)}
                onKeyDown={(e) => {
                  const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
                  if (!d) return;
                  e.preventDefault();
                  const i = menu.findIndex((c) => c.slug === active);
                  const next = menu[(i + d + menu.length) % menu.length];
                  setActive(next.slug);
                  document.getElementById(`tab-${next.slug}`)?.focus();
                }}
                className={[
                  "shrink-0 rounded-full px-5 py-2.5 text-[0.78rem] font-medium tracking-[0.13em] whitespace-nowrap uppercase transition-colors duration-300",
                  selected
                    ? "bg-espresso text-cream"
                    : "border border-espresso/15 text-taupe hover:border-espresso/45 hover:text-espresso",
                ].join(" ")}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {menu.map((cat) => (
          <div
            key={cat.slug}
            role="tabpanel"
            id={`panel-${cat.slug}`}
            aria-labelledby={`tab-${cat.slug}`}
            hidden={cat.slug !== active}
          >
            <CategoryPanel category={cat} t={t} options={options} />
          </div>
        ))}

        <div className="mt-14 flex justify-center">
          <Link
            href={`/${lang}/menu`}
            className="group inline-flex items-center gap-2.5 rounded-full border border-espresso/22 px-7 py-3.5 text-[0.78rem] font-medium tracking-[0.16em] uppercase transition-colors duration-300 hover:border-espresso/55"
          >
            {t.menu.openFullMenu}
            <PawMark className="h-3.5 w-3.5 transition-transform duration-400 ease-[var(--ease-settle)] group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Both of these are printed on the menu with no items under them. */}
        <div className="mt-16 grid gap-4 border-t border-sand pt-10 sm:grid-cols-2 sm:gap-8">
          {askTheStaff.map((n) => (
            <div key={n.title} className="flex items-start gap-4">
              <PawMark className="mt-1 h-4 w-4 shrink-0 text-taupe/60" />
              <p className="text-[0.9rem] text-taupe">
                <span className="font-display text-espresso">{n.title}</span> —{" "}
                {n.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CategoryPanel({
  category,
  t,
  options,
}: {
  category: PublicMenuCategory;
  t: Dictionary;
  options: { name: string; price: number }[];
}) {
  const photographed = category.items.filter((i) => i.image);
  const [featured, setFeatured] = useState<PublicMenuItem | undefined>(photographed[0]);
  const showOptions = category.slug === "hot" || category.slug === "iced";
  // The preview frame only exists at lg, so below that the rows are not controls
  // and must not become tab stops that do nothing.
  const interactive = useIsDesktop();

  return (
    <>
      <p className="mt-8 text-center font-display text-[1.1rem] text-taupe italic">
        {category.note}
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
        <div>
          <ul className="m-0 list-none p-0">
            {category.items.map((item) => (
              <MenuRow
                key={item.slug}
                item={item}
                t={t}
                interactive={interactive}
                isFeatured={featured?.slug === item.slug}
                onFeature={setFeatured}
              />
            ))}
          </ul>

          {showOptions ? (
            <div className="mt-10 rounded-[1.1rem] bg-shell/70 p-6 sm:p-7">
              <h3 className="eyebrow">{t.menu.options}</h3>
              <ul className="mt-4 m-0 grid list-none gap-x-8 gap-y-2.5 p-0 sm:grid-cols-2">
                {options.map((o) => (
                  <li key={o.name} className="flex items-baseline gap-3 text-[0.92rem]">
                    <span className="text-espresso">{o.name}</span>
                    <span
                      aria-hidden="true"
                      className="min-w-4 flex-1 translate-y-[-0.25em] border-b border-dotted border-espresso/25"
                    />
                    <span className="shrink-0 tabular-nums text-taupe">
                      {o.price} {CURRENCY}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {category.source === "instagram" ? (
            <p className="mt-8 max-w-[52ch] text-[0.8rem] leading-relaxed text-mist">
              {t.menu.notPricedNote}
            </p>
          ) : null}
        </div>

        {/* The payoff: whichever row you are on, shown large. Desktop only —
            it depends on hover or focus, neither of which a phone has. */}
        <div className="hidden lg:block">
          <div className="sticky top-28">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[1.25rem] bg-shell">
              {photographed.map((item) => (
                <Image
                  key={item.slug}
                  src={item.image as string}
                  alt={item.name}
                  fill
                  sizes="34vw"
                  loading="lazy"
                  className={[
                    "object-cover transition-opacity duration-500 ease-[var(--ease-settle)]",
                    featured?.slug === item.slug ? "opacity-100" : "opacity-0",
                  ].join(" ")}
                />
              ))}
            </div>
            {featured ? (
              <p className="mt-4 flex items-baseline gap-3">
                <span className="font-display text-[1.1rem]">{featured.name}</span>
                {featured.price !== null ? (
                  <span className="tabular-nums text-taupe">
                    {featured.price} {CURRENCY}
                  </span>
                ) : null}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}

function MenuRow({
  item,
  t,
  interactive,
  isFeatured,
  onFeature,
}: {
  item: PublicMenuItem;
  t: Dictionary;
  interactive: boolean;
  isFeatured: boolean;
  onFeature: (item: PublicMenuItem) => void;
}) {
  const body = (
    <>
      {item.image ? (
        <span className="relative block h-14 w-14 shrink-0 overflow-hidden rounded-[0.6rem] bg-shell sm:h-16 sm:w-16">
          <Image
            src={item.image}
            alt=""
            fill
            sizes="64px"
            loading="lazy"
            className="object-cover"
          />
        </span>
      ) : (
        <span
          aria-hidden="true"
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[0.6rem] bg-shell/60 sm:h-16 sm:w-16"
        >
          <PawMark
            className="h-4 w-4"
            style={{ color: item.accent ?? "var(--color-mist)", opacity: 0.5 }}
          />
        </span>
      )}

      <span className="min-w-0 flex-1">
        <span className="flex items-baseline gap-3">
          <span className="font-display text-[1.05rem] leading-snug sm:text-[1.15rem]">
            {item.name}
          </span>
          <span
            aria-hidden="true"
            className="min-w-4 flex-1 translate-y-[-0.3em] border-b border-dotted border-espresso/25"
          />
          {item.price !== null ? (
            <span className="shrink-0 text-[0.95rem] tabular-nums text-espresso">
              {item.price} {CURRENCY}
            </span>
          ) : (
            <span className="shrink-0 text-[0.8rem] text-mist">—</span>
          )}
        </span>

        {item.flavours ? (
          <span className="mt-1 block text-[0.82rem] text-taupe">
            {item.flavours.join(" · ")}
          </span>
        ) : null}

        {item.description ? (
          <span lang="fr" className="mt-1 block text-[0.82rem] leading-relaxed text-taupe">
            {item.description}
          </span>
        ) : null}
      </span>
    </>
  );

  const className = [
    "flex w-full items-center gap-4 border-b border-espresso/10 py-4 text-start transition-colors duration-300",
    item.image ? "lg:hover:bg-shell/60" : "",
    isFeatured ? "lg:bg-shell/50" : "",
  ].join(" ");

  return (
    <li>
      {item.image && interactive ? (
        // Genuinely a control: it changes which dish the frame is showing.
        <button
          type="button"
          className={className}
          aria-pressed={isFeatured}
          onMouseEnter={() => onFeature(item)}
          onFocus={() => onFeature(item)}
          onClick={() => onFeature(item)}
        >
          {body}
          <span className="sr-only">{fill(t.menu.showPhoto, { name: item.name })}</span>
        </button>
      ) : (
        <div className={className}>{body}</div>
      )}
    </li>
  );
}
