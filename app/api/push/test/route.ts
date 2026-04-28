/**
 * Send a test push to the current user — verifies the full chain end-to-end.
 */
import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { sendTestPush } from "@/lib/push";

export async function POST() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const result = await sendTestPush(user.id);
  return NextResponse.json({ ok: true, ...result });
}
