import "server-only";
/**
 * Server-side Stripe client + helpers.
 *
 * Use cases:
 *  - Ticketed Spaces (paid live audio, founder G-Q3-creator monetization)
 *  - CCEP equity payouts to charter members (future)
 *  - Apple Pay via Stripe Elements (Pact-friendly: Stripe is merchant of record)
 *
 * Pact alignment: Stripe handles all PII (card numbers); we never see them.
 * No payment data is stored on Chatter servers. Only checkout session IDs.
 */
import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) {
    throw new Error(
      "[stripe] STRIPE_SECRET_KEY missing — add to Vercel env",
    );
  }
  _stripe = new Stripe(key, {
    typescript: true,
    appInfo: {
      name: "Chatter",
      url: "https://chatter.today",
    },
  });
  return _stripe;
}

/**
 * Create a Stripe Checkout Session for a Ticketed Space.
 * Returns the session URL the client should redirect to.
 */
export async function createTicketedSpaceCheckout(params: {
  eventId: string;
  eventTitle: string;
  buyerUserId: string;
  buyerEmail: string;
  priceCents: number; // Stripe expects cents (e.g. $5.00 = 500)
  successUrl: string;
  cancelUrl: string;
}): Promise<{ ok: true; url: string; sessionId: string } | { ok: false; error: string }> {
  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      // Apple Pay + Google Pay automatically supported via Stripe Elements
      // when domain is verified at https://dashboard.stripe.com/settings/payments/apple_pay
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Chatter Space · ${params.eventTitle}`,
              description: "Live audio room access · single-event ticket",
            },
            unit_amount: params.priceCents,
          },
          quantity: 1,
        },
      ],
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      customer_email: params.buyerEmail,
      metadata: {
        kind: "ticketed_space",
        event_id: params.eventId,
        buyer_user_id: params.buyerUserId,
      },
      // 30-min expiry on session
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
    });
    if (!session.url) {
      return { ok: false, error: "Stripe session has no URL" };
    }
    return { ok: true, url: session.url, sessionId: session.id };
  } catch (err) {
    console.error("[stripe] createCheckout error", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Stripe error",
    };
  }
}

/**
 * Verify a webhook signature. Used by /api/stripe/webhook.
 * Throws if invalid — caller should return 400.
 */
export function verifyWebhookSignature(params: {
  body: string;
  signature: string;
}): Stripe.Event {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!secret) {
    throw new Error("STRIPE_WEBHOOK_SECRET missing");
  }
  return stripe.webhooks.constructEvent(params.body, params.signature, secret);
}
