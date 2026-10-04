/*
 * The locale list, kept free of any dictionary import so that server code,
 * admin code and the Prisma seed can all depend on it without pulling in the
 * whole public-site copy.
 *
 * French leads: the café is in Algeria and writes its own dish descriptions in
 * French. Arabic is third because it arrived last, not because it matters least;
 * it is a first-class locale with its own layout direction.
 */
export const locales = ["fr", "en", "ar"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "fr";

export const localeNames: Record<Locale, string> = {
  fr: "Français",
  en: "English",
  ar: "العربية",
};

/** Arabic is right-to-left; the other two are not. */
export function dirOf(locale: Locale): "ltr" | "rtl" {
  return locale === "ar" ? "rtl" : "ltr";
}

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
