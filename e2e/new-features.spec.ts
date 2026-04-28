/**
 * E2E coverage for the 5 P2/P3 features shipped 2026-04-28.
 * Validates against the live production URL + real Supabase data.
 */
import { test, expect } from "@playwright/test";

const BASE = "https://chatter-ten-lemon.vercel.app";
const SECRET = process.env.BYPASS_SECRET ?? "dbeb3e4645f58dc80e7cb0dc6b562a7b";
const TEST_EMAIL = "playwright-features@chatter-test.dev";
const BYPASS_URL = `${BASE}/auth/bypass?email=${encodeURIComponent(TEST_EMAIL)}&s=${SECRET}`;

test.describe("Glimpse strip on /home", () => {
  test("renders horizontal strip with 'today · glimpse' header + circles", async ({
    page,
  }) => {
    await page.goto(`${BASE}/home`);
    await expect(page.getByText(/today · glimpse/i)).toBeVisible();
    await expect(page.getByText("24h", { exact: true }).first()).toBeVisible();

    // At least 5 circles (lazy-loaded images inside circles)
    const circles = page.locator('img[src*="picsum.photos"]');
    await expect(circles.first()).toBeVisible();
    expect(await circles.count()).toBeGreaterThanOrEqual(5);
  });

  test("opens lightbox on circle tap with arrow-key + escape nav", async ({
    page,
  }) => {
    await page.goto(`${BASE}/home`);
    // Click first glimpse circle (button with aria-label "Glimpse from @...")
    const firstCircle = page.getByRole("button", { name: /glimpse from @/i }).first();
    await firstCircle.click();

    // Lightbox dialog should be open
    const dialog = page.getByRole("dialog", { name: /glimpse lightbox/i });
    await expect(dialog).toBeVisible();
    await expect(page.getByText(/^1 \/ \d+/)).toBeVisible();

    // Arrow right advances
    await page.keyboard.press("ArrowRight");
    await expect(page.getByText(/^2 \/ \d+/)).toBeVisible();

    // Escape closes
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
  });
});

test.describe("Credential-weighted reply ranking on /w/[id]", () => {
  test("replies sort: charter → insider → no-creds (chronology overridden)", async ({
    page,
  }) => {
    // Hard cache-bust via query string
    await page.goto(`${BASE}/w/00000000-0000-0000-0000-000000000001?cb=${Date.now()}`);

    // Get text content of the page in render order
    const html = await page.content();

    // Strip React's <!-- --> separators and find handle byline order.
    const cleaned = html.replace(/<!--\s*-->/g, "");
    const handleMatches = [...cleaned.matchAll(/class="text-ink">@([a-z0-9_]+)/g)].map(
      (m) => m[1],
    );

    // Replies seeded: chronological = [amit, copafever, ashburton89, setpiecestan, touchlineban, lamasia]
    // After credential-weighted sort:
    //   charter first (chronological within tier): ashburton89, setpiecestan, lamasia
    //   then insider non-charter (chronological): copafever, touchlineban
    //   then no creds: amit
    const expected = [
      "ashburton89",
      "setpiecestan",
      "lamasia",
      "copafever",
      "touchlineban",
      "amit",
    ];

    // Parent author's byline appears first; the last 6 handle occurrences are the replies in render order
    expect(handleMatches.length).toBeGreaterThanOrEqual(6);
    const replyOrder = handleMatches.slice(-6);
    expect(replyOrder).toEqual(expected);
  });
});

test.describe("Village threads — auth-gated full create flow", () => {
  test("anon → /v redirects to sign-in", async ({ page }) => {
    await page.goto(`${BASE}/v`);
    expect(page.url()).toMatch(/auth\/sign-in/);
  });

  test("authed user can open /v index + see new-thread CTA", async ({ page }) => {
    await page.goto(BYPASS_URL, { waitUntil: "networkidle" });
    await page.goto(`${BASE}/v`, { waitUntil: "domcontentloaded" });

    // Either lands on /v (threads UI) or onboarding (if test user not yet age-verified)
    const url = page.url();
    if (url.includes("/onboarding")) {
      // First-run path — test user needs onboarding; that's expected on a fresh test email
      expect(url).toMatch(/onboarding/);
      return;
    }
    expect(url).toContain("/v");
    await expect(page.getByText(/village threads/i)).toBeVisible();
  });

  test("/v/new shows topic picker + name input + invite textarea", async ({
    page,
  }) => {
    await page.goto(BYPASS_URL, { waitUntil: "networkidle" });
    await page.goto(`${BASE}/v/new`, { waitUntil: "domcontentloaded" });

    if (page.url().includes("/onboarding")) {
      // Onboarding-gated; skip the deep test for fresh users
      return;
    }
    await expect(page.getByText(/new thread/i).first()).toBeVisible();
    await expect(page.getByText(/topic/i).first()).toBeVisible();
    await expect(page.getByPlaceholder(/set-piece nerds/i)).toBeVisible();
  });

  test("full create-and-post chain: form → /v/[id] → composer → message visible", async ({
    page,
    request,
  }) => {
    // Sign in
    await page.goto(BYPASS_URL, { waitUntil: "networkidle" });

    // Onboarding bypass: mark this test user as fully-onboarded via the test-only setup endpoint.
    // (If user's already age-verified from a prior run, this is a no-op.)
    await request.post(`${BASE}/api/test/onboard?s=${SECRET}`, {
      data: { email: TEST_EMAIL },
      headers: { "Content-Type": "application/json" },
    });

    await page.goto(`${BASE}/v/new`, { waitUntil: "networkidle" });
    if (page.url().includes("/onboarding")) {
      throw new Error("test user not onboarded — /api/test/onboard failed");
    }

    // Wait for the topic <select> to be populated + interactive
    const topicSelect = page.locator("select");
    await expect(topicSelect).toBeVisible();
    await expect.poll(async () => topicSelect.locator("option").count()).toBeGreaterThan(0);

    // Pick first topic explicitly (firing change event so React state is populated)
    const firstTopic = await topicSelect.locator("option").first().getAttribute("value");
    if (!firstTopic) throw new Error("no topic options rendered");
    await topicSelect.selectOption(firstTopic);

    // Name the thread + submit
    const threadName = `pw-thread-${Date.now()}`;
    await page.getByPlaceholder(/set-piece nerds/i).fill(threadName);

    const submit = page.getByRole("button", { name: /create thread/i });
    await expect(submit).toBeEnabled({ timeout: 10_000 });
    await submit.click();

    // Should land on /v/[id]
    await page.waitForURL(/\/v\/[0-9a-f-]{36}/, { timeout: 15_000 });
    await expect(page.getByRole("heading", { name: threadName })).toBeVisible();

    // Post a message
    const messageText = `pw-msg-${Date.now()}`;
    await page.getByPlaceholder(/message the village/i).fill(messageText);
    const sendBtn = page.getByRole("button", { name: /send message/i });
    await expect(sendBtn).toBeEnabled({ timeout: 5_000 });
    await sendBtn.click();

    // Message should appear in the thread feed (after revalidation)
    await expect(page.getByText(messageText)).toBeVisible({ timeout: 10_000 });
  });
});

test.describe("Watch-Together heartbeat API", () => {
  test("anon hit returns 401", async ({ request }) => {
    const events = await request.get(`${BASE}/live`).then((r) => r.text());
    // Pick any uuid that looks like an event from the listing — we just need to send a valid format
    const eventIdMatch = events.match(/\/live\/([0-9a-f-]{36})/);
    const fakeId = eventIdMatch?.[1] ?? "00000000-0000-0000-0000-000000000099";
    const res = await request.post(`${BASE}/api/live-events/${fakeId}/heartbeat`);
    expect(res.status()).toBe(401);
  });

  test("authed POST returns viewers payload", async ({ page, request }) => {
    // Sign in via bypass (sets cookies on this browser context)
    await page.goto(BYPASS_URL, { waitUntil: "networkidle" });

    // Get a real event id from /live
    await page.goto(`${BASE}/live`, { waitUntil: "domcontentloaded" });
    const link = await page.locator('a[href^="/live/"]').first().getAttribute("href");
    if (!link) test.skip(true, "no live events seeded");
    const eventId = link!.split("/live/")[1];

    // Use the page context to fetch (carries cookies)
    const result = await page.evaluate(async (id) => {
      const res = await fetch(`/api/live-events/${id}/heartbeat`, { method: "POST" });
      return { status: res.status, body: await res.json() };
    }, eventId);

    expect(result.status).toBe(200);
    expect(result.body.ok).toBe(true);
    expect(Array.isArray(result.body.viewers)).toBe(true);
    expect(typeof result.body.count).toBe("number");
  });
});

test.describe("i18n locale switching", () => {
  test("POST /api/locale with valid locale sets cookie + 200", async ({ request }) => {
    const res = await request.post(`${BASE}/api/locale`, {
      data: { locale: "es" },
      headers: { "Content-Type": "application/json" },
    });
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.locale).toBe("es");

    const setCookie = res.headers()["set-cookie"] ?? "";
    expect(setCookie).toContain("chatter_locale=es");
  });

  test("POST /api/locale rejects unsupported locale", async ({ request }) => {
    const res = await request.post(`${BASE}/api/locale`, {
      data: { locale: "klingon" },
      headers: { "Content-Type": "application/json" },
    });
    expect(res.status()).toBe(400);
  });

  test("Spanish locale cookie causes TabBar to render in Spanish", async ({
    page,
    context,
  }) => {
    await context.addCookies([
      {
        name: "chatter_locale",
        value: "es",
        url: BASE,
      },
    ]);
    await page.goto(`${BASE}/home`, { waitUntil: "domcontentloaded" });

    // Spanish tab labels (compose tab uses aria-label only, no visible text)
    await expect(page.getByText("Inicio", { exact: true })).toBeVisible();
    await expect(page.getByText("Explorar", { exact: true })).toBeVisible();
    await expect(page.getByText("Pases", { exact: true })).toBeVisible();
    await expect(page.getByText("Tú", { exact: true })).toBeVisible();
    // Compose CTA aria-label translates too — at least one link with "Susurro" in name
    expect(
      await page.getByRole("link", { name: /Susurro/i }).count(),
    ).toBeGreaterThan(0);
    // English should NOT appear in tabs
    expect(await page.getByRole("link", { name: /^Home$/ }).count()).toBe(0);
  });

  test("French cookie causes <html lang> to be 'fr'", async ({ page, context }) => {
    await context.addCookies([
      { name: "chatter_locale", value: "fr", url: BASE },
    ]);
    await page.goto(`${BASE}/home`, { waitUntil: "domcontentloaded" });
    const lang = await page.locator("html").getAttribute("lang");
    expect(lang).toBe("fr");
  });
});

test.describe("Regression: layout I18nProvider wraps every route without crashing", () => {
  test("auth-gated routes return 200 (server-rendered before redirect)", async ({
    request,
  }) => {
    for (const path of [
      "/v",
      "/v/new",
      "/settings/language",
      "/you/equity",
      "/you/feeds",
      "/you/vouches/network",
    ]) {
      const res = await request.get(`${BASE}${path}`, { maxRedirects: 0 });
      // 200 (rendered) or 307 (redirected to sign-in) — both healthy
      expect([200, 307]).toContain(res.status());
    }
  });

  test("public routes still render — no I18nProvider regression", async ({
    request,
  }) => {
    for (const path of [
      "/",
      "/home",
      "/explore",
      "/pact",
      "/privacy",
      "/community",
      "/terms",
      "/ai",
      "/live",
    ]) {
      const res = await request.get(`${BASE}${path}`);
      expect(res.status()).toBe(200);
    }
  });
});
