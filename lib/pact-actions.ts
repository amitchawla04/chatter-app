"use server";

import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email";

export async function reportPactViolation(input: {
  promise: string;
  description: string;
  contactEmail?: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const promise = input.promise.trim();
  const description = input.description.trim();
  if (!promise) return { ok: false, error: "Pick which promise was broken" };
  if (description.length < 20) return { ok: false, error: "Tell us what happened (20+ chars)" };
  if (description.length > 2000) return { ok: false, error: "Keep it under 2000 chars" };

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Persist as a moderation report so it surfaces in the existing /moderation queue.
  const admin = createAdminClient();
  const { error } = await admin.from("reports").insert({
    reporter_id: user?.id ?? null,
    target_kind: "topic",
    target_id: "PACT_VIOLATION",
    reason: `Pact violation: ${promise}`,
    context: description,
  });
  if (error) return { ok: false, error: error.message };

  // Email the founder directly — Pact violations are board-level per goal G6.
  try {
    await sendEmail({
      to: "amit.chawla@reward360.co",
      subject: `[PACT VIOLATION] ${promise}`,
      html: `<h2>Pact violation reported</h2>
<p><strong>Promise:</strong> ${escapeHtml(promise)}</p>
<p><strong>Reporter:</strong> ${user?.email ?? input.contactEmail ?? "anonymous"}</p>
<pre style="white-space: pre-wrap; font-family: ui-monospace, monospace;">${escapeHtml(description)}</pre>`,
    });
  } catch {
    // email failure is not fatal — the report is persisted regardless
  }
  return { ok: true };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
