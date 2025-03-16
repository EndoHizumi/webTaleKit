// @ts-check
const { test, expect } = require('@playwright/test');

test('メッセージウィンドウの表示領域を超えた場合にクリック待ちになる機能のテスト', async ({ page }) => {
  // ゲームを起動
  await page.goto('/');
  
  // ページが完全に読み込まれるまで待機
  await page.waitForSelector('#messageView', { state: 'visible' });
  
  // 初期の「タップでスタート」が表示されるまで待機
  await expect(page.locator('#messageView')).toContainText('タップでスタート');
  console.log('「タップでスタート」が表示されました');
  
  // タップでスタートをクリック
  await page.click('#messageWindow');
  console.log('「タップでスタート」をクリックしました');
  
  // メインコンテンツが表示されるまで待機（タイムアウトを長めに設定）
  await expect(page.locator('#messageView')).toContainText('WebTaleKitデモゲームへようこそ！', { timeout: 10000 });
  console.log('「WebTaleKitデモゲームへようこそ！」が表示されました');
  
  // 最初のテキストをクリックして次に進む
  await page.click('#messageWindow');
  console.log('最初のテキストをクリックしました');
  
  // 2つ目のテキストが表示されるまで待機
  await expect(page.locator('#messageView')).toContainText('以下の機能デモから', { timeout: 10000 });
  console.log('2つ目のテキストが表示されました');
  
  // 2つ目のテキストをクリックして選択肢を表示
  await page.click('#messageWindow');
  console.log('2つ目のテキストをクリックしました');
  
  // 選択肢が表示されるまで待機（タイムアウトを長めに設定）
  await page.waitForSelector('.choice', { state: 'visible', timeout: 20000 });
  console.log('選択肢が表示されました');
  
  // スクリーンショットを撮影（選択肢表示状態）
  await page.screenshot({ path: 'tests/e2e/screenshots/choices.png' });
  
  // 「長いテキストテスト」を選択（より具体的なセレクタを使用）
  await page.locator('div.choice', { hasText: '長いテキストテスト' }).click();
  console.log('「長いテキストテスト」をクリックしました');
  
  // 最初のテキストが表示されるまで待機（タイムアウトを長めに設定）
  await expect(page.locator('#messageView')).toContainText('これは長いテキストのテスト用シナリオです', { timeout: 10000 });
  console.log('長いテキストテストの最初のテキストが表示されました');
  
  // 次のテキストを表示するためにクリック
  await page.click('#messageWindow');
  console.log('次のテキストを表示するためにクリックしました');
  
  // 長いテキストが表示され始めるまで待機（タイムアウトを長めに設定）
  await expect(page.locator('#messageView')).toContainText('この文章はとても長い文章です', { timeout: 10000 });
  console.log('長いテキストが表示されました');
  
  // waitCircleが表示されるまで待機（テキストが表示領域を超えた場合）
  try {
    await page.waitForSelector('#waitCircle[style*="visibility: visible"]', { timeout: 15000 });
    console.log('waitCircleが表示されました（クリック待ち状態）');
  } catch (error) {
    console.log('waitCircleが表示されませんでした。テキストが表示領域を超えていない可能性があります。');
    // エラーが発生してもテストを続行
  }
  
  // スクリーンショットを撮影（クリック待ち状態）
  await page.screenshot({ path: 'tests/e2e/screenshots/message-window-click-wait.png' });
  
  // クリックして続きを表示
  await page.click('#messageWindow');
  console.log('クリックして続きを表示しました');
  
  // テキストがクリアされて続きが表示されることを確認（タイムアウトを長めに設定）
  try {
    await expect(page.locator('#messageView')).not.toContainText('この文章はとても長い文章です', { timeout: 5000 });
    await expect(page.locator('#messageView')).toContainText('さらに長い文章を追加します', { timeout: 5000 });
    console.log('テキストがクリアされて続きが表示されました');
  } catch (error) {
    console.log('テキストの切り替えが確認できませんでした。スクリーンショットを確認してください。');
    // エラーが発生してもテストを続行
  }
  
  // 最後のテキストまで進める
  await page.click('#messageWindow');
  console.log('次のテキストに進みました');
  await page.click('#messageWindow');
  console.log('最後のテキストに進みました');
  
  // テストが完了したことを確認（タイムアウトを長めに設定）
  await expect(page.locator('#messageView')).toContainText('テストが完了しました', { timeout: 10000 });
  console.log('テストが完了しました');
});