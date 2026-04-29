/**
 * Edit profile — display name, bio, pronouns, location, insider tags (read-only).
 */
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChatterMark } from "@/components/ChatterMark";
import { TabBar } from "@/components/TabBar";
import { EditProfileForm } from "@/components/EditProfileForm";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function EditProfilePage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in");

  const admin = createAdminClient();
  const { data: me } = await admin
    .from("users")
    .select("display_name, handle, bio, pronouns, location, insider_tags")
    .eq("id", user.id)
    .maybeSingle();

  if (!me) redirect("/auth/sign-in");

  return (
    <main className="min-h-screen pb-28">
      <header className="sticky top-0 z-40 bg-canvas/95 backdrop-blur border-b border-line px-5 py-4 flex items-center justify-between">
        <Link href="/settings" className="text-muted hover:text-ink transition">
          ←
        </Link>
        <h1 className="display-italic text-xl text-ink">edit profile</h1>
        <div className="w-4" />
      </header>

      <section className="px-5 py-7">
        <p className="mono-text text-xs text-muted mb-1">@{me.handle} · permanent</p>
        <EditProfileForm
          initialName={me.display_name ?? ""}
          initialBio={me.bio ?? ""}
          initialPronouns={me.pronouns ?? ""}
          initialLocation={me.location ?? ""}
        />

        <div className="mt-10 pt-6 border-t border-line">
          <p className="label-text text-muted mb-2">verified credentials</p>
          {me.insider_tags && me.insider_tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {(me.insider_tags as string[]).map((t) => (
                <span
                  key={t}
                  className="px-3 py-1 border border-gold text-gold mono-text text-xs italic"
                >
                  {t.replace(/_/g, " ")}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-muted text-xs italic">no credentials yet</p>
          )}
          <div className="mono-text text-[11px] text-muted mt-3 flex items-center gap-2">
            <span>verified through review.</span>
            <Link href="/you/credentials" className="underline hover:text-ink">claim a credential →</Link>
          </div>
        </div>
      </section>

      <TabBar />
    </main>
  );
}
