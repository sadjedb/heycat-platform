import "server-only";

import { z } from "zod";
import { db } from "./db";

/*
 * Business settings.
 *
 * Everything the café might change without a developer, and everything we do
 * not know yet, lives here rather than in code. The defaults below are all
 * EMPTY on purpose — no invented address, phone, hours or handle. A blank value
 * means "the owner has not told us", and the public site renders an honest
 * "to be confirmed" rather than a plausible lie.
 *
 * The one exception is `instagram.handle`, which carries the handle the project
 * was started from, flagged `unverified` so the admin screen asks for it to be
 * checked.
 */

export const openingHoursSchema = z.array(
  z.object({
    /** e.g. "Mon – Fri", in whatever wording the café uses. */
    days: z.string().min(1).max(60),
    /** e.g. "09:00 – 22:00", or "Closed". */
    open: z.string().min(1).max(60),
  }),
);

export const settingsSchema = z.object({
  contact: z.object({
    address: z.string().max(300).default(""),
    city: z.string().max(120).default(""),
    country: z.string().max(80).default("Algeria"),
    phone: z.string().max(40).default(""),
    email: z.string().max(160).default(""),
    /** E.164 without "+", e.g. 213xxxxxxxxx — what wa.me expects. */
    whatsapp: z.string().max(20).default(""),
    whatsappGreeting: z.string().max(300).default(""),
  }),
  social: z.object({
    instagramHandle: z.string().max(60).default("@heycat.dz"),
    instagramUrl: z.string().max(300).default("https://www.instagram.com/heycat.dz/"),
    instagramVerified: z.boolean().default(false),
    facebookUrl: z.string().max(300).default(""),
    tiktokUrl: z.string().max(300).default(""),
  }),
  location: z.object({
    /** Paste from Google Maps "Share → Copy link". */
    mapsUrl: z.string().max(600).default(""),
    /** Optional: the src of a Maps "Embed a map" iframe. */
    mapsEmbedUrl: z.string().max(900).default(""),
    latitude: z.string().max(32).default(""),
    longitude: z.string().max(32).default(""),
    directionsNote: z.string().max(300).default(""),
  }),
  hours: z.object({
    regular: openingHoursSchema.default([]),
    note: z.string().max(300).default(""),
  }),
  reservations: z.object({
    enabled: z.boolean().default(true),
    /** Smallest and largest party the form will accept. */
    minGuests: z.number().int().min(1).max(50).default(1),
    maxGuests: z.number().int().min(1).max(100).default(8),
    /** How far ahead bookings open, in days. */
    maxDaysAhead: z.number().int().min(1).max(365).default(60),
    /** Lead time in hours; stops "book a table for five minutes from now". */
    minHoursAhead: z.number().int().min(0).max(168).default(2),
    /** Bookable times, "HH:MM". Empty = the form offers no slots and says so. */
    slots: z.array(z.string().regex(/^\d{2}:\d{2}$/)).default([]),
    /** Weekdays the café takes bookings. 0 = Sunday. Empty = none. */
    openWeekdays: z.array(z.number().int().min(0).max(6)).default([]),
    /**
     * How long a table is held, in minutes. A booking blocks its table for this
     * long, so a 13:00 sitting with a 90-minute turn still holds it at 14:00.
     */
    turnMinutes: z.number().int().min(15).max(480).default(90),
    /** Let guests choose their own table on the floor plan. */
    allowTableChoice: z.boolean().default(true),
    /** YYYY-MM-DD dates that are closed regardless of weekday. */
    closedDates: z.array(z.string()).default([]),
    confirmationNote: z.string().max(400).default(""),
  }),
  features: z.object({
    showTodayAtHeycat: z.boolean().default(true),
    showEvents: z.boolean().default(true),
    showBoutique: z.boolean().default(true),
    showAdoption: z.boolean().default(true),
    showReservations: z.boolean().default(true),
  }),
  /*
   * Things the café confirmed it does but has not written up: house rules,
   * how reservations work, how adoption works. Per-locale lists of lines, so
   * the owner can write them in French first and add the others later. Empty
   * lists render as "the café is writing this" rather than as nothing.
   */
  policies: z.object({
    houseRules: z.record(z.string(), z.array(z.string())).default({}),
    reservationNotes: z.record(z.string(), z.array(z.string())).default({}),
    adoptionNotes: z.record(z.string(), z.array(z.string())).default({}),
  }),

  /*
   * The printed menu's two item-less sections — "For cats" and "Salted", both
   * reading "Please check with our staff the availability." Translated, so they
   * live here rather than in the English-only menu tables.
   */
  menuNotes: z
    .array(
      z.object({
        title: z.record(z.string(), z.string()).default({}),
        body: z.record(z.string(), z.string()).default({}),
      }),
    )
    .default([]),

  seo: z.object({
    /** Leave blank to use the built-in per-locale defaults. */
    titleOverride: z.string().max(120).default(""),
    descriptionOverride: z.string().max(400).default(""),
  }),
});

export type Settings = z.infer<typeof settingsSchema>;
export type SettingsGroup = keyof Settings;

/** Everything empty — see the note at the top about why. */
export const defaultSettings: Settings = settingsSchema.parse({
  contact: {},
  social: {},
  location: {},
  hours: {},
  reservations: {},
  features: {},
  policies: {},
  menuNotes: [],
  seo: {},
});

/**
 * Read the whole settings object.
 *
 * Stored one row per top-level group so a concurrent edit to Contact cannot
 * clobber Hours. Anything missing or corrupt falls back to the empty default
 * rather than throwing — a bad settings row must never take the site down.
 */
export async function getSettings(): Promise<Settings> {
  const rows = await db.setting.findMany();
  const raw: Record<string, unknown> = {};
  for (const row of rows) raw[row.key] = row.value;

  const merged: Record<string, unknown> = {};
  for (const group of Object.keys(defaultSettings) as SettingsGroup[]) {
    const parsed = settingsSchema.shape[group].safeParse(raw[group] ?? {});
    merged[group] = parsed.success ? parsed.data : defaultSettings[group];
  }
  return merged as Settings;
}

export async function saveSettingsGroup<K extends SettingsGroup>(
  group: K,
  value: Settings[K],
) {
  const parsed = settingsSchema.shape[group].parse(value);
  await db.setting.upsert({
    where: { key: group },
    create: { key: group, value: parsed as object },
    update: { value: parsed as object },
  });
}

// ------------------------------------------------------------------- derived

/** wa.me link, or null when no number is configured. */
export function whatsappLink(settings: Settings, message?: string): string | null {
  const digits = settings.contact.whatsapp.replace(/\D/g, "");
  if (!digits) return null;
  const text = message ?? settings.contact.whatsappGreeting;
  const query = text ? `?text=${encodeURIComponent(text)}` : "";
  return `https://wa.me/${digits}${query}`;
}

/** Resolve the per-locale policy lists for one locale, falling back to French. */
export function policiesFor(settings: Settings, locale: string) {
  const pick = (map: Record<string, string[]>) =>
    map[locale] ?? map.fr ?? Object.values(map)[0] ?? [];
  return {
    houseRules: pick(settings.policies.houseRules),
    reservationNotes: pick(settings.policies.reservationNotes),
    adoptionNotes: pick(settings.policies.adoptionNotes),
  };
}

/** What the owner still has to supply. Shown on the admin dashboard. */
export function missingBusinessInfo(settings: Settings): string[] {
  const missing: string[] = [];
  if (!settings.contact.address) missing.push("address");
  if (!settings.hours.regular.length) missing.push("opening hours");
  if (!settings.contact.phone) missing.push("phone");
  if (!settings.contact.whatsapp) missing.push("WhatsApp number");
  if (!settings.location.mapsUrl) missing.push("Google Maps link");
  if (!settings.social.instagramVerified) missing.push("Instagram handle (unverified)");
  if (settings.features.showReservations && !settings.reservations.slots.length) {
    missing.push("reservation time slots");
  }
  if (settings.features.showReservations && !settings.reservations.openWeekdays.length) {
    missing.push("reservation opening days");
  }
  return missing;
}
