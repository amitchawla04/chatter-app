/**
 * Watch-Together heartbeat — bumps last_seen_at for the current user on this event.
 * Returns the active viewer roster (last 60s) so the client can render together.
 */
import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: eventId } = await params;
  const url = new URL(req.url);
  const op = url.searchParams.get("op");

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: "auth" }, { status: 401 });

  const admin = createAdminClient();

  // sendBeacon-friendly leave path — beacons can only POST, so we accept ?op=leave
  if (op === "leave") {
    await admin
      .from("live_event_viewers")
      .delete()
      .eq("event_id", eventId)
      .eq("user_id", user.id);
    return NextResponse.json({ ok: true, op: "leave" });
  }

  await admin
    .from("live_event_viewers")
    .upsert(
      {
        event_id: eventId,
        user_id: user.id,
        last_seen_at: new Date().toISOString(),
      },
      { onConflict: "event_id,user_id" },
    );

  // Return active viewers (last 60s) to render together-with chips
  const since = new Date(Date.now() - 60_000).toISOString();
  const { data: viewers } = await admin
    .from("live_event_viewers")
    .select("user_id, joined_at, users:user_id ( handle, is_charter )")
    .eq("event_id", eventId)
    .gte("last_seen_at", since)
    .order("joined_at", { ascending: true })
    .limit(20);

  type Row = {
    user_id: string;
    joined_at: string;
    users: { handle: string; is_charter: boolean | null } | null;
  };
  const active = ((viewers ?? []) as unknown as Row[])
    .filter((v) => v.users)
    .map((v) => ({
      user_id: v.user_id,
      handle: v.users!.handle,
      is_charter: Boolean(v.users!.is_charter),
      is_self: v.user_id === user.id,
    }));

  return NextResponse.json({ ok: true, viewers: active, count: active.length });
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: eventId } = await params;
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });
  const admin = createAdminClient();
  await admin
    .from("live_event_viewers")
    .delete()
    .eq("event_id", eventId)
    .eq("user_id", user.id);
  return NextResponse.json({ ok: true });
}
