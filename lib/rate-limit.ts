/**
 * Rate limiting — Pact-aligned spam prevention.
 *
 * Caps (from Methodology v0.4 + 03-FEATURE-INVENTORY G12):
 *   - Whisper compose: 10 per hour per user
 *   - Echo: 100 per hour per user
 *   - Pass: 100 per day per user
 *   - Correction submit: 5 per day per user
 *   - Reply: 30 per hour per user
 *
 * Implementation: rolling-window counter table in Supabase. Lightweight,
 * survives serverless cold-starts (no in-memory cache that resets).
 *
 * Usage:
 *   const { allowed, retry_after_seconds } = await checkRate("whisper", userId);
 *   if (!allowed) return { ok: false, error: "slow down · try again in N seconds" };
 */

import { createAdminClient } from "@/lib/supabase/admin";

type Action = "whisper" | "echo" | "pass" | "correction" | "reply";

const LIMITS: Record<Action, { count: number; window_seconds: number; soft_message: string }> = {
  whisper: {
    count: 10,
    window_seconds: 3600,
    soft_message: "you've sent 10 whispers in the last hour. take a breath. try again in",
  },
  echo: {
    count: 100,
    window_seconds: 3600,
    soft_message: "you've echoed a lot recently. take a breath. try again in",
  },
  pass: {
    count: 100,
    window_seconds: 86400,
    soft_message: "you've passed 100 whispers today. that's a full village. try again in",
  },
  correction: {
    count: 5,
    window_seconds: 86400,
    soft_message: "5 corrections in a day is the limit. quality over quantity. try again in",
  },
  reply: {
    count: 30,
    window_seconds: 3600,
    soft_message: "30 replies an hour. give the conversation room to breathe. try again in",
  },
};

interface RateCheckResult {
  allowed: boolean;
  remaining: number;
  retry_after_seconds: number;
  message: string | null;
}

export async function checkRate(action: Action, userId: string): Promise<RateCheckResult> {
  const cfg = LIMITS[action];
  const admin = createAdminClient();

  const windowStart = new Date(Date.now() - cfg.window_seconds * 1000).toISOString();

  // Count actions in the rolling window
  const { count, error } = await admin
    .from("rate_events")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("action", action)
    .gte("created_at", windowStart);

  if (error) {
    // Fail-open on infra error — never block users due to our bug
    console.error("rate_check error", error);
    return { allowed: true, remaining: cfg.count, retry_after_seconds: 0, message: null };
  }

  const used = count ?? 0;

  if (used >= cfg.count) {
    // Find the oldest event in the window to compute retry-after
    const { data: oldest } = await admin
      .from("rate_events")
      .select("created_at")
      .eq("user_id", userId)
      .eq("action", action)
      .gte("created_at", windowStart)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    const oldestTs = oldest ? new Date(oldest.created_at).getTime() : Date.now();
    const retryAt = oldestTs + cfg.window_seconds * 1000;
    const retryAfter = Math.max(1, Math.ceil((retryAt - Date.now()) / 1000));

    return {
      allowed: false,
      remaining: 0,
      retry_after_seconds: retryAfter,
      message: `${cfg.soft_message} ${formatDuration(retryAfter)}.`,
    };
  }

  // Record the event (fire-and-forget; we already returned allowed)
  admin
    .from("rate_events")
    .insert({ user_id: userId, action })
    .then(() => undefined, (err) => console.error("rate_record error", err));

  return {
    allowed: true,
    remaining: cfg.count - used - 1,
    retry_after_seconds: 0,
    message: null,
  };
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds} seconds`;
  if (seconds < 3600) return `${Math.ceil(seconds / 60)} minutes`;
  return `${Math.ceil(seconds / 3600)} hours`;
}
