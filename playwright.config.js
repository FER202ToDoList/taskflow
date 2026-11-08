import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests', testMatch: 'ui.spec.js', workers: 1,
  use: { baseURL: 'http://localhost:5173', browserName: 'chromium', launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE, args: JSON.parse(process.env.PLAYWRIGHT_CHROMIUM_ARGS || '[]') } : {}, trace: 'retain-on-failure' },
  webServer: {
    command: 'npm run dev', url: 'http://localhost:5173', timeout: 60000, reuseExistingServer: false,
    env: { VITE_API_URL: process.env.TEST_API_URL || 'http://127.0.0.1:3101' },
  }, reporter: 'list',
});
