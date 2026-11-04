import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.E2E_BASE_URL ?? "https://observatorio.clusterdestartups.org";

export default defineConfig({
  testDir: "e2e/prod",
  fullyParallel: false,
  workers: 1,
  retries: 1,
  timeout: 30_000,
  use: { baseURL, trace: "on-first-retry" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
