/**
 * Lightweight i18n.
 *
 * Why a custom helper instead of next-intl/i18next:
 *  - the existing middleware.ts handles auth refresh; layering routing-locale
 *    middleware on top adds breakage risk for 31 production routes.
 *  - Chatter's UI strings are mostly token-light — full library overhead isn't
 *    justified yet.
 *
 * Locale resolution order:
 *  1. `chatter_locale` cookie (user preference, set via /settings)
 *  2. Accept-Language header (server) / navigator.language (client)
 *  3. Fallback: 'en'
 *
 * To add a new locale: drop a JSON file at `/messages/{locale}.json`, add to
 * SUPPORTED, and translate keys. Missing keys fall back to English.
 */

import en from "@/messages/en.json";
import es from "@/messages/es.json";
import pt from "@/messages/pt.json";
import hi from "@/messages/hi.json";
import fr from "@/messages/fr.json";
import de from "@/messages/de.json";

export const SUPPORTED_LOCALES = ["en", "es", "pt", "hi", "fr", "de"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

const messages: Record<Locale, Record<string, string>> = {
  en,
  es,
  pt,
  hi,
  fr,
  de,
};

export function isSupportedLocale(value: unknown): value is Locale {
  return (
    typeof value === "string" &&
    (SUPPORTED_LOCALES as readonly string[]).includes(value)
  );
}

export function resolveLocale(
  cookieValue: string | undefined,
  acceptLanguage: string | undefined,
): Locale {
  if (isSupportedLocale(cookieValue)) return cookieValue;
  if (!acceptLanguage) return "en";
  // Take first language tag, normalize "es-MX" → "es"
  const first = acceptLanguage.split(",")[0]?.split("-")[0]?.trim().toLowerCase();
  if (isSupportedLocale(first)) return first;
  return "en";
}

export function translator(locale: Locale) {
  const dict = messages[locale] ?? messages.en;
  const fallback = messages.en;
  return (key: string): string => dict[key] ?? fallback[key] ?? key;
}

export type Translator = ReturnType<typeof translator>;
