/**
 * /settings/language — pick UI language.
 * Supported: en, es, pt, hi, fr, de.
 */
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChatterMark } from "@/components/ChatterMark";
import { TabBar } from "@/components/TabBar";
import { LocalePicker } from "@/components/LocalePicker";
import { getLocale } from "@/lib/i18n-server";
import { createClient as createServerClient } from "@/lib/supabase/server";

export default async function LanguageSettingsPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in?next=/settings/language");

  const locale = await getLocale();

  return (
    <main className="min-h-screen pb-28">
      <header className="sticky top-0 z-40 bg-canvas/95 backdrop-blur border-b border-line px-5 py-4 flex items-center justify-between">
        <Link href="/settings" className="text-muted hover:text-ink transition">
          ←
        </Link>
        <ChatterMark size="sm" />
        <div className="w-4" />
      </header>

      <section className="px-5 pt-6 pb-3">
        <h1 className="display-text text-3xl tracking-tighter text-ink mb-2">
          language
        </h1>
        <p className="body-text text-sm text-muted">
          chatter respects your reading register · choose the locale you want UI
          strings rendered in.
        </p>
      </section>

      <LocalePicker initialLocale={locale} />

      <TabBar />
    </main>
  );
}
