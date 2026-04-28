/**
 * Onboarding step 1 of 2 — topic picker.
 * Server component — redirects unauthenticated users to sign-in.
 * Loads featured topics from lib/topics.ts for instant paint.
 */
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChatterMark } from "@/components/ChatterMark";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { OnboardingTopicPicker } from "@/components/OnboardingTopicPicker";
import {
  competitionTopics,
  worldCupTeams,
  premierLeagueClubs,
  breakoutPlayers,
} from "@/lib/topics";

const featured = [
  ...competitionTopics.slice(0, 3),
  ...worldCupTeams.filter((t) =>
    [
      "nt-england",
      "nt-france",
      "nt-spain",
      "nt-brazil",
      "nt-argentina",
      "nt-usa",
      "nt-india",
    ].includes(t.id),
  ),
  ...premierLeagueClubs.filter((t) =>
    [
      "epl-arsenal",
      "epl-man-united",
      "epl-liverpool",
      "epl-man-city",
      "epl-chelsea",
      "epl-tottenham",
    ].includes(t.id),
  ),
  ...breakoutPlayers.slice(0, 6),
];

export default async function OnboardingPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  // Gate: require age verification before topic picker
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const admin = createAdminClient();
  const { data: me } = await admin
    .from("users")
    .select("age_verified_at")
    .eq("id", user.id)
    .maybeSingle();

  if (!me?.age_verified_at) {
    redirect("/onboarding/age");
  }

  return (
    <main className="min-h-screen flex flex-col">
      <header className="px-6 sm:px-10 pt-6 sm:pt-8 flex justify-between items-center">
        <Link href="/">
          <ChatterMark size="sm" pulse="breath" />
        </Link>
        <span className="label-text text-muted">Step 1 of 2</span>
      </header>

      <section className="flex-1 px-6 sm:px-10 py-10 sm:py-14">
        <div className="max-w-3xl mx-auto w-full">
          <p className="label-text text-red mb-6">
            Tune into what you care about
          </p>
          <h1 className="display-text text-4xl sm:text-5xl text-ink mb-3">
            what do you want to hear about?
          </h1>
          <p className="body-text text-muted mb-10">
            pick at least 5 topics. whispers from insiders on each will land in your feed.
          </p>

          <OnboardingTopicPicker
            topics={featured.map((t) => ({ id: t.id, name: t.name, emoji: t.emoji ?? null }))}
          />
        </div>
      </section>
    </main>
  );
}
