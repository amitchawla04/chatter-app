/**
 * Compose page — server component.
 * Loads user's tuned topics + renders the compose form (client component).
 */
import { redirect } from "next/navigation";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ComposeForm } from "@/components/ComposeForm";

export default async function ComposePage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  const admin = createAdminClient();
  const { data: tunes } = await admin
    .from("tunes")
    .select("topic_id, topics:topic_id(id, name, emoji)")
    .eq("user_id", user.id)
    .limit(12);

  type TuneRow = { topic_id: string; topics: { id: string; name: string; emoji: string | null } };
  const tunedTopics = ((tunes ?? []) as unknown as TuneRow[])
    .map((t) => t.topics)
    .filter((t): t is NonNullable<typeof t> => Boolean(t));

  // Fallback: if user hasn't tuned anything yet, offer a sampling of popular topics
  let available = tunedTopics;
  if (available.length === 0) {
    const { data: fallback } = await admin
      .from("topics")
      .select("id, name, emoji")
      .order("tuned_in_count", { ascending: false, nullsFirst: false })
      .limit(8);
    available = (fallback ?? []) as typeof available;
  }

  // If ?topic=X is passed and the topic isn't in the user's available list, surface it too
  if (params.topic && !available.find((t) => t.id === params.topic)) {
    const { data: addl } = await admin
      .from("topics")
      .select("id, name, emoji")
      .eq("id", params.topic)
      .maybeSingle();
    if (addl) available = [addl, ...available];
  }

  return <ComposeForm topics={available} initialTopicId={params.topic ?? available[0]?.id ?? ""} />;
}
