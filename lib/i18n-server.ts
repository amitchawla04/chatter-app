import "server-only";
import { cookies, headers } from "next/headers";
import { resolveLocale, translator, type Locale, type Translator } from "@/lib/i18n";

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const headerStore = await headers();
  return resolveLocale(
    cookieStore.get("chatter_locale")?.value,
    headerStore.get("accept-language") ?? undefined,
  );
}

export async function getT(): Promise<{ t: Translator; locale: Locale }> {
  const locale = await getLocale();
  return { t: translator(locale), locale };
}
