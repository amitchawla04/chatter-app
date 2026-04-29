import "server-only";

const SID = process.env.TWILIO_ACCOUNT_SID;
const TOKEN = process.env.TWILIO_AUTH_TOKEN;
const SERVICE = process.env.TWILIO_VERIFY_SERVICE_SID;

function authHeader() {
  if (!SID || !TOKEN) throw new Error("twilio not configured");
  return `Basic ${Buffer.from(`${SID}:${TOKEN}`).toString("base64")}`;
}

export async function requestVerify(phoneE164: string): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!SERVICE) return { ok: false, error: "verify service not configured" };
  const body = new URLSearchParams({ To: phoneE164, Channel: "sms" });
  const r = await fetch(`https://verify.twilio.com/v2/Services/${SERVICE}/Verifications`, {
    method: "POST",
    headers: { Authorization: authHeader(), "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!r.ok) {
    const text = await r.text();
    return { ok: false, error: `twilio ${r.status}: ${text.slice(0, 200)}` };
  }
  return { ok: true };
}

export async function checkVerify(phoneE164: string, code: string): Promise<{ ok: true; approved: boolean } | { ok: false; error: string }> {
  if (!SERVICE) return { ok: false, error: "verify service not configured" };
  const body = new URLSearchParams({ To: phoneE164, Code: code });
  const r = await fetch(`https://verify.twilio.com/v2/Services/${SERVICE}/VerificationCheck`, {
    method: "POST",
    headers: { Authorization: authHeader(), "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!r.ok) {
    const text = await r.text();
    return { ok: false, error: `twilio ${r.status}: ${text.slice(0, 200)}` };
  }
  const data = (await r.json()) as { status?: string };
  return { ok: true, approved: data.status === "approved" };
}
