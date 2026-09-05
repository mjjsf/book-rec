import { defineConfig, devices } from "@playwright/test";

/**
 * Browser checks for the prototype.
 *
 * These guard behaviour that unit tests cannot see and that has broken before:
 * the device frame resizing mid-navigation, the composer clipping its designed
 * question, a page shipping as an empty shell, assets missing the base path.
 * Each spec here exists because that bug actually reached a release.
 *
 * The suite runs against the real static export served under `/book-rec/`,
 * because base-path bugs are invisible at the root.
 */

/**
 * This sandbox ships Chromium at a fixed path with downloads disabled; CI
 * installs its own. One env var keeps a single config working in both.
 */
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  // The navigation spec samples animation frames; a second browser competing
  // for them is the one thing that could make it flaky.
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : [["list"]],

  use: {
    baseURL: "http://localhost:3000/book-rec/",
    trace: "retain-on-failure",
    launchOptions: executablePath ? { executablePath } : {},
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 1000 } },
    },
  ],

  // Serves out/, so `npm run build` must have run first.
  webServer: {
    command: "npm run preview",
    url: "http://localhost:3000/book-rec/",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
