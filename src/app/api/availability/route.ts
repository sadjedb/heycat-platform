import { NextResponse } from "next/server";
import { allTables, slotAvailability, tableAvailability } from "@/lib/availability";
import { getSettings } from "@/lib/settings";
import { isLocale, defaultLocale } from "@/i18n";

/*
 * Live table availability for the booking form.
 *
 * Read-only and public — it exposes nothing but which tables are free, which is
 * exactly what the floor plan shows anyway. No guest details are ever returned.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const date = url.searchParams.get("date") ?? "";
  const time = url.searchParams.get("time") ?? "";
  const guests = Number.parseInt(url.searchParams.get("guests") ?? "2", 10);
  const rawLocale = url.searchParams.get("locale") ?? defaultLocale;
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "bad date" }, { status: 400 });
  }
  const party = Number.isFinite(guests) ? Math.min(Math.max(guests, 1), 100) : 2;

  const settings = await getSettings();
  const slots = await slotAvailability(date, party, settings);

  // Without a time there is nothing to check tables against, so send the plan
  // geometry and let the form show it greyed until a slot is picked.
  const tables = /^\d{2}:\d{2}$/.test(time)
    ? await tableAvailability({ date, time, guests: party, locale }, settings)
    : await allTables(locale);

  return NextResponse.json(
    { tables, slots },
    { headers: { "Cache-Control": "no-store" } },
  );
}
