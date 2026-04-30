/**
 * Account — email · pause · delete + reactivation.
 */
import Link from "next/link";
import { redirect } from "next/navigation";
import { Pause, Play, LogOut } from "lucide-react";
import { TabBar } from "@/components/TabBar";
import { PauseAccountForm } from "@/components/PauseAccountForm";
import { DeleteAccountButton } from "@/components/DeleteAccountButton";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AccountPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in");

  const admin = createAdminClient();
  const { data: me } = await admin
    .from("users")
    .select("email, paused_at, deletion_requested_at, created_at, is_teen_account")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <main className="min-h-screen pb-28">
      <header className="sticky top-0 z-40 bg-canvas/95 backdrop-blur border-b border-line px-5 py-4 flex items-center justify-between">
        <Link href="/settings" className="text-muted hover:text-ink transition">
          ←
        </Link>
        <h1 className="display-italic text-xl text-ink">account</h1>
        <div className="w-4" />
      </header>

      <section className="px-5 py-7 space-y-6">
        <div>
          <p className="label-text text-muted mb-2">sign-in email</p>
          <p className="body-text text-ink">{me?.email}</p>
          <p className="mono-text text-[11px] text-muted mt-1">
            joined {me?.created_at ? new Date(me.created_at).toLocaleDateString() : "—"}
          </p>
        </div>

        {me?.is_teen_account && (
          <div className="p-4 border border-gold/40 bg-gold/5">
            <p className="label-text text-gold mb-2">teen account active</p>
            <p className="body-text text-sm text-ink">
              private-by-default · safer content filters · parent supervision optional. you can&rsquo;t change this until you turn 18.
            </p>
          </div>
        )}

        <div className="border border-line p-5 bg-paper">
          <div className="flex items-start gap-3 mb-3">
            {me?.paused_at ? (
              <Play size={18} strokeWidth={1.5} className="text-red mt-0.5" />
            ) : (
              <Pause size={18} strokeWidth={1.5} className="text-muted mt-0.5" />
            )}
            <div className="flex-1">
              <h2 className="display-italic text-lg text-ink">
                {me?.paused_at ? "your account is paused" : "pause your account"}
              </h2>
              <p className="mono-text text-[11px] text-muted mt-1">
                {me?.paused_at
                  ? "your profile is hidden. nobody can pass to you. come back any time."
                  : "hides your profile + whispers · keeps everything · come back when you want."}
              </p>
            </div>
          </div>
          <PauseAccountForm paused={Boolean(me?.paused_at)} />
        </div>

        <div className="border border-line p-5 bg-paper">
          <div className="flex items-start gap-3 mb-3">
            <LogOut size={18} strokeWidth={1.5} className="text-muted mt-0.5" />
            <div className="flex-1">
              <h2 className="display-italic text-lg text-ink">sign out everywhere</h2>
              <p className="mono-text text-[11px] text-muted mt-1">
                ends every active session — phone, web, other browsers. you&rsquo;ll need to sign in again on each device.
              </p>
            </div>
          </div>
          <form action="/auth/sign-out?scope=global" method="post">
            <button type="submit" className="btn-secondary w-full justify-center">
              sign out everywhere
            </button>
          </form>
        </div>

        <div className="border border-warn/40 p-5 bg-paper">
          <h2 className="display-italic text-lg text-ink mb-2">delete account</h2>
          <p className="body-text text-sm text-muted mb-4">
            this is permanent after a 30-day grace window. all your whispers, echoes, passes, vouches, and tunes are removed. nothing is kept.
          </p>
          <DeleteAccountButton />
        </div>
      </section>

      <TabBar />
    </main>
  );
}
