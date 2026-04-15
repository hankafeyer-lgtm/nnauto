import { defineConfig, devices } from "@playwright/test";

/**
 * Default app port; override with PLAYWRIGHT_BASE_URL or PLAYWRIGHT_PORT.
 *
 * Next.js allows only one `next dev` per repo directory. With `reuseExistingServer: true`,
 * if you already run the app manually, Playwright reuses it — then your .env applies
 * (e.g. TURNSTILE_SECRET_KEY), and auth API E2E tests will skip unless you unset that secret
 * or stop the manual server so Playwright can start dev with the env below.
 */
const port = process.env.PLAYWRIGHT_PORT || "3000";
const baseURL =
  process.env.PLAYWRIGHT_BASE_URL || `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  timeout: 60_000,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  webServer: process.env.PLAYWRIGHT_SKIP_WEBSERVER
    ? undefined
    : {
        command: `PORT=${port} npm run dev`,
        url: baseURL,
        // One `next dev` per repo (Next 16 lock). Reuse if you already run the app locally.
        reuseExistingServer: true,
        timeout: 120_000,
        env: {
          ...process.env,
          PORT: port,
          NEXT_PUBLIC_TURNSTILE_UI_OFF: "true",
          TURNSTILE_SECRET_KEY: "",
        },
      },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
