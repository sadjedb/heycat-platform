"use server";

import { TAGS } from "@/lib/content";
import { saveSettingsGroup, settingsSchema, type SettingsGroup } from "@/lib/settings";
import { bool, done, fail, guard, int, str } from "@/lib/admin-action";

const PAGE = "/admin/settings";

/*
 * Business settings.
 *
 * One action per group, so a concurrent edit to Contact cannot overwrite Hours.
 * Every group is validated against the Zod schema before it is stored: a
 * malformed POST is rejected here rather than written and then crashing a page
 * render later.
 */
async function put<K extends SettingsGroup>(group: K, value: unknown, label: string): Promise<never> {
  const parsed = settingsSchema.shape[group].safeParse(value);
  if (!parsed.success) {
    fail(PAGE, `${label}: ${parsed.error.issues[0]?.message ?? "invalid value"}`);
  }
  await saveSettingsGroup(group, parsed.data as never);
  done(PAGE, `${label} saved.`);
}

/** Split a textarea into trimmed, non-empty lines. */
function lines(value: string): string[] {
  return value.split("\n").map((l) => l.trim()).filter(Boolean);
}

export async function saveContact(formData: FormData) {
  return guard([TAGS.settings], () =>
    put(
      "contact",
      {
        address: str(formData, "address", 300),
        city: str(formData, "city", 120),
        country: str(formData, "country", 80),
        phone: str(formData, "phone", 40),
        email: str(formData, "email", 160),
        // wa.me wants digits only, so the country code survives any formatting.
        whatsapp: str(formData, "whatsapp", 24).replace(/\D/g, ""),
        whatsappGreeting: str(formData, "whatsappGreeting", 300),
      },
      "Contact",
    ),
  );
}

export async function saveSocial(formData: FormData) {
  return guard([TAGS.settings], () =>
    put(
      "social",
      {
        instagramHandle: str(formData, "instagramHandle", 60),
        instagramUrl: str(formData, "instagramUrl", 300),
        instagramVerified: bool(formData, "instagramVerified"),
        facebookUrl: str(formData, "facebookUrl", 300),
        tiktokUrl: str(formData, "tiktokUrl", 300),
      },
      "Social",
    ),
  );
}

export async function saveLocation(formData: FormData) {
  return guard([TAGS.settings], () =>
    put(
      "location",
      {
        mapsUrl: str(formData, "mapsUrl", 600),
        mapsEmbedUrl: str(formData, "mapsEmbedUrl", 900),
        latitude: str(formData, "latitude", 32),
        longitude: str(formData, "longitude", 32),
        directionsNote: str(formData, "directionsNote", 300),
      },
      "Location",
    ),
  );
}

/** Opening hours arrive as parallel arrays of day labels and times. */
export async function saveHours(formData: FormData) {
  return guard([TAGS.settings], () => {
    const days = formData.getAll("days").map(String);
    const opens = formData.getAll("open").map(String);
    const regular = days
      .map((d, i) => ({ days: d.trim(), open: (opens[i] ?? "").trim() }))
      .filter((row) => row.days && row.open);
    return put("hours", { regular, note: str(formData, "note", 300) }, "Hours");
  });
}

export async function saveReservationRules(formData: FormData) {
  return guard([TAGS.settings], () => {
    const slots = str(formData, "slots", 400)
      .split(/[,\s]+/)
      .map((s) => s.trim())
      .filter((s) => /^\d{2}:\d{2}$/.test(s))
      .sort();
    const openWeekdays = formData
      .getAll("weekday")
      .map((d) => Number.parseInt(String(d), 10))
      .filter((n) => Number.isInteger(n) && n >= 0 && n <= 6);
    const closedDates = str(formData, "closedDates", 600)
      .split(/[,\s]+/)
      .map((s) => s.trim())
      .filter((s) => /^\d{4}-\d{2}-\d{2}$/.test(s));

    return put(
      "reservations",
      {
        enabled: bool(formData, "enabled"),
        minGuests: int(formData, "minGuests") ?? 1,
        maxGuests: int(formData, "maxGuests") ?? 8,
        maxDaysAhead: int(formData, "maxDaysAhead") ?? 60,
        minHoursAhead: int(formData, "minHoursAhead") ?? 2,
        slots,
        openWeekdays,
        closedDates,
        confirmationNote: str(formData, "confirmationNote", 400),
      },
      "Reservations",
    );
  });
}

export async function saveFeatures(formData: FormData) {
  return guard([TAGS.settings], () =>
    put(
      "features",
      {
        showTodayAtHeycat: bool(formData, "showTodayAtHeycat"),
        showEvents: bool(formData, "showEvents"),
        showBoutique: bool(formData, "showBoutique"),
        showAdoption: bool(formData, "showAdoption"),
        showReservations: bool(formData, "showReservations"),
      },
      "Sections",
    ),
  );
}

/** Policy lists: one textarea per locale, one rule per line. */
export async function savePolicies(formData: FormData) {
  return guard([TAGS.settings], () => {
    const perLocale = (key: string) =>
      Object.fromEntries(
        ["fr", "en", "ar"].map((locale) => [locale, lines(str(formData, `${key}.${locale}`, 2000))]),
      );
    return put(
      "policies",
      {
        houseRules: perLocale("houseRules"),
        reservationNotes: perLocale("reservationNotes"),
        adoptionNotes: perLocale("adoptionNotes"),
      },
      "Policies",
    );
  });
}

/** The printed menu's two item-less sections — "For cats" and "Salted". */
export async function saveMenuNotes(formData: FormData) {
  return guard([TAGS.settings, TAGS.menu], () => {
    const locales = ["fr", "en", "ar"] as const;
    const titles = Object.fromEntries(
      locales.map((l) => [l, formData.getAll(`noteTitle.${l}`).map(String)]),
    ) as Record<(typeof locales)[number], string[]>;
    const bodies = Object.fromEntries(
      locales.map((l) => [l, formData.getAll(`noteBody.${l}`).map(String)]),
    ) as Record<(typeof locales)[number], string[]>;

    const notes: { title: Record<string, string>; body: Record<string, string> }[] = [];
    for (let i = 0; i < titles.fr.length; i += 1) {
      const title = Object.fromEntries(locales.map((l) => [l, (titles[l][i] ?? "").trim()]));
      const body = Object.fromEntries(locales.map((l) => [l, (bodies[l][i] ?? "").trim()]));
      if (Object.values(title).some(Boolean)) notes.push({ title, body });
    }
    return put("menuNotes", notes, "Menu notes");
  });
}
