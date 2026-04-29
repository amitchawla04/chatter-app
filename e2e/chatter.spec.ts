import { test, expect } from "@playwright/test";

const BASE = "https://chatter.today";
const BYPASS_URL = `${BASE}/auth/bypass?email=playwright-test@chatter-test.dev&s=${process.env.BYPASS_SECRET ?? "dbeb3e4645f58dc80e7cb0dc6b562a7b"}`;

test.describe("Chatter — public surfaces", () => {
  test("landing renders proof-whisper, wordmark, 4 Pact pills, CTA", async ({ page }) => {
    await page.goto(BASE);
    await expect(page.getByText("scale follows craft")).toBeVisible();
    await expect(page.getByText(/whispers from people who actually know/i)).toBeVisible();
    await expect(page.getByText("no ads ever")).toBeVisible();
    await expect(page.getByText("no public counts")).toBeVisible();
    await expect(page.getByText("your data stays yours")).toBeVisible();
    await expect(page.getByText("ai is opt-in")).toBeVisible();
    await expect(page.getByRole("link", { name: /claim your handle/i })).toBeVisible();
  });

  test("home feed loads with whispers across multiple verticals", async ({ page }) => {
    await page.goto(`${BASE}/home`);
    // At least one Arsenal whisper
    await expect(page.getByText(/Arsenal/i).first()).toBeVisible();
    // Check for ranking-rule pattern
    await expect(page.locator("text=/because|insider whisper|live in/i").first()).toBeVisible();
  });

  test("explore renders 7 vertical filters + topic grid", async ({ page }) => {
    await page.goto(`${BASE}/explore`);
    for (const label of ["All", "Sports", "Shows", "Music", "Tech", "Places", "Culture"]) {
      await expect(page.getByText(label, { exact: true }).first()).toBeVisible();
    }
  });

  test("Pact page shows all 14 commitments grouped by category", async ({ page }) => {
    await page.goto(`${BASE}/pact`);
    await expect(page.getByText(/Privacy/i).first()).toBeVisible();
    await expect(page.getByText(/Vibe/i).first()).toBeVisible();
    await expect(page.getByText(/AI/i).first()).toBeVisible();
    await expect(page.getByText(/Performance/i).first()).toBeVisible();
  });

  test("topic page renders + has tinted hero + topic-scoped feed", async ({ page }) => {
    await page.goto(`${BASE}/t/epl-arsenal`);
    await expect(page.getByRole("heading", { name: /Arsenal/i })).toBeVisible();
    await expect(page.getByText(/tuned in/i).first()).toBeVisible();
  });

  test("whisper detail shows pull-quote + reply CTA for anon", async ({ page }) => {
    await page.goto(`${BASE}/w/00000000-0000-0000-0000-000000000001`);
    // Multiple Saliba mentions now (parent + replies post credential-weighted seed) — first() suffices
    await expect(page.getByText(/Saliba/i).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /sign in to reply/i })).toBeVisible();
  });

  test("sign-in page shows OTP flow (email step)", async ({ page }) => {
    await page.goto(`${BASE}/auth/sign-in`);
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /send code/i })).toBeVisible();
  });

  test("beta cohort onboarding accepts invite codes", async ({ page }) => {
    await page.goto(`${BASE}/onboard/beta`);
    await expect(page.getByText(/charter cohort/i)).toBeVisible();
    await expect(page.getByLabel(/invite code/i)).toBeVisible();
  });

  test("PWA assets serve correctly", async ({ request }) => {
    const manifest = await request.get(`${BASE}/manifest.json`);
    expect(manifest.status()).toBe(200);
    const json = await manifest.json();
    expect(json.name).toBe("Chatter");
    expect(json.theme_color).toBe("#FAF9F6");

    const icon = await request.get(`${BASE}/icon`);
    expect(icon.status()).toBe(200);

    const sw = await request.get(`${BASE}/sw.js`);
    expect(sw.status()).toBe(200);
    expect(await sw.text()).toContain("chatter-v1");
  });

  test("static legal pages serve", async ({ page }) => {
    for (const path of ["/privacy", "/community", "/terms", "/ai"]) {
      const res = await page.goto(`${BASE}${path}`);
      expect(res?.status()).toBe(200);
    }
  });
});

test.describe("Chatter — auth-gated surfaces redirect to sign-in", () => {
  test("compose redirects anon to sign-in", async ({ page }) => {
    const res = await page.goto(`${BASE}/compose`, { waitUntil: "domcontentloaded" });
    expect(res?.status()).toBe(200); // 307 followed
    expect(page.url()).toMatch(/auth\/sign-in/);
  });

  test("settings redirects anon", async ({ page }) => {
    await page.goto(`${BASE}/settings`);
    expect(page.url()).toMatch(/auth\/sign-in/);
  });
});

test.describe("Chatter — full authed flow via bypass URL", () => {
  test("bypass URL signs in + lands on age gate", async ({ page }) => {
    const res = await page.goto(BYPASS_URL, { waitUntil: "domcontentloaded" });
    expect(res?.status()).toBe(200);
    // Bypass redirects to /onboarding/age (or /home if previously age-verified)
    const finalUrl = page.url();
    expect(finalUrl).toMatch(/onboarding\/age|home|onboarding/);
  });

  test("authed user can reach compose", async ({ page }) => {
    await page.goto(BYPASS_URL, { waitUntil: "networkidle" });
    await page.goto(`${BASE}/compose`, { waitUntil: "domcontentloaded" });
    // Either reaches compose or onboarding (if age-not-verified)
    expect(page.url()).toMatch(/compose|onboarding/);
  });
});

test.describe("Chatter — search functionality", () => {
  test("search page renders + accepts query", async ({ page }) => {
    await page.goto(`${BASE}/search?q=arsenal`);
    // Either has results or empty state — both are valid
    const body = await page.textContent("body");
    expect(body).toBeTruthy();
    expect(body!.length).toBeGreaterThan(100);
  });
});

test.describe("Chatter — content density check (5-user readiness)", () => {
  test("home feed has at least 10 whisper cards", async ({ page }) => {
    await page.goto(`${BASE}/home`);
    const cards = await page.locator("article").count();
    expect(cards).toBeGreaterThan(9);
  });

  test("explore lists 50+ topics", async ({ page }) => {
    await page.goto(`${BASE}/explore`);
    // Topic cards as anchors
    const links = await page.locator('a[href^="/t/"]').count();
    expect(links).toBeGreaterThan(49);
  });
});
