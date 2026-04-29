/**
 * Create a Stripe Checkout Session for a Ticketed Space.
 *   POST /api/stripe/checkout
 *   Body: { eventId, priceCents }
 * Returns: { url } — client redirects to Stripe-hosted checkout.
 */
import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createTicketedSpaceCheckout } from "@/lib/stripe";

export async function POST(req: Request) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !user.email) {
    return NextResponse.json(
      { ok: false, error: "sign-in required" },
      { status: 401 },
    );
  }

  const body = (await req.json().catch(() => ({}))) as {
    eventId?: string;
    priceCents?: number;
  };
  if (!body.eventId) {
    return NextResponse.json(
      { ok: false, error: "eventId required" },
      { status: 400 },
    );
  }
  const priceCents = Math.max(100, Math.min(10000, body.priceCents ?? 500));

  const admin = createAdminClient();
  const { data: event } = await admin
    .from("live_events")
    .select("id, title, kind, status")
    .eq("id", body.eventId)
    .maybeSingle();
  if (!event) {
    return NextResponse.json({ ok: false, error: "event not found" }, { status: 404 });
  }
  if ((event as { status: string }).status === "finished") {
    return NextResponse.json(
      { ok: false, error: "event has ended" },
      { status: 400 },
    );
  }

  const SITE = "https://chatter.today";
  const result = await createTicketedSpaceCheckout({
    eventId: (event as { id: string }).id,
    eventTitle: (event as { title: string }).title,
    buyerUserId: user.id,
    buyerEmail: user.email,
    priceCents,
    successUrl: `${SITE}/live/${(event as { id: string }).id}?ticket=success&session={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${SITE}/live/${(event as { id: string }).id}?ticket=cancelled`,
  });

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
  }

  return NextResponse.json({ ok: true, url: result.url, sessionId: result.sessionId });
}
