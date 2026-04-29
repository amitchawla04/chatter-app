/**
 * Settings hub — entry point for account, privacy, data, support.
 */
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  UserCog,
  Shield,
  Database,
  Bell,
  HelpCircle,
  ScrollText,
  ChevronRight,
  LogOut,
  Languages,
} from "lucide-react";
import { ChatterMark } from "@/components/ChatterMark";
import { TabBar } from "@/components/TabBar";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getT } from "@/lib/i18n-server";

export default async function SettingsPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in");

  const admin = createAdminClient();
  const { data: me } = await admin
    .from("users")
    .select("display_name, handle, email, is_teen_account")
    .eq("id", user.id)
    .maybeSingle();

  const { t } = await getT();

  const sections = [
    {
      title: t("settings.section.account"),
      items: [
        { href: "/settings/profile", icon: UserCog, label: t("settings.item.edit_profile"), sub: "name, bio, pronouns" },
        { href: "/settings/account", icon: ScrollText, label: t("settings.item.account"), sub: "email, pause, delete" },
      ],
    },
    {
      title: t("settings.section.privacy_vibe"),
      items: [
        { href: "/settings/privacy", icon: Shield, label: t("settings.item.privacy"), sub: "blocked · muted · hidden words" },
        { href: "/settings/notifications", icon: Bell, label: t("settings.item.notifications"), sub: "what reaches you" },
        { href: "/settings/language", icon: Languages, label: t("settings.item.language"), sub: "en · es · pt · hi · fr · de" },
      ],
    },
    {
      title: t("settings.section.your_data"),
      items: [
        { href: "/settings/data", icon: Database, label: t("settings.item.export_delete"), sub: "your whispers · pact promise 2" },
      ],
    },
    {
      title: t("settings.section.the_pact"),
      items: [
        { href: "/pact", icon: ScrollText, label: t("settings.item.pact"), sub: "14 commitments" },
        { href: "/privacy", icon: Shield, label: t("settings.item.privacy_policy"), sub: "plain-language summary" },
        { href: "/settings/support", icon: HelpCircle, label: t("settings.item.help"), sub: "FAQ · contact" },
      ],
    },
  ];

  return (
    <main className="min-h-screen pb-28">
      <header className="sticky top-0 z-40 bg-canvas/95 backdrop-blur border-b border-line px-5 py-4 flex items-center justify-between">
        <Link href="/you" className="text-muted hover:text-ink transition">
          ←
        </Link>
        <h1 className="display-italic text-xl text-ink">settings</h1>
        <div className="w-4" />
      </header>

      <section className="px-5 py-5 border-b border-line">
        <p className="display-italic text-2xl text-ink">@{me?.handle}</p>
        <p className="mono-text text-xs text-muted mt-1">
          {me?.email}
          {me?.is_teen_account && (
            <span className="ml-2 text-gold">· teen account</span>
          )}
        </p>
      </section>

      {sections.map((section) => (
        <section key={section.title} className="border-b border-line">
          <h2 className="label-text text-muted px-5 pt-5 pb-3">{section.title}</h2>
          {section.items.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-5 py-4 hover:bg-paper transition-colors"
              >
                <Icon size={18} strokeWidth={1.5} className="text-muted" />
                <div className="flex-1">
                  <div className="text-sm text-ink">{item.label}</div>
                  <div className="mono-text text-[11px] text-muted">{item.sub}</div>
                </div>
                <ChevronRight size={16} strokeWidth={1.5} className="text-muted" />
              </Link>
            );
          })}
        </section>
      ))}

      <form action="/auth/sign-out" method="post">
        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 px-5 py-5 text-warn text-sm hover:bg-paper transition-colors"
        >
          <LogOut size={16} strokeWidth={1.5} />
          {t("auth.sign_out")}
        </button>
      </form>

      <TabBar />
    </main>
  );
}
