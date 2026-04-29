/**
 * Stripe webhook endpoint.
 * Handles: checkout.session.completed, payment_intent.succeeded, account.updated.
 *
 * Configure at: https://dashboard.stripe.com/test/webhooks → Add endpoint
 *   URL: https://chatter.today/api/stripe/webhook
 *   Events: checkout.session.completed · payment_intent.succeeded · account.updated
 *   Copy the "Signing secret" → set STRIPE_WEBHOOK_SECRET in Vercel env.
 */
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { verifyWebhookSignature } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "missing stripe-signature" }, { status: 400 });
  }

  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = verifyWebhookSignature({ body, signature: sig });
  } catch (err) {
    console.error("[stripe/webhook] signature verification failed", err);
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  const admin = createAdminClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const meta = session.metadata ?? {};
      if (meta.kind === "ticketed_space" && meta.event_id && meta.buyer_user_id) {
        // Grant ticket — write to live_event_tickets table (creates if not exists in future migration)
        await admin.from("live_event_tickets").insert({
          event_id: meta.event_id,
          user_id: meta.buyer_user_id,
          stripe_session_id: session.id,
          amount_cents: session.amount_total ?? 0,
          currency: session.currency ?? "usd",
        }).select().maybeSingle();
        console.log(
          JSON.stringify({
            level: "info",
            type: "ticket_granted",
            event_id: meta.event_id,
            buyer: meta.buyer_user_id,
            session: session.id,
          }),
        );
      }
      break;
    }
    case "payment_intent.succeeded": {
      // Future: CCEP payout confirmations, creator subs
      break;
    }
    case "account.updated": {
      // Future: charter creator Connect account state changes
      break;
    }
    default:
      // Acknowledge but don't act on other event types
      break;
  }

  return NextResponse.json({ received: true });
}
