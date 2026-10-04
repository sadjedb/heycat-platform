import { en, type Dictionary } from "./en";
import { fr } from "./fr";
import { ar } from "./ar";

export {
  locales, defaultLocale, localeNames, dirOf, isLocale, type Locale,
} from "./locales";

import { locales, type Locale } from "./locales";

const dictionaries: Record<Locale, Dictionary> = { fr, en, ar };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

/** The locales other than this one — the language switcher lists them. */
export function otherLocales(locale: Locale): Locale[] {
  return locales.filter((l) => l !== locale);
}

/**
 * Fill `{placeholders}` in a dictionary string.
 *
 * The dictionary is handed straight to Client Components, so it has to stay
 * serialisable — which rules out storing these as functions.
 */
export function fill(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? `{${key}}`);
}

export type { Dictionary };
