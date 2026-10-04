"use client";

import { fixtures } from "@/data/floorplan";
import type { TableView } from "@/lib/availability";
import type { Dictionary } from "@/i18n";

/*
 * The café floor, drawn from data.
 *
 * Not an image with hotspots on top: an image would go stale the moment a table
 * moves, and it could not carry live availability. Everything here is SVG in
 * the site's own palette — walnut tables, matcha chairs, cream floor — so the
 * plan reads as HEYCAT rather than as a seating widget.
 *
 * Accessibility: each table is a real <button> inside a radiogroup, so the plan
 * is fully keyboard-navigable and a screen reader hears "Table 7, 4 seats,
 * free". The visual map is an enhancement over that, not a replacement for it.
 */

const ZONE_LABELS: Record<string, keyof Dictionary["reserve"]["plan"]["zones"]> = {
  window: "window",
  centre: "centre",
  lounge: "lounge",
  wall: "wall",
  bar: "bar",
};

export function FloorPlan({
  t,
  tables,
  selectedId,
  onSelect,
  guests,
}: {
  t: Dictionary;
  tables: TableView[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  guests: number;
}) {
  const free = tables.filter((x) => x.state === "free").length;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[0.85rem] text-taupe">
          {free > 0 ? t.reserve.plan.freeCount.replace("{n}", String(free)) : t.reserve.plan.noneFree}
        </p>
        <Legend t={t} />
      </div>

      <div
        role="radiogroup"
        aria-label={t.reserve.plan.title}
        className="relative w-full overflow-hidden rounded-[1.25rem] border border-sand bg-[var(--color-cream)]"
        style={{ aspectRatio: "3 / 2" }}
      >
        {/* The floor itself, plus the fixed furniture. Purely decorative. */}
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          <rect x="1.5" y="1.5" width="97" height="97" rx="1.5" fill="var(--color-shell)" stroke="var(--color-espresso)" strokeWidth="1.2" />

          {fixtures.map((f, i) => {
            const x = f.x - f.width / 2;
            const y = f.y - f.height / 2;
            if (f.kind === "rug") {
              return <rect key={i} x={x} y={y} width={f.width} height={f.height} rx="1" fill="var(--color-sand)" opacity="0.55" />;
            }
            if (f.kind === "window") {
              return <rect key={i} x={x} y={y} width={f.width} height={f.height} rx="0.6" fill="#cfd8dc" opacity="0.8" />;
            }
            if (f.kind === "catzone") {
              return (
                <g key={i}>
                  <rect x={x} y={y} width={f.width} height={f.height} rx="1" fill="var(--color-linen)" opacity="0.7" />
                  <rect x={x} y={y} width={f.width} height={f.height} rx="1" fill="none" stroke="var(--color-mist)" strokeWidth="0.3" strokeDasharray="1.2 1" />
                </g>
              );
            }
            if (f.kind === "entrance") {
              return <rect key={i} x={x} y={y} width={f.width} height={f.height} rx="0.8" fill="var(--color-espresso)" />;
            }
            // bar + back counter
            return <rect key={i} x={x} y={y} width={f.width} height={f.height} rx="0.8" fill="var(--color-walnut)" />;
          })}
        </svg>

        {/* Fixture captions, as HTML so they stay legible at every size. */}
        {fixtures
          .filter((f) => f.labelKey)
          .map((f, i) => (
            <span
              key={i}
              aria-hidden="true"
              className={[
                "pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 text-center text-[0.5rem] font-medium tracking-[0.14em] uppercase sm:text-[0.62rem]",
                f.kind === "bar" || f.kind === "entrance" ? "text-cream" : "text-taupe",
              ].join(" ")}
              style={{ left: `${f.x}%`, top: `${f.y}%` }}
            >
              {t.reserve.plan.fixtures[f.labelKey as "bar" | "catZone" | "entrance"]}
            </span>
          ))}

        {/* The tables. */}
        {tables.map((table) => (
          <TableButton
            key={table.id}
            t={t}
            table={table}
            selected={selectedId === table.id}
            onSelect={onSelect}
            guests={guests}
          />
        ))}
      </div>

      <p className="mt-3 text-[0.78rem] leading-relaxed text-mist">{t.reserve.plan.hint}</p>
    </div>
  );
}

function TableButton({
  t,
  table,
  selected,
  onSelect,
  guests,
}: {
  t: Dictionary;
  table: TableView;
  selected: boolean;
  onSelect: (id: string | null) => void;
  guests: number;
}) {
  const disabled = table.state !== "free";

  /*
   * One sentence per table for assistive tech. Without this the plan is sixteen
   * unlabelled squares.
   */
  const stateWord = t.reserve.plan.states[table.state];
  const describe = `${t.reserve.plan.table} ${table.number}${table.label ? ` — ${table.label}` : ""}, ${table.seats} ${t.reserve.plan.seats}, ${stateWord}`;

  const palette = selected
    ? { bg: "var(--color-cocoa)", ring: "var(--color-espresso)", fg: "var(--color-cream)" }
    : table.state === "free"
      ? { bg: "var(--color-walnut)", ring: "transparent", fg: "var(--color-cream)" }
      : table.state === "taken"
        ? { bg: "color-mix(in oklab, var(--color-hibiscus) 22%, var(--color-shell))", ring: "transparent", fg: "var(--color-hibiscus)" }
        : { bg: "var(--color-sand)", ring: "transparent", fg: "var(--color-mist)" };

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={describe}
      title={describe}
      disabled={disabled}
      onClick={() => onSelect(selected ? null : table.id)}
      className={[
        "absolute -translate-x-1/2 -translate-y-1/2 transition-[transform,box-shadow] duration-200",
        table.shape === "round" ? "rounded-full" : "rounded-[18%]",
        disabled ? "cursor-not-allowed" : "cursor-pointer hover:scale-[1.06] focus-visible:scale-[1.06]",
      ].join(" ")}
      style={{
        left: `${table.x}%`,
        top: `${table.y}%`,
        width: `${table.width}%`,
        height: `${table.height}%`,
        background: palette.bg,
        color: palette.fg,
        boxShadow: selected ? `0 0 0 0.22rem ${palette.ring}` : undefined,
        opacity: table.state === "too-small" ? 0.55 : 1,
      }}
    >
      <span className="flex h-full w-full flex-col items-center justify-center leading-none">
        <span className="font-display text-[clamp(0.6rem,1.6vw,1rem)] tabular-nums">
          {table.number}
        </span>
        <span className="mt-[0.15em] text-[clamp(0.4rem,0.9vw,0.55rem)] opacity-80 tabular-nums">
          {table.seats}
          {table.state === "too-small" ? ` · ${guests}+` : ""}
        </span>
      </span>
    </button>
  );
}

function Legend({ t }: { t: Dictionary }) {
  const items = [
    { key: "free", color: "var(--color-walnut)" },
    { key: "taken", color: "color-mix(in oklab, var(--color-hibiscus) 45%, var(--color-shell))" },
    { key: "too-small", color: "var(--color-sand)" },
  ] as const;

  return (
    <ul className="m-0 flex list-none flex-wrap items-center gap-x-4 gap-y-1.5 p-0">
      {items.map((item) => (
        <li key={item.key} className="flex items-center gap-1.5 text-[0.74rem] text-taupe">
          <span
            aria-hidden="true"
            className="h-2.5 w-2.5 rounded-[3px]"
            style={{ background: item.color }}
          />
          {t.reserve.plan.states[item.key]}
        </li>
      ))}
    </ul>
  );
}

export { ZONE_LABELS };
