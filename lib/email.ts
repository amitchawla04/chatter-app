import "server-only";
/**
 * Server-side email delivery via Resend.
 * All transactional emails — welcome, pass-received, thread-invited,
 * charter-invite — flow through here.
 *
 * Pact alignment: zero engagement-metric emails. No "you got 12 echoes"
 * digests. No streaks. Only signal-bearing events.
 *
 * Setup:
 *   RESEND_API_KEY in Vercel env (re_...)
 *   RESEND_FROM_EMAIL in Vercel env (default: onboarding@resend.dev)
 *
 * Until a custom domain is verified at https://resend.com/domains, the
 * default `onboarding@resend.dev` will work for sends to verified addresses
 * only — production needs a domain.
 */
import { Resend } from "resend";

let _resend: Resend | null = null;
function getResend(): Resend | null {
  if (_resend) return _resend;
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return null;
  _resend = new Resend(key);
  return _resend;
}

const FROM = (process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev").trim();
const BRAND = "chatter";
const BRAND_FROM = `${BRAND} <${FROM}>`;
const SITE = "https://chatter.today";

interface SendResult {
  ok: boolean;
  id?: string;
  error?: string;
}

async function send(params: {
  to: string;
  subject: string;
  html: string;
  text: string;
  tag?: string;
}): Promise<SendResult> {
  const r = getResend();
  if (!r) {
    console.warn("[email] RESEND_API_KEY missing — skipping send");
    return { ok: false, error: "RESEND_API_KEY missing" };
  }
  try {
    const { data, error } = await r.emails.send({
      from: BRAND_FROM,
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
      tags: params.tag ? [{ name: "kind", value: params.tag }] : undefined,
    });
    if (error) {
      console.error("[email] resend error", error);
      return { ok: false, error: error.message };
    }
    return { ok: true, id: data?.id };
  } catch (e) {
    console.error("[email] send failed", e);
    return { ok: false, error: e instanceof Error ? e.message : "unknown" };
  }
}

/**
 * Visual register matching the app: warm-canvas background, near-black ink,
 * red period, Cormorant italic display, Inter body.
 *
 * Email clients ignore most modern CSS; we keep it inline + tabular.
 * Keep this template simple — it's read in 3 seconds and dismissed.
 */
function shell(args: { headline: string; body: string; cta?: { label: string; url: string }; footer?: string }) {
  const { headline, body, cta, footer } = args;
  const html = `
    <!doctype html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>chatter</title>
    </head>
    <body style="margin:0;padding:0;background:#FAF9F6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0A0A0A;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#FAF9F6;">
        <tr>
          <td align="center" style="padding:40px 20px;">
            <table role="presentation" width="560" cellspacing="0" cellpadding="0" border="0" style="background:#FFFFFF;border:1px solid #E8E4DC;">
              <tr>
                <td style="padding:32px 36px 16px 36px;">
                  <span style="font-family:Georgia,serif;font-style:italic;font-size:24px;color:#0A0A0A;letter-spacing:-0.02em;">chatter<span style="color:#FF2D2D;">.</span></span>
                </td>
              </tr>
              <tr>
                <td style="padding:8px 36px 12px 36px;">
                  <h1 style="font-family:Georgia,serif;font-style:italic;font-weight:500;font-size:30px;line-height:1.15;color:#0A0A0A;margin:0 0 16px 0;letter-spacing:-0.02em;">${headline}</h1>
                  <div style="font-size:15px;line-height:1.55;color:#0A0A0A;">${body}</div>
                </td>
              </tr>
              ${cta ? `
              <tr>
                <td style="padding:24px 36px 36px 36px;">
                  <a href="${cta.url}" style="display:inline-block;padding:12px 24px;background:#FF2D2D;color:#FFFFFF;text-decoration:none;font-weight:500;font-size:14px;">${cta.label}</a>
                </td>
              </tr>
              ` : ""}
              <tr>
                <td style="padding:20px 36px 28px 36px;border-top:1px solid #F0EDE6;">
                  <p style="margin:0;font-size:11px;color:#767676;letter-spacing:0.04em;font-family:ui-monospace,Consolas,monospace;">
                    ${footer ?? "you're getting this because chatter only emails on signal — never engagement metrics. <a href='" + SITE + "/settings/notifications' style='color:#FF2D2D;text-decoration:none;'>preferences</a> · <a href='" + SITE + "/pact' style='color:#FF2D2D;text-decoration:none;'>the pact</a>"}
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `.trim();
  return html;
}

// ─── Welcome (after charter-invite redemption or first sign-in) ──────────────
export async function sendWelcomeEmail(params: {
  to: string;
  displayName: string;
  handle: string;
  isCharter?: boolean;
}): Promise<SendResult> {
  const charterLine = params.isCharter
    ? `<p>You've been added to the <span style="color:#C9A84C;font-style:italic;">charter cohort</span> — among the first to shape what chatter becomes. Your whispers carry the gold mark.</p>`
    : "";
  const html = shell({
    headline: `welcome, ${params.displayName}.`,
    body: `
      <p style="margin:0 0 16px 0;">Your handle is <strong>@${params.handle}</strong>. It's permanent.</p>
      ${charterLine}
      <p style="margin:16px 0 0 0;">Three things chatter doesn't do, ever: sell your data, train AI on your whispers, or push engagement metrics. The full <a href="${SITE}/pact" style="color:#FF2D2D;">14-promise Pact</a> is the whole product brief.</p>
    `,
    cta: { label: "open chatter →", url: `${SITE}/home` },
  });
  const text = `welcome, ${params.displayName}.\n\nYour handle is @${params.handle}. It's permanent.${params.isCharter ? "\n\nYou're in the charter cohort.\n" : ""}\n\nNo data sold. No AI training. No engagement metrics pushed. The Pact: ${SITE}/pact\n\nOpen chatter: ${SITE}/home`;
  return send({
    to: params.to,
    subject: `welcome to chatter, @${params.handle}`,
    html,
    text,
    tag: "welcome",
  });
}

// ─── Pass received ──────────────────────────────────────────────────────────
export async function sendPassReceivedEmail(params: {
  to: string;
  fromHandle: string;
  whisperExcerpt: string;
  note?: string;
  whisperUrl: string;
}): Promise<SendResult> {
  const html = shell({
    headline: `@${params.fromHandle} passed you a whisper.`,
    body: `
      <blockquote style="margin:0 0 12px 0;padding:0 0 0 18px;border-left:2px solid #FF2D2D;font-family:Georgia,serif;font-style:italic;font-size:18px;line-height:1.35;color:#0A0A0A;">
        “${params.whisperExcerpt}”
      </blockquote>
      ${params.note ? `<p style="margin:16px 0;color:#767676;font-style:italic;border-left:1px solid #C9A84C;padding-left:14px;">note: ${params.note}</p>` : ""}
      <p style="margin:16px 0 0 0;color:#767676;font-size:13px;">A pass is one-to-one. They picked you, specifically.</p>
    `,
    cta: { label: "open it →", url: params.whisperUrl },
  });
  const text = `@${params.fromHandle} passed you a whisper.\n\n"${params.whisperExcerpt}"${params.note ? `\n\nnote: ${params.note}` : ""}\n\nOpen: ${params.whisperUrl}`;
  return send({
    to: params.to,
    subject: `@${params.fromHandle} passed you a whisper`,
    html,
    text,
    tag: "pass-received",
  });
}

// ─── Thread invited ─────────────────────────────────────────────────────────
export async function sendThreadInvitedEmail(params: {
  to: string;
  fromHandle: string;
  threadName: string;
  threadUrl: string;
  topicName: string;
}): Promise<SendResult> {
  const html = shell({
    headline: `@${params.fromHandle} added you to "${params.threadName}".`,
    body: `
      <p style="margin:0 0 16px 0;">A village thread, scoped to <strong>${params.topicName}</strong>. Up to 12 villagers · private to participants · no public counts.</p>
    `,
    cta: { label: "open the thread →", url: params.threadUrl },
  });
  const text = `@${params.fromHandle} added you to "${params.threadName}" (${params.topicName} village thread).\n\nOpen: ${params.threadUrl}`;
  return send({
    to: params.to,
    subject: `you've been added to a village thread`,
    html,
    text,
    tag: "thread-invited",
  });
}

// ─── Charter invite redemption ──────────────────────────────────────────────
export async function sendCharterRedemptionEmail(params: {
  to: string;
  handle: string;
}): Promise<SendResult> {
  const html = shell({
    headline: `you're a charter member.`,
    body: `
      <p style="margin:0 0 16px 0;">@${params.handle}, your invite code worked. You're among the first 500 contributors shaping what chatter becomes.</p>
      <p style="margin:16px 0;">Charter benefits:</p>
      <ul style="margin:0 0 16px 0;padding-left:20px;color:#0A0A0A;">
        <li>Gold-bordered profile + the ✦ mark next to your handle</li>
        <li>Whispers surface first in credential-weighted reply ranking</li>
        <li>Direct line to the founder (this is one of them)</li>
        <li>Vote on Pact-promise updates before they ship</li>
      </ul>
    `,
    cta: { label: "claim your handle →", url: `${SITE}/onboarding/handle` },
  });
  const text = `you're a charter member.\n\n@${params.handle}, your invite code worked. Charter perks:\n- Gold profile border + ✦ mark\n- Replies surface first via credential ranking\n- Direct founder line\n- Vote on Pact updates\n\nClaim: ${SITE}/onboarding/handle`;
  return send({
    to: params.to,
    subject: `you're charter · welcome to chatter`,
    html,
    text,
    tag: "charter-redemption",
  });
}

// ─── Insider correction posted on your whisper ──────────────────────────────
export async function sendCorrectionEmail(params: {
  to: string;
  insiderHandle: string;
  insiderTag?: string | null;
  correctionText: string;
  whisperUrl: string;
}): Promise<SendResult> {
  const html = shell({
    headline: `an insider pushed back on your whisper.`,
    body: `
      <p style="margin:0 0 12px 0;color:#767676;font-size:13px;">@${params.insiderHandle}${params.insiderTag ? ` <span style="color:#C9A84C;font-style:italic;">· ${params.insiderTag}</span>` : ""} corrected:</p>
      <blockquote style="margin:0 0 16px 0;padding:14px 18px;background:#FAF3E0;border-left:2px solid #C9A84C;font-size:15px;line-height:1.5;color:#0A0A0A;">
        ${params.correctionText}
      </blockquote>
      <p style="margin:16px 0 0 0;color:#767676;font-size:13px;">truth visible in the feed isn't an attack — it's the system working. Read the correction in context.</p>
    `,
    cta: { label: "see the thread →", url: params.whisperUrl },
  });
  const text = `an insider pushed back on your whisper.\n\n@${params.insiderHandle}${params.insiderTag ? ` (${params.insiderTag})` : ""}: "${params.correctionText}"\n\nSee thread: ${params.whisperUrl}`;
  return send({
    to: params.to,
    subject: `@${params.insiderHandle} corrected your whisper`,
    html,
    text,
    tag: "correction",
  });
}
