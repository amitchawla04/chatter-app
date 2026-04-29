import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft, Ban, EyeOff } from "lucide-react";
import { TabBar } from "@/components/TabBar";
import { HiddenWordsManager } from "@/components/HiddenWordsManager";
import { BlockedUsersList } from "@/components/BlockedUsersList";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Privacy · settings · chatter",
  description: "Blocked users, hidden words, and content filters.",
};

export default async function PrivacySettingsPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in?redirect=/settings/privacy");

  const admin = createAdminClient();
  const [{ data: blocks }, { data: words }] = await Promise.all([
    admin
      .from("blocks")
      .select("blocked_id, created_at, blocked:blocked_id ( handle, display_name )")
      .eq("blocker_id", user.id)
      .order("created_at", { ascending: false }),
    admin
      .from("hidden_words")
      .select("word, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  type BlockRow = {
    blocked_id: string;
    blocked: { handle: string; display_name: string } | null;
  };
  const blockedUsers = ((blocks ?? []) as unknown as BlockRow[]).map((b) => ({
    userId: b.blocked_id,
    handle: b.blocked?.handle ?? "—",
    displayName: b.blocked?.display_name ?? "",
  }));
  const hiddenWords = ((words ?? []) as { word: string }[]).map((w) => w.word);

  return (
    <main className="min-h-screen pb-32">
      <header className="px-5 pt-6 pb-3 flex items-center justify-between">
        <Link
          href="/settings"
          className="text-muted hover:text-ink transition flex items-center gap-1 text-sm"
        >
          <ChevronLeft size={16} strokeWidth={1.5} />
          <span>Settings</span>
        </Link>
      </header>

      <section className="px-5 mb-8">
        <h1 className="display-italic text-3xl text-ink mb-1">Privacy</h1>
        <p className="text-muted text-sm">Who you don&apos;t want to see, and what you don&apos;t want to read.</p>
      </section>

      <section className="px-5 mb-10">
        <div className="flex items-center gap-2 mb-3">
          <EyeOff size={16} strokeWidth={1.5} className="text-muted" />
          <h2 className="label-text text-muted">hidden words</h2>
        </div>
        <p className="text-muted text-sm mb-4">
          Whispers containing any of these words won&apos;t appear in your feeds. Case-insensitive substring match.
        </p>
        <HiddenWordsManager initial={hiddenWords} />
      </section>

      <section className="px-5 mb-10">
        <div className="flex items-center gap-2 mb-3">
          <Ban size={16} strokeWidth={1.5} className="text-muted" />
          <h2 className="label-text text-muted">blocked accounts</h2>
        </div>
        <p className="text-muted text-sm mb-4">
          You won&apos;t see their whispers anywhere on Chatter. They won&apos;t be notified.
        </p>
        <BlockedUsersList initial={blockedUsers} />
      </section>

      <TabBar />
    </main>
  );
}
