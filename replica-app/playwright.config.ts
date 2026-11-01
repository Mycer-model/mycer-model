import { defineConfig } from '@playwright/test';
// Runs against a production build on port 3112. The browser path is only for this sandbox; elsewhere `npx playwright install chromium` is enough.
const exe = process.env.PW_CHROMIUM_PATH;
export default defineConfig({
  testDir: './e2e',
  workers: 1, // the fake data layer is shared in memory, so tests run one at a time
  timeout: 30_000,
  use: { baseURL: 'http://localhost:3112', launchOptions: exe ? { executablePath: exe } : {} },
  webServer: { command: 'npx next start -p 3112', url: 'http://localhost:3112', reuseExistingServer: false, timeout: 60_000, env: { RATE_LIMIT_PER_MIN: '1000' } },
});
