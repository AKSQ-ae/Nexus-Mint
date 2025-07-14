import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false, // Disable parallel to prevent conflicts
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'html',
  timeout: 30000, // 30 second timeout
  expect: {
    timeout: 10000, // 10 second expect timeout
  },
  use: {
    baseURL: 'http://localhost:8080',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        ignoreHTTPSErrors: true,
      },
    },
    // Enable Firefox and WebKit locally, only run Chrome in CI
    ...(process.env.CI ? [] : [
      {
        name: 'firefox',
        use: { ...devices['Desktop Firefox'] },
      },
      {
        name: 'webkit',
        use: { ...devices['Desktop Safari'] },
      },
    ]),
  ],
  // Remove/comment out webServer block if you start the dev server manually!
  // If you want Playwright to ALWAYS use your running server (and never try to start its own),
  // comment out or remove the block below.
  // If you want Playwright to manage the dev server, keep the block below.
  // If you still have timeouts, try increasing timeout or removing the block.
  webServer: process.env.CI ? {
    command: 'npm run dev',
    port: 8080,
    reuseExistingServer: false,
    timeout: 120000,
  } : undefined,
})
