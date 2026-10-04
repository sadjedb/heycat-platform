import "server-only";

import { db } from "./db";
import { t } from "./i18n-field";
import type { Locale } from "@/i18n/locales";
import type { Settings } from "./settings";

/*
 * Table availability.
 *
 * A booking holds its table for a *turn*, not just for the slot it starts in:
 * a 13:00 booking with a 90-minute turn still has the table at 14:00. Checking
 * only for an exact time match would happily double-book the same table twice
 * in an hour, which is the obvious way to get this wrong.
 *
 * Only `pending` and `confirmed` hold a table. Rejected, cancelled and
 * completed bookings release it.
 */

const HOLDING_STATUSES = ["pending", "confirmed"];

export type TableState = "free" | "taken" | "too-small" | "closed";

export type TableView = {
  id: string;
  number: number;
  label: string | null;
  seats: number;
  shape: string;
  zone: string;
  x: number;
  y: number;
  width: number;
  height: number;
  state: TableState;
  note: string | null;
};

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

/** Two bookings clash when their turns overlap at all. */
function overlaps(aStart: string, bStart: string, turnMinutes: number): boolean {
  const a = toMinutes(aStart);
  const b = toMinutes(bStart);
  return Math.abs(a - b) < turnMinutes;
}

/**
 * Every table with its state for one date, time and party size.
 *
 * `excludeReservationId` lets the admin move an existing booking without the
 * booking blocking its own table.
 */
export async function tableAvailability(
  opts: {
    date: string;
    time: string;
    guests: number;
    locale: Locale;
    excludeReservationId?: string;
  },
  settings: Settings,
): Promise<TableView[]> {
  const turn = settings.reservations.turnMinutes;

  const [tables, held] = await Promise.all([
    db.table.findMany({ orderBy: [{ position: "asc" }, { number: "asc" }] }),
    db.reservation.findMany({
      where: {
        date: opts.date,
        status: { in: HOLDING_STATUSES },
        tableId: { not: null },
        ...(opts.excludeReservationId ? { NOT: { id: opts.excludeReservationId } } : {}),
      },
      select: { tableId: true, time: true },
    }),
  ]);

  const busy = new Set(
    held
      .filter((r) => overlaps(r.time, opts.time, turn))
      .map((r) => r.tableId as string),
  );

  return tables.map((table) => {
    let state: TableState = "free";
    if (!table.bookable) state = "closed";
    else if (busy.has(table.id)) state = "taken";
    else if (table.seats < opts.guests) state = "too-small";

    return {
      id: table.id,
      number: table.number,
      label: table.label ? t(table.label, opts.locale) || null : null,
      seats: table.seats,
      shape: table.shape,
      zone: table.zone,
      x: table.x,
      y: table.y,
      width: table.width,
      height: table.height,
      state,
      note: table.note ? t(table.note, opts.locale) || null : null,
    };
  });
}

/** Just the plan geometry, for rendering before a date is chosen. */
export async function allTables(locale: Locale): Promise<TableView[]> {
  const tables = await db.table.findMany({
    orderBy: [{ position: "asc" }, { number: "asc" }],
  });
  return tables.map((table) => ({
    id: table.id,
    number: table.number,
    label: table.label ? t(table.label, locale) || null : null,
    seats: table.seats,
    shape: table.shape,
    zone: table.zone,
    x: table.x,
    y: table.y,
    width: table.width,
    height: table.height,
    state: table.bookable ? ("free" as const) : ("closed" as const),
    note: table.note ? t(table.note, locale) || null : null,
  }));
}

/**
 * How many tables each slot has free, so the time buttons can say so before the
 * guest commits to one.
 */
export async function slotAvailability(
  date: string,
  guests: number,
  settings: Settings,
): Promise<Record<string, number>> {
  const turn = settings.reservations.turnMinutes;

  const [tables, held] = await Promise.all([
    db.table.findMany({ where: { bookable: true }, select: { id: true, seats: true } }),
    db.reservation.findMany({
      where: { date, status: { in: HOLDING_STATUSES }, tableId: { not: null } },
      select: { tableId: true, time: true },
    }),
  ]);

  const fits = tables.filter((t) => t.seats >= guests);
  const out: Record<string, number> = {};

  for (const slot of settings.reservations.slots) {
    const busy = new Set(
      held.filter((r) => overlaps(r.time, slot, turn)).map((r) => r.tableId as string),
    );
    out[slot] = fits.filter((t) => !busy.has(t.id)).length;
  }
  return out;
}

/**
 * Re-check a specific table at submit time.
 *
 * The map the guest was looking at may be seconds out of date, so the choice is
 * verified again before the row is written. Returns a reason, never a boolean,
 * so the visitor is told which thing went wrong.
 */
export async function checkTable(
  tableId: string,
  opts: { date: string; time: string; guests: number; excludeReservationId?: string },
  settings: Settings,
): Promise<{ ok: true } | { ok: false; reason: "taken" | "too-small" | "closed" | "missing" }> {
  const table = await db.table.findUnique({ where: { id: tableId } });
  if (!table) return { ok: false, reason: "missing" };
  if (!table.bookable) return { ok: false, reason: "closed" };
  if (table.seats < opts.guests) return { ok: false, reason: "too-small" };

  const held = await db.reservation.findMany({
    where: {
      date: opts.date,
      tableId,
      status: { in: HOLDING_STATUSES },
      ...(opts.excludeReservationId ? { NOT: { id: opts.excludeReservationId } } : {}),
    },
    select: { time: true },
  });

  const clash = held.some((r) => overlaps(r.time, opts.time, settings.reservations.turnMinutes));
  return clash ? { ok: false, reason: "taken" } : { ok: true };
}
