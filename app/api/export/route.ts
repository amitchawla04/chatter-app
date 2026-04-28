/**
 * Data export endpoint — returns full user-data JSON archive.
 * Pact promise 2.
 */
import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "not signed in" }, { status: 401 });
  }

  const admin = createAdminClient();
  const [profile, whispers, echoes, passesIn, passesOut, tunes, vouchesGiven, saves, corrections] =
    await Promise.all([
      admin.from("users").select("*").eq("id", user.id).maybeSingle(),
      admin.from("whispers").select("*").eq("author_id", user.id).order("created_at", { ascending: true }),
      admin.from("echoes").select("*").eq("user_id", user.id),
      admin.from("passes").select("*").eq("to_user_id", user.id),
      admin.from("passes").select("*").eq("from_user_id", user.id),
      admin.from("tunes").select("*").eq("user_id", user.id),
      admin.from("vouches").select("*").eq("author_id", user.id),
      admin.from("saves").select("*").eq("user_id", user.id),
      admin.from("corrections").select("*").eq("author_id", user.id),
    ]);

  const archive = {
    exported_at: new Date().toISOString(),
    pact_version: "1.3",
    user: profile.data,
    whispers: whispers.data ?? [],
    echoes: echoes.data ?? [],
    passes_received: passesIn.data ?? [],
    passes_sent: passesOut.data ?? [],
    tunes: tunes.data ?? [],
    vouches_given: vouchesGiven.data ?? [],
    saves: saves.data ?? [],
    corrections: corrections.data ?? [],
  };

  const handle =
    (profile.data as { handle?: string } | null)?.handle ?? "user";
  return new NextResponse(JSON.stringify(archive, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="chatter-export-${handle}-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}
