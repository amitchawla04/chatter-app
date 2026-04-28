"use client";

/**
 * Client-side translation context.
 * The server reads cookie + Accept-Language, picks a locale, loads its dict,
 * and passes the dictionary into this provider via the root layout. Client
 * components call `useT()` to translate.
 */

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { Locale } from "@/lib/i18n";

type Ctx = {
  locale: Locale;
  dict: Record<string, string>;
  fallback: Record<string, string>;
};

const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({
  locale,
  dict,
  fallback,
  children,
}: Ctx & { children: ReactNode }) {
  const value = useMemo(
    () => ({ locale, dict, fallback }),
    [locale, dict, fallback],
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useT() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    // Safe fallback if a client component renders outside the provider.
    return (key: string) => key;
  }
  return (key: string): string => ctx.dict[key] ?? ctx.fallback[key] ?? key;
}

export function useLocale(): Locale {
  const ctx = useContext(I18nContext);
  return ctx?.locale ?? "en";
}
