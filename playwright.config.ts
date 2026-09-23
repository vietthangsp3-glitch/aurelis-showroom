import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  timeout: 45_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: "http://127.0.0.1:3100",
    trace: "on-first-retry",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    {
      name: "mobile",
      use: { ...devices["iPhone 13"], browserName: "chromium" },
    },
  ],
  webServer: {
    command: "pnpm exec cross-env NEXT_DIST_DIR=.next-e2e next dev -p 3100",
    url: "http://127.0.0.1:3100",
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
