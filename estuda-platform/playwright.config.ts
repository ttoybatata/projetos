import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  // SQLite is a single-writer database; serialize CI browser tests to avoid lock contention.
  workers: process.env.CI ? 1 : undefined,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:5173",
    trace: "retain-on-failure",
    screenshot: "only-on-failure"
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile-chromium", use: { ...devices["Pixel 7"] } }
  ],
  // API and frontend must both be running for authenticated E2E tests.
  webServer: [
    {
      command: "npm run dev:api",
      url: "http://127.0.0.1:3000/api/health",
      reuseExistingServer: !process.env.CI,
      timeout: 30000
    },
    {
      command: "npm run dev:web",
      url: "http://127.0.0.1:5173",
      reuseExistingServer: !process.env.CI,
      timeout: 30000
    }
  ]
});
