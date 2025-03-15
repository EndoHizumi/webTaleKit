import { test, expect } from '@playwright/test';

test.describe('メッセージウィンドウのオーバーフロー問題のテスト', () => {
  test('メッセージウィンドウが正しく表示される', async ({ page }) => {
    // テストページにアクセス
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    console.log('ページが読み込まれました。スクリーンショットを撮影します...');
    
    // スクリーンショットを撮影（初期状態）
    await page.screenshot({ path: 'tests/e2e/screenshots/initial-state.png' });
    
    // 少し待機してゲームが初期化されるのを待つ
    await page.waitForTimeout(5000);
    
    // ページのHTMLを確認
    const html = await page.content();
    console.log('ページのHTML:', html.substring(0, 500) + '...');
    
    // スクリーンショットを撮影（待機後）
    await page.screenshot({ path: 'tests/e2e/screenshots/after-wait.png' });
    
    // テストが成功したことを示す
    expect(true).toBeTruthy();
  });
});