/**
 * Onboarding step 2 of 2 — claim handle.
 * Server component — redirects unauthenticated users to sign-in.
 */
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChatterMark } from "@/components/ChatterMark";
import { HandleClaimForm } from "@/components/HandleClaimForm";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function HandleClaimPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  // Suggest a handle from the email local-part
  const admin = createAdminClient();
  const { data: current } = await admin
    .from("users")
    .select("handle, display_name")
    .eq("id", user.id)
    .maybeSingle();

  const suggestion =
    (user.email?.split("@")[0] ?? "")
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "_")
      .slice(0, 20) || "";

  const isNewHandle = current?.handle?.startsWith("new_") ?? false;

  return (
    <main className="min-h-screen flex flex-col">
      <header className="px-6 sm:px-10 pt-6 sm:pt-8 flex justify-between items-center">
        <Link href="/">
          <ChatterMark size="sm" pulse="breath" />
        </Link>
        <span className="label-text text-muted">Step 2 of 2</span>
      </header>

      <section className="flex-1 px-6 sm:px-10 py-10 sm:py-14">
        <div className="max-w-md mx-auto w-full">
          <p className="label-text text-red mb-6">Claim your handle</p>
          <h1 className="display-text text-3xl sm:text-4xl text-ink mb-3">
            this is who you&rsquo;ll be on chatter.
          </h1>
          <p className="body-text text-muted mb-8">
            handles are permanent. we never rename you.
          </p>

          <HandleClaimForm
            initialHandle={isNewHandle ? suggestion : current?.handle ?? suggestion}
            initialDisplayName={current?.display_name ?? ""}
          />
        </div>
      </section>
    </main>
  );
}
