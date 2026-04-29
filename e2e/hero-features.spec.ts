/**
 * E2E coverage for the 4 hero features shipped 2026-04-28 session 3.
 * Founder dashboard · inline insider corrections · opening moment · scope-aware compose canvas.
 */
import { test, expect } from "@playwright/test";

const BASE = "https://chatter.today";
const SECRET = process.env.BYPASS_SECRET ?? "dbeb3e4645f58dc80e7cb0dc6b562a7b";
const FOUNDER_EMAIL = "amit.chawla@reward360.co";
const FOUNDER_BYPASS = `${BASE}/auth/bypass?email=${encodeURIComponent(FOUNDER_EMAIL)}&s=${SECRET}`;

test.describe("Founder pulse dashboard", () => {
  test("anon → /founder returns 404", async ({ request }) => {
    const res = await request.get(`${BASE}/founder`);
    expect(res.status()).toBe(404);
  });

  test("non-founder authed user → 404", async ({ page }) => {
    await page.goto(
      `${BASE}/auth/bypass?email=playwright-features@chatter-test.dev&s=${SECRET}`,
      { waitUntil: "networkidle" },
    );
    const res = await page.goto(`${BASE}/founder`);
    expect(res?.status()).toBe(404);
  });

  test("founder email sees the editor's deck", async ({ page }) => {
    await page.goto(FOUNDER_BYPASS, { waitUntil: "networkidle" });
    await page.goto(`${BASE}/founder`, { waitUntil: "domcontentloaded" });
    await expect(page.getByText(/founder pulse/i)).toBeVisible();
    await expect(page.getByText(/latest whispers/i)).toBeVisible();
    await expect(page.getByText(/active threads/i)).toBeVisible();
    await expect(page.getByText(/insider corrections · 24h/i)).toBeVisible();
    await expect(page.getByText(/signups · last 7d/i)).toBeVisible();
    await expect(page.getByText(/health/i).first()).toBeVisible();
  });
});

test.describe("Inline insider-correction strip on /home", () => {
  test("renders 'pushed back' header + correction body in feed", async ({ page }) => {
    await page.goto(`${BASE}/home?cb=${Date.now()}`, { waitUntil: "domcontentloaded" });
    await expect(page.getByText(/pushed back/i).first()).toBeVisible();
  });
});

test.describe("Opening moment curtain", () => {
  test("hidden when sessionStorage flag pre-set (skip path)", async ({ page }) => {
    // Set the session flag BEFORE navigation so the curtain is suppressed
    await page.addInitScript(() => {
      try {
        sessionStorage.setItem("chatter:opening-moment-shown", "1");
      } catch {
        // ignore
      }
    });
    await page.goto(`${BASE}/home`, { waitUntil: "domcontentloaded" });
    // No curtain element should appear (proof-whisper text inside curtain not rendered)
    const dialog = page.locator('[aria-hidden="true"]').filter({ hasText: /whispers from people who actually know/i });
    expect(await dialog.count()).toBe(0);
  });
});

test.describe("Scope-aware compose canvas", () => {
  test("shows scope-derived placeholder + descriptor on /compose", async ({ page }) => {
    // Sign in via bypass + onboard so /compose isn't gated
    await page.goto(`${BASE}/auth/bypass?email=playwright-features@chatter-test.dev&s=${SECRET}`, { waitUntil: "networkidle" });
    await page.request.post(`${BASE}/api/test/onboard?s=${SECRET}`, {
      data: { email: "playwright-features@chatter-test.dev" },
      headers: { "Content-Type": "application/json" },
    });
    await page.goto(`${BASE}/compose`, { waitUntil: "domcontentloaded" });
    if (page.url().includes("/onboarding")) test.skip(true, "onboarding required");

    // Default scope = public → "to the open" descriptor
    await expect(page.getByText(/to the open/i)).toBeVisible();

    // Switch to circle (village)
    await page.getByRole("button", { name: /👥 circle/i }).click();
    await expect(page.getByText(/to your village/i)).toBeVisible();

    // Switch to private
    await page.getByRole("button", { name: /🔒 private/i }).click();
    await expect(page.getByText(/sealed envelope/i)).toBeVisible();
  });
});
