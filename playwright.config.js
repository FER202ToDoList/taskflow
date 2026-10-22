import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  testMatch: "ui.spec.js",
  workers: 1,
  use: { baseURL: "http://localhost:5173", browserName: "chromium" },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:5173",
    timeout: 60000,
    reuseExistingServer: false,
    env: { DB_FILE: "data/e2e.db" },
  },
  reporter: "list",
});
