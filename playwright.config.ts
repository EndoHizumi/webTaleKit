import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:8080',
    trace: 'on-first-retry',
    // ヘッドレスモードを無効にする
    headless: false,
    // テスト実行時にブラウザを遅くする（デバッグ用）
    launchOptions: {
      slowMo: 1000,
    },
    // スクリーンショットを自動的に撮影
    screenshot: 'on',
  },
  // テストのタイムアウトを延長
  timeout: 60000,
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'cd example && npm run dev',
    url: 'http://localhost:8080',
    reuseExistingServer: !process.env.CI,
    // Webサーバーの起動を待つ時間を延長
    timeout: 120000,
  },
});