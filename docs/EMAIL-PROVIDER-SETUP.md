# Email Provider Setup — Resend

**Status:** Founder action required (5 minutes · one-time)
**Why:** Supabase free-tier email rate-limits at 4 emails/hour and routes via `noreply@mail.app.supabase.io` which Gmail flags as spam. For 5-user testing + public launch, we need a real provider.

## Why Resend

- Free tier: 3,000 emails/month, 100/day
- Drops into Supabase Auth as standard SMTP (no code changes)
- Strong Gmail deliverability (DKIM + SPF set up by us)
- API exists if we ever need transactional emails outside auth
- Used by Vercel itself for their auth — same vendor stack

## 5-minute setup

### 1. Create Resend account
- Go to https://resend.com → sign up with `amit.chawla@reward360.co`
- Free, no credit card

### 2. Verify a domain (or use sandbox)
- For pre-launch: use Resend's `onboarding@resend.dev` sender (works immediately, no DNS)
- For public launch: add a domain you own (e.g., `chatter.app`, `getchatter.com`) → Resend will give you 3 DNS records (DKIM/SPF/DMARC) to add at your registrar

### 3. Generate an SMTP password
- Resend Dashboard → API Keys → Create new key (full-access)
- Copy the key starting `re_...`

### 4. Wire into Supabase
- Open: https://supabase.com/dashboard/project/kpgsrntbmzdqvspcyekf/auth/templates
- Scroll to **SMTP Settings** → toggle "Enable Custom SMTP" ON
- Fill in:
  - **Sender email:** `onboarding@resend.dev` (for now) or `noreply@your-domain.app` (after domain verify)
  - **Sender name:** `Chatter`
  - **Host:** `smtp.resend.com`
  - **Port:** `465`
  - **Username:** `resend`
  - **Password:** the `re_...` API key from step 3
- Save

### 5. Increase rate limits
Same page → **Rate Limits** section:
- Confirmation emails: bump from 4/hr to **30/hr** (still safe, Resend allows 100/day)
- Password recovery: same
- Save

### 6. Test
- Open `https://chatter.today/auth/sign-in` in private browser
- Type any test email → should arrive in 5-10 seconds with Chatter as sender, OTP visible

That's it. Email rate-limit issue solved permanently.

## Email template polish (optional, post-domain-verify)

Replace Supabase default template with branded HTML:
- https://supabase.com/dashboard/project/kpgsrntbmzdqvspcyekf/auth/templates → Magic Link

Suggested body:

```html
<h2 style="font-family: Cormorant Garamond, Georgia, serif; font-style: italic; color: #0A0A0A;">your chatter code</h2>
<p style="font-family: Inter, sans-serif; color: #767676; font-size: 14px;">
  enter this 6-digit code in the app to sign in.
</p>
<p style="font-family: 'JetBrains Mono', monospace; font-size: 32px; letter-spacing: 0.3em; color: #FF2D2D; font-weight: 600; padding: 24px 0;">
  {{ .Token }}
</p>
<p style="font-family: Inter, sans-serif; color: #767676; font-size: 12px;">
  expires in 10 minutes · request a new code if it doesn't work · we never ask for it elsewhere
</p>
<hr style="border: 0; border-top: 1px solid #E8E4DC; margin: 32px 0;">
<p style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #767676;">
  chatter — whispers from people who actually know.
</p>
```

## Maintenance — quota check

Monthly: log into Resend dashboard, verify usage stays under 3000/mo. If we cross 70% in a month, upgrade to paid ($20/mo for 50k).

## Rollback

If anything breaks: toggle Custom SMTP OFF in the Supabase dashboard. Falls back to default Supabase email.
