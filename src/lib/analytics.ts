import "server-only";

import { db } from "./db";
import { todayISO } from "./content";

/*
 * First-party analytics.
 *
 * No third-party script, no cookie, no identifier of any kind: a type, a path,
 * a locale and a day. That is enough to answer the owner's actual questions
 * ("is anyone reading the menu?", "does anybody click WhatsApp?") and it keeps
 * the site free of a consent banner.
 *
 * Because there is no visitor identity, "visits" means page views, not unique
 * people — the dashboard says so rather than implying otherwise.
 */

export const EVENT_TYPES = [
  "page_view",
  "menu_view",
  "menu_item_view",
  "reservation_start",
  "reservation_submit",
  "whatsapp_click",
  "instagram_click",
  "maps_click",
] as const;

export type EventType = (typeof EVENT_TYPES)[number];

export function isEventType(value: string): value is EventType {
  return (EVENT_TYPES as readonly string[]).includes(value);
}

export async function record(
  type: EventType,
  opts: { path?: string; locale?: string; meta?: Record<string, unknown> } = {},
) {
  try {
    await db.analyticsEvent.create({
      data: {
        type,
        path: opts.path?.slice(0, 200),
        locale: opts.locale?.slice(0, 8),
        meta: opts.meta ? (opts.meta as object) : undefined,
        day: todayISO(),
      },
    });
  } catch {
    // Analytics must never break a page render or a reservation.
  }
}

export type Range = 7 | 30 | 90;

function daysBack(n: number): string[] {
  const out: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i -= 1) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const offset = d.getTimezoneOffset() * 60_000;
    out.push(new Date(d.getTime() - offset).toISOString().slice(0, 10));
  }
  return out;
}

export async function summary(range: Range) {
  const days = daysBack(range);
  const from = days[0];

  const [byType, byDay, byPath, byLocale, totalReservations] = await Promise.all([
    db.analyticsEvent.groupBy({
      by: ["type"],
      where: { day: { gte: from } },
      _count: { _all: true },
    }),
    db.analyticsEvent.groupBy({
      by: ["day"],
      where: { day: { gte: from }, type: "page_view" },
      _count: { _all: true },
    }),
    db.analyticsEvent.groupBy({
      by: ["path"],
      where: { day: { gte: from }, type: "page_view" },
      _count: { _all: true },
      orderBy: { _count: { path: "desc" } },
      take: 10,
    }),
    db.analyticsEvent.groupBy({
      by: ["locale"],
      where: { day: { gte: from }, type: "page_view" },
      _count: { _all: true },
    }),
    db.reservation.count({ where: { createdAt: { gte: new Date(`${from}T00:00:00`) } } }),
  ]);

  const counts = Object.fromEntries(byType.map((r) => [r.type, r._count._all])) as Record<
    string,
    number
  >;
  const perDay = Object.fromEntries(byDay.map((r) => [r.day, r._count._all]));

  return {
    days,
    range,
    counts,
    totalReservations,
    series: days.map((day) => ({ day, views: perDay[day] ?? 0 })),
    topPaths: byPath.map((r) => ({ path: r.path ?? "(unknown)", views: r._count._all })),
    byLocale: byLocale
      .map((r) => ({ locale: r.locale ?? "?", views: r._count._all }))
      .sort((a, b) => b.views - a.views),
  };
}

/** Which menu items got opened most — only meaningful once there is traffic. */
export async function topMenuItems(range: Range, limit = 10) {
  const days = daysBack(range);
  const rows = await db.analyticsEvent.findMany({
    where: { type: "menu_item_view", day: { gte: days[0] } },
    select: { meta: true },
    take: 5000,
  });

  const tally = new Map<string, number>();
  for (const row of rows) {
    const slug = (row.meta as { slug?: string } | null)?.slug;
    if (slug) tally.set(slug, (tally.get(slug) ?? 0) + 1);
  }
  return [...tally.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([slug, views]) => ({ slug, views }));
}
