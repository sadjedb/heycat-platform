"use client";

import { useMemo, useState } from "react";
import { PawMark } from "./brand";
import type { Dictionary, Locale } from "@/i18n";

/*
 * The date picker.
 *
 * The native control was replaced because it cannot be themed — it renders the
 * operating system's own widget, which lands in the middle of a warm, editorial
 * page looking like a tax form. This one uses the site's palette and type, and
 * it greys out days the café is shut rather than letting someone pick one and
 * be told off afterwards.
 *
 * It writes to a hidden input, so the surrounding form still submits a plain
 * `date` field and the server validates it exactly as before.
 */

function iso(d: Date): string {
  const offset = d.getTimezoneOffset() * 60_000;
  return new Date(d.getTime() - offset).toISOString().slice(0, 10);
}

export function Calendar({
  t,
  lang,
  name = "date",
  value,
  onChange,
  min,
  max,
  openWeekdays,
  closedDates,
}: {
  t: Dictionary;
  lang: Locale;
  name?: string;
  value: string;
  onChange: (date: string) => void;
  min: string;
  max: string;
  /** 0 = Sunday. Days not listed are shown but not selectable. */
  openWeekdays: number[];
  closedDates: string[];
}) {
  const [cursor, setCursor] = useState(() => {
    const start = value || min;
    const d = new Date(`${start}T12:00:00`);
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  /*
   * Month and weekday names come from Intl, so Arabic gets Arabic month names
   * and the right week shape without a hand-written table per locale.
   */
  const monthLabel = useMemo(
    () => new Intl.DateTimeFormat(lang, { month: "long", year: "numeric" }).format(cursor),
    [cursor, lang],
  );

  const weekdayNames = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(lang, { weekday: "short" });
    // Weeks start on Monday here; the café's week does, and so does the
    // openWeekdays setting in the dashboard.
    return [1, 2, 3, 4, 5, 6, 0].map((dow) =>
      fmt.format(new Date(Date.UTC(2024, 0, 7 + dow))),
    );
  }, [lang]);

  const weeks = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
    // Monday-first offset.
    const lead = (first.getDay() + 6) % 7;

    const cells: (Date | null)[] = Array(lead).fill(null);
    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push(new Date(cursor.getFullYear(), cursor.getMonth(), day));
    }
    while (cells.length % 7 !== 0) cells.push(null);

    const out: (Date | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) out.push(cells.slice(i, i + 7));
    return out;
  }, [cursor]);

  const closed = useMemo(() => new Set(closedDates), [closedDates]);

  function dayState(d: Date): "open" | "closed" | "outside" {
    const key = iso(d);
    if (key < min || key > max) return "outside";
    if (closed.has(key)) return "closed";
    if (!openWeekdays.includes(d.getDay())) return "closed";
    return "open";
  }

  const canGoBack = iso(new Date(cursor.getFullYear(), cursor.getMonth(), 1)) > min.slice(0, 8) + "01";
  const canGoForward =
    iso(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1)) <= max;

  function shift(months: number) {
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() + months, 1));
  }

  return (
    <div className="rounded-[1rem] border border-sand bg-white p-4 sm:p-5">
      <input type="hidden" name={name} value={value} />

      <div className="mb-3 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => shift(-1)}
          disabled={!canGoBack}
          aria-label={t.reserve.calendar.previousMonth}
          className="flex h-9 w-9 items-center justify-center rounded-full text-taupe transition-colors hover:bg-shell disabled:opacity-30 rtl:rotate-180"
        >
          ‹
        </button>
        <p aria-live="polite" className="font-display text-[1.05rem] capitalize">
          {monthLabel}
        </p>
        <button
          type="button"
          onClick={() => shift(1)}
          disabled={!canGoForward}
          aria-label={t.reserve.calendar.nextMonth}
          className="flex h-9 w-9 items-center justify-center rounded-full text-taupe transition-colors hover:bg-shell disabled:opacity-30 rtl:rotate-180"
        >
          ›
        </button>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr>
            {weekdayNames.map((w) => (
              <th
                key={w}
                scope="col"
                className="pb-2 text-center text-[0.66rem] font-medium tracking-[0.08em] text-mist uppercase"
              >
                {w}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, wi) => (
            <tr key={wi}>
              {week.map((d, di) => {
                if (!d) return <td key={di} />;
                const key = iso(d);
                const state = dayState(d);
                const selected = key === value;
                const isToday = key === iso(new Date());

                return (
                  <td key={di} className="p-0.5 text-center">
                    <button
                      type="button"
                      disabled={state !== "open"}
                      aria-pressed={selected}
                      aria-label={new Intl.DateTimeFormat(lang, { dateStyle: "full" }).format(d)}
                      onClick={() => onChange(key)}
                      className={[
                        "relative mx-auto flex h-9 w-9 items-center justify-center rounded-full text-[0.86rem] tabular-nums transition-colors",
                        selected
                          ? "bg-espresso text-cream"
                          : state === "open"
                            ? "text-espresso hover:bg-shell"
                            : "text-mist/50 line-through decoration-mist/40",
                        state !== "open" ? "cursor-not-allowed" : "",
                      ].join(" ")}
                    >
                      {d.getDate()}
                      {isToday && !selected ? (
                        <span
                          aria-hidden="true"
                          className="absolute bottom-1 h-1 w-1 rounded-full bg-rust"
                        />
                      ) : null}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mt-3 flex items-center gap-2 text-[0.74rem] text-mist">
        <PawMark className="h-3 w-3 shrink-0" />
        {t.reserve.calendar.closedNote}
      </p>
    </div>
  );
}
