import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  use: {
    baseURL: 'http://localhost:9090',
    browserName: 'chromium',
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'quasar dev --port 9090',
    url: 'http://localhost:9090',
    reuseExistingServer: false,
    timeout: 120000,
  },
});
