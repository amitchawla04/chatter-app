/**
 * /founder/invites — generate + manage charter invite codes from inside the app.
 * Founder-only. Companion to /founder pulse dashboard.
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChatterMark } from "@/components/ChatterMark";
import { TabBar } from "@/components/TabBar";
import { InviteCodeManager } from "@/components/InviteCodeManager";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const FOUNDER_EMAILS = new Set([
  "amit.chawla@reward360.co",
  "amit.chawla+chatter@reward360.co",
]);

export const revalidate = 0;

export default async function FounderInvitesPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !user.email || !FOUNDER_EMAILS.has(user.email.toLowerCase())) {
    notFound();
  }

  const admin = createAdminClient();
  const { data: codes } = await admin
    .from("invite_codes")
    .select("code, cohort, max_uses, used_count, archived, expires_at, notes, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  type Code = {
    code: string;
    cohort: string | null;
    max_uses: number;
    used_count: number;
    archived: boolean;
    expires_at: string | null;
    notes: string | null;
    created_at: string;
  };
  const all = (codes ?? []) as Code[];

  return (
    <main className="min-h-screen pb-28">
      <header className="sticky top-0 z-40 bg-ink text-paper px-5 py-4 flex items-center justify-between border-b border-gold">
        <Link href="/founder" className="text-paper/60 hover:text-paper transition mono-text text-xs">
          ← pulse
        </Link>
        <div className="flex items-center gap-2">
          <span className="display-italic text-xl text-paper">
            chatter<span className="text-gold">.</span>
          </span>
          <span className="mono-text text-[10px] uppercase tracking-wider text-gold">
            invites
          </span>
        </div>
        <div className="w-12" />
      </header>

      <section className="px-5 pt-6 pb-4 border-b border-line">
        <h1 className="display-text text-3xl tracking-tighter text-ink mb-2">
          charter invite codes
        </h1>
        <p className="body-text text-sm text-muted">
          generate one-time codes · share via DM/email/text · track usage live.
        </p>
      </section>

      <InviteCodeManager codes={all} />

      <TabBar />
    </main>
  );
}
