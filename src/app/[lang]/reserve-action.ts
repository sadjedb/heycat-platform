"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { checkReservation, reservationInput, reservationsOpen } from "@/lib/reservations";
import { checkTable } from "@/lib/availability";
import { record } from "@/lib/analytics";
import { getDictionary, isLocale, defaultLocale } from "@/i18n";

/*
 * The public reservation submission.
 *
 * One of only two endpoints a visitor can write through, so everything is
 * re-validated here: shape with Zod, then the café's own rules (open days, time
 * slots, party size, lead time) from settings. The browser's date picker is a
 * convenience, never the check.
 *
 * Errors come back as a query string rather than as thrown exceptions, so the
 * visitor lands on the form with a message in their own language.
 */
export async function submitReservation(formData: FormData) {
  const rawLocale = String(formData.get("locale") ?? defaultLocale);
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const t = getDictionary(locale);
  /*
   * Annotated on the binding, not just the arrow: TypeScript only uses a
   * never-returning call to narrow control flow when the variable itself
   * carries the type.
   */
  const back: (params: string) => never = (params) =>
    redirect(`/${locale}?${params}#reserve`);

  const settings = await getSettings();
  if (!reservationsOpen(settings)) {
    back(`reserve_error=${encodeURIComponent(t.reserve.closedBody)}`);
  }

  const parsed = reservationInput.safeParse({
    date: formData.get("date"),
    time: formData.get("time"),
    guests: formData.get("guests"),
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email") ?? "",
    message: formData.get("message") ?? "",
    locale,
  });

  if (!parsed.success) back(`reserve_error=${encodeURIComponent(t.reserve.required)}`);

  const check = checkReservation(parsed.data, settings);
  if (!check.ok) {
    const message =
      check.reason === "past"
        ? t.reserve.errorPast
        : check.reason === "guests"
          ? t.reserve.errorGuests
          : t.reserve.errorClosed;
    back(`reserve_error=${encodeURIComponent(message)}`);
  }

  /*
   * The guest may have had the map open for a while, so the table is checked
   * again here. Two people can be looking at the same free table at once; the
   * map is a convenience, this is the decision.
   */
  const tableId = String(formData.get("tableId") ?? "").trim() || null;
  if (tableId) {
    const seat = await checkTable(tableId, parsed.data, settings);
    if (!seat.ok) {
      const message =
        seat.reason === "taken"
          ? t.reserve.plan.errorTaken
          : seat.reason === "too-small"
            ? t.reserve.plan.errorTooSmall
            : t.reserve.plan.errorClosed;
      back(`reserve_error=${encodeURIComponent(message)}`);
    }
  }

  await db.reservation.create({
    data: {
      date: parsed.data.date,
      time: parsed.data.time,
      guests: parsed.data.guests,
      name: parsed.data.name,
      phone: parsed.data.phone,
      email: parsed.data.email || null,
      message: parsed.data.message || null,
      locale,
      tableId,
      status: "pending",
    },
  });

  await record("reservation_submit", { locale, path: `/${locale}` });
  back("reserved=1");
}
