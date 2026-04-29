"use server";

import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requestVerify, checkVerify } from "@/lib/twilio";
import { revalidatePath } from "next/cache";

function normalizePhone(input: string): string | null {
  const trimmed = input.trim().replace(/[\s\-()]/g, "");
  if (!trimmed) return null;
  if (trimmed.startsWith("+")) return /^\+\d{8,15}$/.test(trimmed) ? trimmed : null;
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length >= 11 && digits.length <= 15) return `+${digits}`;
  return null;
}

export async function requestTicketOTP(eventId: string, rawPhone: string): Promise<{ ok: true; phone: string } | { ok: false; error: string }> {
  const phone = normalizePhone(rawPhone);
  if (!phone) return { ok: false, error: "Enter a valid phone number" };

  const admin = createAdminClient();
  const { data: event } = await admin
    .from("live_events")
    .select("id, is_ticketed, ticket_price_cents, status")
    .eq("id", eventId)
    .maybeSingle();
  if (!event) return { ok: false, error: "event not found" };
  const e = event as { is_ticketed: boolean | null; status: string };
  if (!e.is_ticketed) return { ok: false, error: "this event is not ticketed" };
  if (e.status === "finished") return { ok: false, error: "event has ended" };

  const result = await requestVerify(phone);
  if (!result.ok) return { ok: false, error: result.error };
  return { ok: true, phone };
}

export async function confirmTicketPurchase(
  eventId: string,
  phoneE164: string,
  code: string,
): Promise<{ ok: true; ticketId: string } | { ok: false; error: string }> {
  if (!/^\d{4,8}$/.test(code.trim())) return { ok: false, error: "Enter the 6-digit code" };

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "sign-in required" };

  const verified = await checkVerify(phoneE164, code.trim());
  if (!verified.ok) return { ok: false, error: verified.error };
  if (!verified.approved) return { ok: false, error: "Code didn't match. Try again." };

  const admin = createAdminClient();
  const { data: event } = await admin
    .from("live_events")
    .select("id, is_ticketed, ticket_price_cents, status")
    .eq("id", eventId)
    .maybeSingle();
  if (!event) return { ok: false, error: "event not found" };
  const e = event as { is_ticketed: boolean | null; ticket_price_cents: number | null; status: string };
  if (!e.is_ticketed) return { ok: false, error: "this event is not ticketed" };

  const { data: existing } = await admin
    .from("live_event_tickets")
    .select("id")
    .eq("event_id", eventId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (existing) {
    return { ok: true, ticketId: (existing as { id: string }).id };
  }

  const simSession = `sim_${crypto.randomUUID()}`;
  const { data: inserted, error } = await admin
    .from("live_event_tickets")
    .insert({
      event_id: eventId,
      user_id: user.id,
      stripe_session_id: simSession,
      amount_cents: e.ticket_price_cents ?? 500,
      currency: "usd",
      purchase_method: "simulated",
      buyer_phone_e164: phoneE164,
    })
    .select("id")
    .single();
  if (error || !inserted) return { ok: false, error: error?.message ?? "insert failed" };

  revalidatePath(`/live/${eventId}`);
  return { ok: true, ticketId: (inserted as { id: string }).id };
}
