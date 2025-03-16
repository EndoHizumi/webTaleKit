// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('リソースエラーハンドリングのテスト', () => {
  test('存在しないリソースを指定した場合にエラーメッセージが表示される', async ({ page }) => {
    // 直接リソースエラーテスト用のSceneファイルを開く
    await page.goto('http://localhost:8080/?scene=resource-error-test');
    
    // ページが読み込まれるのを待つ（少し長めに）
    await page.waitForTimeout(3000);
    
    // ページが読み込まれるのを待つ
    await page.waitForLoadState('networkidle');
    
    // デバッグ用にスクリーンショットを撮影
    await page.screenshot({ path: 'tests/e2e/screenshots/before-error-check.png' });
    
    // コンソールログを監視
    page.on('console', msg => {
      console.log(`PAGE LOG: ${msg.text()}`);
    });
    
    // より広範囲なエラーメッセージのパターンを試す
    const errorPatterns = [
      'text="エラー: 背景画像が見つかりません"',
      'text="エラー: 画像ファイルが見つかりません"',
      'text="エラー: BGMファイルが見つかりません"',
      'text="エラー"',
      'text=エラー'
    ];
    
    let errorMessage = null;
    
    // 各パターンを試す
    for (const pattern of errorPatterns) {
      console.log(`Checking for error pattern: ${pattern}`);
      errorMessage = await page.waitForSelector(pattern, { timeout: 5000 })
        .catch(() => null);
      
      if (errorMessage) {
        console.log(`Found error message with pattern: ${pattern}`);
        break;
      }
    }
    
    // エラーメッセージが表示されたことを確認
    if (!errorMessage) {
      // ページ全体のHTMLを取得して確認
      const html = await page.content();
      console.log('Page HTML:', html);
    }
    
    expect(errorMessage).not.toBeNull();
    
    // スクリーンショットを撮影
    await page.screenshot({ path: 'tests/e2e/screenshots/resource-error-handling.png' });
  });
});