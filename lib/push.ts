import "server-only";
/**
 * Server-side Web Push delivery.
 * Pact-aligned: never sends engagement metrics. Only:
 *   - "pass.received" — someone passed a whisper to you
 *   - "live.starts" — a topic you tuned into went LIVE
 *   - "vouch.received" — someone vouched for you on a topic
 *   - "thread.invited" — added to a village thread
 *   - "correction.posted" — an insider corrected your whisper
 */
import webpush from "web-push";
import { createAdminClient } from "@/lib/supabase/admin";

let vapidConfigured = false;

function ensureVapid(): boolean {
  if (vapidConfigured) return true;
  const pub = process.env.VAPID_PUBLIC_KEY?.trim();
  const priv = process.env.VAPID_PRIVATE_KEY?.trim();
  const subj = process.env.VAPID_SUBJECT?.trim() ?? "mailto:amit.chawla@reward360.co";
  if (!pub || !priv) return false;
  try {
    webpush.setVapidDetails(subj, pub, priv);
    vapidConfigured = true;
    return true;
  } catch (err) {
    console.error("[push] VAPID setup failed:", err);
    return false;
  }
}

export type ChatterNotificationKind =
  | "pass.received"
  | "live.starts"
  | "vouch.received"
  | "thread.invited"
  | "correction.posted";

export interface ChatterNotification {
  kind: ChatterNotificationKind;
  title: string;
  body: string;
  url?: string;
  badge?: string;
  icon?: string;
}

/**
 * Send a push notification to all of a user's active subscriptions.
 * Drops dead subscriptions (410/404) automatically.
 */
export async function notifyUser(
  userId: string,
  payload: ChatterNotification,
): Promise<{ sent: number; pruned: number }> {
  if (!ensureVapid()) {
    console.warn("[push] VAPID keys missing or invalid — skipping send");
    return { sent: 0, pruned: 0 };
  }

  const admin = createAdminClient();
  const { data: subs } = await admin
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .eq("user_id", userId);

  if (!subs || subs.length === 0) return { sent: 0, pruned: 0 };

  const message = JSON.stringify({
    title: payload.title,
    body: payload.body,
    url: payload.url ?? "/home",
    icon: payload.icon ?? "/icon",
    badge: payload.badge ?? "/icon",
    kind: payload.kind,
  });

  let sent = 0;
  let pruned = 0;

  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: s.endpoint,
            keys: { p256dh: s.p256dh, auth: s.auth },
          },
          message,
          { TTL: 60 * 60 * 6 }, // 6h
        );
        sent += 1;
      } catch (err: unknown) {
        const status = (err as { statusCode?: number })?.statusCode;
        if (status === 404 || status === 410) {
          // Subscription gone — prune
          await admin.from("push_subscriptions").delete().eq("id", s.id);
          pruned += 1;
        } else {
          console.error("[push] send failed", err);
        }
      }
    }),
  );

  return { sent, pruned };
}

/**
 * Quick test endpoint — sends a "hello" to all of the user's subscriptions.
 * Useful for verifying the chain end-to-end from /settings/notifications.
 */
export async function sendTestPush(userId: string) {
  return notifyUser(userId, {
    kind: "pass.received",
    title: "chatter",
    body: "push notifications are live · you're hearing the village",
    url: "/home",
  });
}
