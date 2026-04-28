/**
 * Data export — Pact promise 2: "your whispers are yours · export everything · delete everything · any time."
 */
import Link from "next/link";
import { redirect } from "next/navigation";
import { Database, Download, Trash2 } from "lucide-react";
import { ChatterMark } from "@/components/ChatterMark";
import { TabBar } from "@/components/TabBar";
import { DataExportButton } from "@/components/DataExportButton";
import { DeleteAccountButton } from "@/components/DeleteAccountButton";
import { createClient as createServerClient } from "@/lib/supabase/server";

export default async function DataPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in");

  return (
    <main className="min-h-screen pb-28">
      <header className="sticky top-0 z-40 bg-canvas/95 backdrop-blur border-b border-line px-5 py-4 flex items-center justify-between">
        <Link href="/settings" className="text-muted hover:text-ink transition">
          ←
        </Link>
        <h1 className="display-italic text-xl text-ink">your data</h1>
        <div className="w-4" />
      </header>

      <section className="px-5 py-7">
        <p className="display-italic text-2xl text-ink mb-3">
          your whispers are yours.
        </p>
        <p className="body-text text-muted mb-8">
          this is Pact promise 2. you can export everything you&rsquo;ve created on chatter as a JSON archive, anytime. you can delete everything, anytime. we keep nothing past 30 days after deletion.
        </p>

        <div className="space-y-3">
          <div className="border border-line p-5 bg-paper">
            <div className="flex items-start gap-3 mb-3">
              <Download size={18} strokeWidth={1.5} className="text-red mt-0.5" />
              <div className="flex-1">
                <h2 className="display-italic text-lg text-ink">export everything</h2>
                <p className="mono-text text-[11px] text-muted mt-1">
                  whispers · echoes · passes · vouches · tunes · profile — JSON archive
                </p>
              </div>
            </div>
            <DataExportButton />
          </div>

          <div className="border border-line p-5 bg-paper">
            <div className="flex items-start gap-3 mb-3">
              <Database size={18} strokeWidth={1.5} className="text-muted mt-0.5" />
              <div className="flex-1">
                <h2 className="display-italic text-lg text-ink">pause your account</h2>
                <p className="mono-text text-[11px] text-muted mt-1">
                  hide your profile and whispers · everything stays · come back any time
                </p>
              </div>
            </div>
            <Link href="/settings/account" className="btn-secondary inline-flex">
              go to account
            </Link>
          </div>

          <div className="border border-warn/40 p-5 bg-paper">
            <div className="flex items-start gap-3 mb-3">
              <Trash2 size={18} strokeWidth={1.5} className="text-warn mt-0.5" />
              <div className="flex-1">
                <h2 className="display-italic text-lg text-ink">delete everything</h2>
                <p className="mono-text text-[11px] text-muted mt-1">
                  every whisper · echo · pass · vouch · tune · profile — gone in 30 days. no recovery.
                </p>
              </div>
            </div>
            <DeleteAccountButton />
          </div>
        </div>
      </section>

      <TabBar />
    </main>
  );
}
