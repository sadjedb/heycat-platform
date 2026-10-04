import { defaultLocale, locales, type Locale } from "@/i18n/locales";

/*
 * Translated database columns.
 *
 * Every piece of owner-editable copy is stored as `{ fr, en, ar }` JSON. This is
 * the only module that knows that, so the shape can change in one place.
 */
export type I18nField = Partial<Record<Locale, string>>;

/** Narrow unknown JSON from Prisma into a translated field. */
export function asField(value: unknown): I18nField {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const out: I18nField = {};
  for (const locale of locales) {
    const v = (value as Record<string, unknown>)[locale];
    if (typeof v === "string" && v.trim() !== "") out[locale] = v;
  }
  return out;
}

/**
 * Read one locale out of a translated field.
 *
 * Falls back to the default locale, then to any locale that has content, and
 * finally to "". A half-translated record shows the café's French rather than a
 * blank — which is what the owner would want while they catch up.
 */
export function t(value: unknown, locale: Locale): string {
  const field = asField(value);
  return (
    field[locale] ??
    field[defaultLocale] ??
    locales.map((l) => field[l]).find(Boolean) ??
    ""
  );
}

/** True when a field has nothing in it at all. */
export function isEmptyField(value: unknown): boolean {
  return Object.keys(asField(value)).length === 0;
}

/** Which locales are still missing — drives the "untranslated" badges in admin. */
export function missingLocales(value: unknown): Locale[] {
  const field = asField(value);
  return locales.filter((l) => !field[l]);
}

/** Build a field from a form's `name.fr`, `name.en`, `name.ar` inputs. */
export function fieldFromForm(form: FormData, prefix: string): I18nField {
  const out: I18nField = {};
  for (const locale of locales) {
    const raw = form.get(`${prefix}.${locale}`);
    if (typeof raw === "string" && raw.trim() !== "") out[locale] = raw.trim();
  }
  return out;
}
