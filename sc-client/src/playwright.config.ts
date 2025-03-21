import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  use: {
    baseURL: 'http://localhost:4000', // Use Vite's preview server
    browserName: 'chromium',
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'quasar build && quasar serve', // Serve built app
    url: 'http://localhost:4000',
    reuseExistingServer: true,
  },
});
