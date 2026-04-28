/**
 * Teen-account gate — X17 P1 feature.
 * After sign-up, user declares age band. Under-18 → teen-account defaults:
 *   - scope defaults to circle (not public)
 *   - stricter content filters
 *   - parent-supervision email optional
 * 18+ → regular account.
 *
 * We do NOT store exact DOB. We store age-band confirmation + timestamp.
 * Compliance: COPPA (US under-13 block) · EU DSA · UK OSA · Gen Z Theme 5.
 */
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChatterMark } from "@/components/ChatterMark";
import { AgeGateForm } from "@/components/AgeGateForm";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AgeGatePage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/sign-in");

  const admin = createAdminClient();
  const { data: me } = await admin
    .from("users")
    .select("age_verified_at, is_teen_account")
    .eq("id", user.id)
    .maybeSingle();

  // If already verified, skip this step
  if (me?.age_verified_at) {
    redirect("/onboarding");
  }

  return (
    <main className="min-h-screen flex flex-col">
      <header className="px-6 sm:px-10 pt-6 sm:pt-8 flex justify-between items-center">
        <Link href="/">
          <ChatterMark size="sm" pulse="breath" />
        </Link>
        <span className="label-text text-muted">one question</span>
      </header>

      <section className="flex-1 px-6 sm:px-10 py-12 sm:py-20">
        <div className="max-w-md mx-auto w-full">
          <p className="label-text text-red mb-6">age · once · private</p>
          <h1 className="display-text text-3xl sm:text-4xl text-ink mb-5">
            how old are you?
          </h1>
          <p className="body-text text-muted mb-10">
            we don&rsquo;t store your birthday or share this answer. we use it once to set sensible defaults — then it goes away.
          </p>

          <AgeGateForm />

          <p className="mono-text text-xs text-muted mt-10 leading-relaxed">
            under-18 accounts get private-by-default, safer content filters, and
            optional parent supervision. you can change settings later — but the
            guardrails exist because we verify humans, we don&rsquo;t surveil them.
          </p>
        </div>
      </section>
    </main>
  );
}
