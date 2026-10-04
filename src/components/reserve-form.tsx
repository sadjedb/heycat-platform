"use client";

import { useEffect, useState, useTransition } from "react";
import { Calendar } from "./calendar";
import { FloorPlan } from "./floor-plan";
import { PawMark } from "./brand";
import { track } from "@/lib/track-client";
import type { TableView } from "@/lib/availability";
import type { Dictionary, Locale } from "@/i18n";

/*
 * The booking form.
 *
 * Four decisions in the order a guest actually makes them: when, how many,
 * what time, which table. Each one narrows the next — the time buttons show how
 * many tables are free, and the plan then shows which.
 *
 * Availability is fetched on every change rather than computed here, so the map
 * reflects the database rather than a stale snapshot. The server re-checks the
 * chosen table at submit time regardless: two people can be looking at the same
 * free table at the same moment.
 *
 * Progressive enhancement: the table is optional. If this component never
 * hydrates the surrounding form still posts date, time, guests and contact
 * details, and the café seats the guest themselves.
 */

type Availability = { tables: TableView[]; slots: Record<string, number> };

export function ReserveForm({
  t,
  lang,
  slots,
  min,
  max,
  minGuests,
  maxGuests,
  openWeekdays,
  closedDates,
  allowTableChoice,
  initialTables,
}: {
  t: Dictionary;
  lang: Locale;
  slots: string[];
  min: string;
  max: string;
  minGuests: number;
  maxGuests: number;
  openWeekdays: number[];
  closedDates: string[];
  allowTableChoice: boolean;
  initialTables: TableView[];
}) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [guests, setGuests] = useState(2);
  const [tableId, setTableId] = useState<string | null>(null);
  const [data, setData] = useState<Availability>({ tables: initialTables, slots: {} });
  const [loading, startLoading] = useTransition();

  // Re-read availability whenever the three inputs that determine it change.
  useEffect(() => {
    if (!date) return;
    const controller = new AbortController();
    startLoading(() => {
      void (async () => {
        try {
          const params = new URLSearchParams({ date, guests: String(guests), locale: lang });
          if (time) params.set("time", time);
          const res = await fetch(`/api/availability?${params}`, { signal: controller.signal });
          if (res.ok) setData(await res.json());
        } catch {
          // An aborted or failed lookup leaves the last good map on screen;
          // the server validates the choice anyway.
        }
      })();
    });
    return () => controller.abort();
  }, [date, time, guests, lang]);

  /*
   * A table can stop being free between the guest picking it and submitting —
   * someone else books it, or the party size grows past its seats. That is
   * derived during render rather than corrected in an effect: writing state
   * from an effect here would cascade a second render on every poll.
   */
  const chosenStillFree =
    tableId !== null && data.tables.find((x) => x.id === tableId)?.state === "free";
  const effectiveTableId = chosenStillFree ? tableId : null;

  const guestRange = Array.from({ length: maxGuests - minGuests + 1 }, (_, i) => minGuests + i);
  const chosenTable = data.tables.find((x) => x.id === effectiveTableId) ?? null;

  return (
    <div className="space-y-7">
      <input type="hidden" name="tableId" value={effectiveTableId ?? ""} />

      <Step n={1} label={t.reserve.date}>
        <Calendar
          t={t}
          lang={lang}
          value={date}
          onChange={(d) => {
            setDate(d);
            setTime("");
            setTableId(null);
            track("reservation_start");
          }}
          min={min}
          max={max}
          openWeekdays={openWeekdays}
          closedDates={closedDates}
        />
      </Step>

      <Step n={2} label={t.reserve.guests}>
        <div className="flex flex-wrap gap-2">
          {guestRange.map((n) => (
            <button
              key={n}
              type="button"
              aria-pressed={guests === n}
              onClick={() => {
                setGuests(n);
                setTableId(null);
              }}
              className={[
                "h-11 w-11 rounded-full text-[0.95rem] tabular-nums transition-colors",
                guests === n
                  ? "bg-espresso text-cream"
                  : "border border-sand text-espresso hover:border-espresso/50",
              ].join(" ")}
            >
              {n}
            </button>
          ))}
        </div>
        <input type="hidden" name="guests" value={guests} />
      </Step>

      <Step n={3} label={t.reserve.time} disabled={!date}>
        {!date ? (
          <p className="text-[0.86rem] text-mist">{t.reserve.pickDateFirst}</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {slots.map((slot) => {
              const free = data.slots[slot];
              const soldOut = free === 0;
              return (
                <button
                  key={slot}
                  type="button"
                  disabled={soldOut}
                  aria-pressed={time === slot}
                  onClick={() => {
                    setTime(slot);
                    setTableId(null);
                  }}
                  className={[
                    "rounded-full px-4 py-2.5 text-[0.9rem] tabular-nums transition-colors",
                    time === slot
                      ? "bg-espresso text-cream"
                      : soldOut
                        ? "cursor-not-allowed border border-sand text-mist/60 line-through"
                        : "border border-sand text-espresso hover:border-espresso/50",
                  ].join(" ")}
                >
                  {slot}
                  {typeof free === "number" && !soldOut ? (
                    <span className="ms-1.5 text-[0.7rem] opacity-60">{free}</span>
                  ) : null}
                </button>
              );
            })}
          </div>
        )}
        <input type="hidden" name="time" value={time} />
      </Step>

      {allowTableChoice ? (
        <Step n={4} label={t.reserve.plan.title} disabled={!date || !time}>
          {!date || !time ? (
            <p className="text-[0.86rem] text-mist">{t.reserve.pickTimeFirst}</p>
          ) : (
            <div className={loading ? "opacity-60 transition-opacity" : "transition-opacity"}>
              <FloorPlan
                t={t}
                tables={data.tables}
                selectedId={effectiveTableId}
                onSelect={setTableId}
                guests={guests}
              />
              <p className="mt-3 flex items-center gap-2 text-[0.86rem]">
                <PawMark className="h-3.5 w-3.5 shrink-0 text-taupe" />
                {chosenTable
                  ? t.reserve.plan.chosen.replace("{n}", String(chosenTable.number))
                  : t.reserve.plan.anyTable}
              </p>
            </div>
          )}
        </Step>
      ) : null}
    </div>
  );
}

function Step({
  n,
  label,
  disabled,
  children,
}: {
  n: number;
  label: string;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <fieldset className={disabled ? "opacity-55" : undefined}>
      <legend className="mb-3 flex items-center gap-2.5">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cocoa text-[0.72rem] text-cream tabular-nums">
          {n}
        </span>
        <span className="font-display text-[1.05rem]">{label}</span>
      </legend>
      {children}
    </fieldset>
  );
}
