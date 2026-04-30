/**
 * Sign-out endpoint. POST to clear the session + redirect to landing.
 *  - Default scope (`local`) signs out this device only.
 *  - `?scope=global` signs out every active session for this user (IP7).
 */
import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createServerClient();
  const url = new URL(request.url);
  const scope = url.searchParams.get("scope") === "global" ? "global" : "local";
  await supabase.auth.signOut({ scope });
  return NextResponse.redirect(new URL("/", request.url), { status: 303 });
}
