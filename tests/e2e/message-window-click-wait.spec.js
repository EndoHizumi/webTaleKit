// @ts-check
const { test, expect } = require('@playwright/test');

test('メッセージウィンドウの表示領域を超えた場合にクリック待ちになる機能のテスト', async ({ page }) => {
  // ゲームを起動
  await page.goto('/');
  
  // ページが完全に読み込まれるまで待機
  await page.waitForSelector('#messageView', { state: 'visible' });
  
  // 初期の「タップでスタート」が表示されるまで待機
  await expect(page.locator('#messageView')).toContainText('タップでスタート');
  
  // タップでスタートをクリック
  await page.click('#messageWindow');
  
  // メインコンテンツが表示されるまで待機
  await expect(page.locator('#messageView')).toContainText('WebTaleKitデモゲームへようこそ！');
  
  // 「長いテキストテスト」を選択
  const longTextTestButton = page.locator('.choice', { hasText: '長いテキストテスト' });
  await longTextTestButton.click();
  
  // 最初のテキストが表示されるまで待機
  await expect(page.locator('#messageView')).toContainText('これは長いテキストのテスト用シナリオです');
  
  // 次のテキストを表示するためにクリック
  await page.click('#messageWindow');
  
  // 長いテキストが表示され始めるまで待機
  await expect(page.locator('#messageView')).toContainText('この文章はとても長い文章です');
  
  // waitCircleが表示されるまで待機（テキストが表示領域を超えた場合）
  await page.waitForSelector('#waitCircle[style*="visibility: visible"]', { timeout: 10000 });
  
  // スクリーンショットを撮影（クリック待ち状態）
  await page.screenshot({ path: 'tests/e2e/screenshots/message-window-click-wait.png' });
  
  // クリックして続きを表示
  await page.click('#messageWindow');
  
  // テキストがクリアされて続きが表示されることを確認
  await expect(page.locator('#messageView')).not.toContainText('この文章はとても長い文章です');
  await expect(page.locator('#messageView')).toContainText('さらに長い文章を追加します');
  
  // 最後のテキストまで進める
  await page.click('#messageWindow');
  await page.click('#messageWindow');
  
  // テストが完了したことを確認
  await expect(page.locator('#messageView')).toContainText('テストが完了しました');
});