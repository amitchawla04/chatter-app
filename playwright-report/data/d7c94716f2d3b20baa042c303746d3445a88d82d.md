# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: new-features.spec.ts >> Village threads — auth-gated full create flow >> authed user can open /v index + see new-thread CTA
- Location: e2e/new-features.spec.ts:92:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/village threads/i)
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText(/village threads/i)

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - link "skip to content" [ref=e2] [cursor=pointer]:
    - /url: "#main-content"
  - main [ref=e4]:
    - generic [ref=e5]:
      - link "chatter ." [ref=e6] [cursor=pointer]:
        - /url: /
        - generic [ref=e7]:
          - text: chatter
          - generic [ref=e8]: .
      - link "← back" [ref=e9] [cursor=pointer]:
        - /url: /
    - generic [ref=e11]:
      - heading "claim your handle." [level=1] [ref=e12]
      - paragraph [ref=e13]: we’ll send a 6-digit code. no passwords. no tracking outside chatter.
      - generic [ref=e14]:
        - generic [ref=e15]:
          - generic [ref=e16]: email
          - textbox "email" [active] [ref=e17]:
            - /placeholder: you@domain.com
        - button "send code →" [disabled] [ref=e18]:
          - text: send code
          - generic [ref=e19]: →
      - paragraph [ref=e20]:
        - text: by continuing, you accept
        - link "the chatter pact" [ref=e21] [cursor=pointer]:
          - /url: /pact
        - text: — 14 commitments we make to you.
  - alert [ref=e22]
```

# Test source

```ts
  4   |  */
  5   | import { test, expect } from "@playwright/test";
  6   | 
  7   | const BASE = "https://chatter-ten-lemon.vercel.app";
  8   | const SECRET = process.env.BYPASS_SECRET ?? "dbeb3e4645f58dc80e7cb0dc6b562a7b";
  9   | const TEST_EMAIL = "playwright-features@chatter-test.dev";
  10  | const BYPASS_URL = `${BASE}/auth/bypass?email=${encodeURIComponent(TEST_EMAIL)}&s=${SECRET}`;
  11  | 
  12  | test.describe("Glimpse strip on /home", () => {
  13  |   test("renders horizontal strip with 'today · glimpse' header + circles", async ({
  14  |     page,
  15  |   }) => {
  16  |     await page.goto(`${BASE}/home`);
  17  |     await expect(page.getByText(/today · glimpse/i)).toBeVisible();
  18  |     await expect(page.getByText("24h", { exact: true }).first()).toBeVisible();
  19  | 
  20  |     // At least 5 circles (lazy-loaded images inside circles)
  21  |     const circles = page.locator('img[src*="picsum.photos"]');
  22  |     await expect(circles.first()).toBeVisible();
  23  |     expect(await circles.count()).toBeGreaterThanOrEqual(5);
  24  |   });
  25  | 
  26  |   test("opens lightbox on circle tap with arrow-key + escape nav", async ({
  27  |     page,
  28  |   }) => {
  29  |     await page.goto(`${BASE}/home`);
  30  |     // Click first glimpse circle (button with aria-label "Glimpse from @...")
  31  |     const firstCircle = page.getByRole("button", { name: /glimpse from @/i }).first();
  32  |     await firstCircle.click();
  33  | 
  34  |     // Lightbox dialog should be open
  35  |     const dialog = page.getByRole("dialog", { name: /glimpse lightbox/i });
  36  |     await expect(dialog).toBeVisible();
  37  |     await expect(page.getByText(/^1 \/ \d+/)).toBeVisible();
  38  | 
  39  |     // Arrow right advances
  40  |     await page.keyboard.press("ArrowRight");
  41  |     await expect(page.getByText(/^2 \/ \d+/)).toBeVisible();
  42  | 
  43  |     // Escape closes
  44  |     await page.keyboard.press("Escape");
  45  |     await expect(dialog).not.toBeVisible();
  46  |   });
  47  | });
  48  | 
  49  | test.describe("Credential-weighted reply ranking on /w/[id]", () => {
  50  |   test("replies sort: charter → insider → no-creds (chronology overridden)", async ({
  51  |     page,
  52  |   }) => {
  53  |     // Hard cache-bust via query string
  54  |     await page.goto(`${BASE}/w/00000000-0000-0000-0000-000000000001?cb=${Date.now()}`);
  55  | 
  56  |     // Get text content of the page in render order
  57  |     const html = await page.content();
  58  | 
  59  |     // Strip React's <!-- --> separators and find handle byline order.
  60  |     const cleaned = html.replace(/<!--\s*-->/g, "");
  61  |     const handleMatches = [...cleaned.matchAll(/class="text-ink">@([a-z0-9_]+)/g)].map(
  62  |       (m) => m[1],
  63  |     );
  64  | 
  65  |     // Replies seeded: chronological = [amit, copafever, ashburton89, setpiecestan, touchlineban, lamasia]
  66  |     // After credential-weighted sort:
  67  |     //   charter first (chronological within tier): ashburton89, setpiecestan, lamasia
  68  |     //   then insider non-charter (chronological): copafever, touchlineban
  69  |     //   then no creds: amit
  70  |     const expected = [
  71  |       "ashburton89",
  72  |       "setpiecestan",
  73  |       "lamasia",
  74  |       "copafever",
  75  |       "touchlineban",
  76  |       "amit",
  77  |     ];
  78  | 
  79  |     // Parent author's byline appears first; the last 6 handle occurrences are the replies in render order
  80  |     expect(handleMatches.length).toBeGreaterThanOrEqual(6);
  81  |     const replyOrder = handleMatches.slice(-6);
  82  |     expect(replyOrder).toEqual(expected);
  83  |   });
  84  | });
  85  | 
  86  | test.describe("Village threads — auth-gated full create flow", () => {
  87  |   test("anon → /v redirects to sign-in", async ({ page }) => {
  88  |     await page.goto(`${BASE}/v`);
  89  |     expect(page.url()).toMatch(/auth\/sign-in/);
  90  |   });
  91  | 
  92  |   test("authed user can open /v index + see new-thread CTA", async ({ page }) => {
  93  |     await page.goto(BYPASS_URL, { waitUntil: "networkidle" });
  94  |     await page.goto(`${BASE}/v`, { waitUntil: "domcontentloaded" });
  95  | 
  96  |     // Either lands on /v (threads UI) or onboarding (if test user not yet age-verified)
  97  |     const url = page.url();
  98  |     if (url.includes("/onboarding")) {
  99  |       // First-run path — test user needs onboarding; that's expected on a fresh test email
  100 |       expect(url).toMatch(/onboarding/);
  101 |       return;
  102 |     }
  103 |     expect(url).toContain("/v");
> 104 |     await expect(page.getByText(/village threads/i)).toBeVisible();
      |                                                      ^ Error: expect(locator).toBeVisible() failed
  105 |   });
  106 | 
  107 |   test("/v/new shows topic picker + name input + invite textarea", async ({
  108 |     page,
  109 |   }) => {
  110 |     await page.goto(BYPASS_URL, { waitUntil: "networkidle" });
  111 |     await page.goto(`${BASE}/v/new`, { waitUntil: "domcontentloaded" });
  112 | 
  113 |     if (page.url().includes("/onboarding")) {
  114 |       // Onboarding-gated; skip the deep test for fresh users
  115 |       return;
  116 |     }
  117 |     await expect(page.getByText(/new thread/i).first()).toBeVisible();
  118 |     await expect(page.getByText(/topic/i).first()).toBeVisible();
  119 |     await expect(page.getByPlaceholder(/set-piece nerds/i)).toBeVisible();
  120 |   });
  121 | 
  122 |   test("full create-and-post chain: form → /v/[id] → composer → message visible", async ({
  123 |     page,
  124 |     request,
  125 |   }) => {
  126 |     // Sign in
  127 |     await page.goto(BYPASS_URL, { waitUntil: "networkidle" });
  128 | 
  129 |     // Onboarding bypass: mark this test user as fully-onboarded via the test-only setup endpoint.
  130 |     // (If user's already age-verified from a prior run, this is a no-op.)
  131 |     await request.post(`${BASE}/api/test/onboard?s=${SECRET}`, {
  132 |       data: { email: TEST_EMAIL },
  133 |       headers: { "Content-Type": "application/json" },
  134 |     });
  135 | 
  136 |     await page.goto(`${BASE}/v/new`, { waitUntil: "networkidle" });
  137 |     if (page.url().includes("/onboarding")) {
  138 |       throw new Error("test user not onboarded — /api/test/onboard failed");
  139 |     }
  140 | 
  141 |     // Wait for the topic <select> to be populated + interactive
  142 |     const topicSelect = page.locator("select");
  143 |     await expect(topicSelect).toBeVisible();
  144 |     await expect.poll(async () => topicSelect.locator("option").count()).toBeGreaterThan(0);
  145 | 
  146 |     // Pick first topic explicitly (firing change event so React state is populated)
  147 |     const firstTopic = await topicSelect.locator("option").first().getAttribute("value");
  148 |     if (!firstTopic) throw new Error("no topic options rendered");
  149 |     await topicSelect.selectOption(firstTopic);
  150 | 
  151 |     // Name the thread + submit
  152 |     const threadName = `pw-thread-${Date.now()}`;
  153 |     await page.getByPlaceholder(/set-piece nerds/i).fill(threadName);
  154 | 
  155 |     const submit = page.getByRole("button", { name: /create thread/i });
  156 |     await expect(submit).toBeEnabled({ timeout: 10_000 });
  157 |     await submit.click();
  158 | 
  159 |     // Should land on /v/[id]
  160 |     await page.waitForURL(/\/v\/[0-9a-f-]{36}/, { timeout: 15_000 });
  161 |     await expect(page.getByRole("heading", { name: threadName })).toBeVisible();
  162 | 
  163 |     // Post a message
  164 |     const messageText = `pw-msg-${Date.now()}`;
  165 |     await page.getByPlaceholder(/message the village/i).fill(messageText);
  166 |     const sendBtn = page.getByRole("button", { name: /send message/i });
  167 |     await expect(sendBtn).toBeEnabled({ timeout: 5_000 });
  168 |     await sendBtn.click();
  169 | 
  170 |     // Message should appear in the thread feed (after revalidation)
  171 |     await expect(page.getByText(messageText)).toBeVisible({ timeout: 10_000 });
  172 |   });
  173 | });
  174 | 
  175 | test.describe("Watch-Together heartbeat API", () => {
  176 |   test("anon hit returns 401", async ({ request }) => {
  177 |     const events = await request.get(`${BASE}/live`).then((r) => r.text());
  178 |     // Pick any uuid that looks like an event from the listing — we just need to send a valid format
  179 |     const eventIdMatch = events.match(/\/live\/([0-9a-f-]{36})/);
  180 |     const fakeId = eventIdMatch?.[1] ?? "00000000-0000-0000-0000-000000000099";
  181 |     const res = await request.post(`${BASE}/api/live-events/${fakeId}/heartbeat`);
  182 |     expect(res.status()).toBe(401);
  183 |   });
  184 | 
  185 |   test("authed POST returns viewers payload", async ({ page, request }) => {
  186 |     // Sign in via bypass (sets cookies on this browser context)
  187 |     await page.goto(BYPASS_URL, { waitUntil: "networkidle" });
  188 | 
  189 |     // Get a real event id from /live
  190 |     await page.goto(`${BASE}/live`, { waitUntil: "domcontentloaded" });
  191 |     const link = await page.locator('a[href^="/live/"]').first().getAttribute("href");
  192 |     if (!link) test.skip(true, "no live events seeded");
  193 |     const eventId = link!.split("/live/")[1];
  194 | 
  195 |     // Use the page context to fetch (carries cookies)
  196 |     const result = await page.evaluate(async (id) => {
  197 |       const res = await fetch(`/api/live-events/${id}/heartbeat`, { method: "POST" });
  198 |       return { status: res.status, body: await res.json() };
  199 |     }, eventId);
  200 | 
  201 |     expect(result.status).toBe(200);
  202 |     expect(result.body.ok).toBe(true);
  203 |     expect(Array.isArray(result.body.viewers)).toBe(true);
  204 |     expect(typeof result.body.count).toBe("number");
```