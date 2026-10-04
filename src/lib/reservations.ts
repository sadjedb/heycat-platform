import "server-only";

import { z } from "zod";
import type { Settings } from "./settings";

/*
 * Reservation rules.
 *
 * Shared between the public form and the server action so the two can never
 * disagree about what is bookable. Everything it checks comes from admin
 * settings — opening days, time slots, party size, how far ahead — so the owner
 * changes the rules without a deploy.
 *
 * The client-side form is a convenience. This runs on the server regardless.
 */

export const reservationInput = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  guests: z.coerce.number().int().min(1).max(100),
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(5).max(40),
  email: z.union([z.string().trim().email().max(160), z.literal("")]).optional(),
  message: z.string().trim().max(600).optional(),
  locale: z.string().max(8).default("fr"),
});

export type ReservationInput = z.infer<typeof reservationInput>;

export type Check = { ok: true } | { ok: false; reason: "past" | "closed" | "guests" };

/** Today's date in the server's local zone, as YYYY-MM-DD. */
function localDate(d = new Date()): string {
  const offset = d.getTimezoneOffset() * 60_000;
  return new Date(d.getTime() - offset).toISOString().slice(0, 10);
}

export function checkReservation(input: ReservationInput, settings: Settings): Check {
  const rules = settings.reservations;

  if (input.guests < rules.minGuests || input.guests > rules.maxGuests) {
    return { ok: false, reason: "guests" };
  }

  const when = new Date(`${input.date}T${input.time}:00`);
  if (Number.isNaN(when.getTime())) return { ok: false, reason: "past" };

  // Lead time, so nobody books a table for five minutes from now.
  const earliest = new Date(Date.now() + rules.minHoursAhead * 3_600_000);
  if (when < earliest) return { ok: false, reason: "past" };

  const latest = new Date();
  latest.setDate(latest.getDate() + rules.maxDaysAhead);
  if (input.date > localDate(latest)) return { ok: false, reason: "closed" };

  if (rules.closedDates.includes(input.date)) return { ok: false, reason: "closed" };
  if (!rules.openWeekdays.includes(when.getDay())) return { ok: false, reason: "closed" };
  if (!rules.slots.includes(input.time)) return { ok: false, reason: "closed" };

  return { ok: true };
}

/** The date range the form offers, so the picker cannot wander outside it. */
export function bookingWindow(settings: Settings) {
  const min = new Date(Date.now() + settings.reservations.minHoursAhead * 3_600_000);
  const max = new Date();
  max.setDate(max.getDate() + settings.reservations.maxDaysAhead);
  return { min: localDate(min), max: localDate(max) };
}

/** True when the café has configured enough for online booking to work at all. */
export function reservationsOpen(settings: Settings): boolean {
  return (
    settings.features.showReservations &&
    settings.reservations.enabled &&
    settings.reservations.slots.length > 0 &&
    settings.reservations.openWeekdays.length > 0
  );
}
