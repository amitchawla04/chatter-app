/**
 * Whole-app cert pass at iPhone-14-Pro viewport.
 * For every route: screenshot + console errors + failed network + a11y violations.
 *
 * Auth: bypass once via global setup, save storageState, re-use on every test.
 *
 * Output: e2e/cert-output/{label}.png + e2e/cert-output/summary.json
 *
 * Run:
 *   npx playwright test cert-pass --project=iphone --reporter=list
 */
import { test, type Page } from "@playwright/test";
import { promises as fs } from "fs";
import * as path from "path";
import AxeBuilder from "@axe-core/playwright";

const BASE = "https://chatter.today";
const BYPASS = `${BASE}/auth/bypass?email=amit.chawla@reward360.co&s=dbeb3e4645f58dc80e7cb0dc6b562a7b`;
const SAMPLE_TICKETED_EVENT = "eeeeeeee-eeee-eeee-eeee-eeeeeeeeee10";
const STORAGE = path.join(__dirname, "cert-output", ".storage.json");
const OUT_DIR = path.join(__dirname, "cert-output");

interface CertRoute {
  path: string;
  label: string;
}

const ROUTES: CertRoute[] = [
  { path: "/", label: "01-landing" },
  { path: "/home", label: "02-home" },
  { path: "/explore", label: "03-explore" },
  { path: "/live", label: "04-live-index" },
  { path: `/live/${SAMPLE_TICKETED_EVENT}`, label: "05-live-event-ticketed-gate" },
  { path: "/live/eeeeeeee-eeee-eeee-eeee-eeeeeeeeee01", label: "06-live-event-match" },
  { path: "/pact", label: "07-pact" },
  { path: "/pact/schema", label: "08-pact-schema" },
  { path: "/charter", label: "09-charter" },
  { path: "/changelog", label: "10-changelog" },
  { path: "/terms", label: "11-terms" },
  { path: "/privacy", label: "12-privacy" },
  { path: "/community", label: "13-community" },
  { path: "/ai", label: "14-ai" },
  { path: "/auth/sign-in", label: "15-auth-sign-in" },
  { path: "/onboard/beta", label: "16-onboard-beta" },
  { path: "/search?q=premier", label: "17-search" },
  { path: "/t/show-the-bear", label: "18-topic-page" },
  { path: `/live/${SAMPLE_TICKETED_EVENT}/checkout`, label: "19-ticketed-checkout" },
  { path: "/compose", label: "20-compose" },
  { path: "/passes", label: "21-passes" },
  { path: "/saved", label: "22-saved" },
  { path: "/activity", label: "23-activity" },
  { path: "/settings", label: "24-settings" },
  { path: "/settings/profile", label: "25-settings-profile" },
  { path: "/settings/account", label: "26-settings-account" },
  { path: "/settings/data", label: "27-settings-data" },
  { path: "/settings/notifications", label: "28-settings-notifications" },
  { path: "/settings/language", label: "29-settings-language" },
  { path: "/settings/privacy", label: "30-settings-privacy" },
  { path: "/you", label: "31-you" },
  { path: "/you/equity", label: "32-you-equity" },
  { path: "/you/feeds", label: "33-you-feeds" },
  { path: "/you/credentials", label: "34-you-credentials" },
  { path: "/you/vouches/network", label: "35-you-vouches" },
  { path: "/v", label: "36-village-index" },
  { path: "/v/new", label: "37-village-new" },
  { path: "/founder", label: "38-founder-dashboard" },
  { path: "/founder/invites", label: "39-founder-invites" },
  { path: "/founder/insider-claims", label: "40-founder-insider-claims" },
  { path: "/moderation", label: "41-moderation" },
  { path: "/brand/logos", label: "42-brand-logos-v1" },
  { path: "/brand/logos-v2", label: "43-brand-logos-v2" },
];

interface RouteReport {
  label: string;
  path: string;
  url: string;
  status: number;
  consoleErrors: string[];
  consoleWarnings: string[];
  failedRequests: { url: string; status: number; method: string }[];
  a11yViolations: { id: string; impact: string | null; nodes: number; help: string }[];
  durationMs: number;
}

const reports: RouteReport[] = [];

test.describe.configure({ mode: "serial" });

test("00 setup — bypass + persist storage", async ({ browser }) => {
  await fs.mkdir(OUT_DIR, { recursive: true });
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.goto(BYPASS, { waitUntil: "domcontentloaded", timeout: 45000 });
  // wait for redirect to /home
  await page.waitForURL(/\/home$/, { timeout: 15000 });
  await ctx.storageState({ path: STORAGE });
  await ctx.close();
});

test.describe("cert routes", () => {
  test.use({ storageState: STORAGE });

  for (const route of ROUTES) {
    test(`cert · ${route.label} · ${route.path}`, async ({ page }) => {
      const consoleErrors: string[] = [];
      const consoleWarnings: string[] = [];
      const failedRequests: { url: string; status: number; method: string }[] = [];

      page.on("console", (msg) => {
        const type = msg.type();
        if (type === "error") consoleErrors.push(msg.text());
        else if (type === "warning") consoleWarnings.push(msg.text());
      });
      page.on("requestfailed", (req) => {
        failedRequests.push({ url: req.url(), status: 0, method: req.method() });
      });
      page.on("response", (res) => {
        const status = res.status();
        const url = res.url();
        if (status >= 400 && status !== 404) {
          if (!url.includes("/_next/data/") && !url.includes("favicon")) {
            failedRequests.push({ url, status, method: res.request().method() });
          }
        }
      });

      const start = Date.now();
      let resp;
      try {
        resp = await page.goto(`${BASE}${route.path}`, { waitUntil: "domcontentloaded", timeout: 30000 });
        await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {});
      } catch (err) {
        consoleErrors.push(`navigation error: ${err instanceof Error ? err.message : String(err)}`);
      }
      const durationMs = Date.now() - start;

      const status = resp?.status() ?? 0;
      const finalUrl = page.url();

      const screenshotPath = path.join(OUT_DIR, `${route.label}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });

      let a11yViolations: { id: string; impact: string | null; nodes: number; help: string }[] = [];
      if (status >= 200 && status < 300) {
        try {
          const results = await new AxeBuilder({ page })
            .disableRules(["color-contrast"])
            .analyze();
          a11yViolations = results.violations.map((v) => ({
            id: v.id,
            impact: v.impact ?? null,
            nodes: v.nodes.length,
            help: v.help,
          }));
        } catch {
          // axe injection failure isn't fatal
        }
      }

      reports.push({
        label: route.label,
        path: route.path,
        url: finalUrl,
        status,
        consoleErrors,
        consoleWarnings,
        failedRequests,
        a11yViolations,
        durationMs,
      });
    });
  }
});

test.afterAll(async () => {
  const summaryPath = path.join(OUT_DIR, "summary.json");
  const summary = {
    generatedAt: new Date().toISOString(),
    base: BASE,
    totalRoutes: reports.length,
    routesWithConsoleErrors: reports.filter((r) => r.consoleErrors.length > 0).length,
    routesWithFailedRequests: reports.filter((r) => r.failedRequests.length > 0).length,
    routesWithA11yViolations: reports.filter((r) => r.a11yViolations.length > 0).length,
    routesWith4xx5xx: reports.filter((r) => r.status >= 400 && r.status !== 404).length,
    routes: reports.sort((a, b) => a.label.localeCompare(b.label)),
  };
  await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2), "utf-8");
  console.log(`\n=== CERT PASS COMPLETE ===`);
  console.log(`Routes: ${summary.totalRoutes}`);
  console.log(`Console errors: ${summary.routesWithConsoleErrors}`);
  console.log(`Failed requests: ${summary.routesWithFailedRequests}`);
  console.log(`A11y violations: ${summary.routesWithA11yViolations}`);
  console.log(`Output: ${OUT_DIR}/`);
});
