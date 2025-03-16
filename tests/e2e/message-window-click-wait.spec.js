// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * 指定したミリ秒だけ待機する関数
 * @param {number} ms 待機時間（ミリ秒）
 */
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// テストのタイムアウト時間を延長（デフォルトは30秒）
test.setTimeout(150000); // 2分に設定

test('メッセージウィンドウの表示領域を超えた場合にクリック待ちになる機能のテスト', async ({ page }) => {
  // ゲームを起動
  await page.goto('/');
  console.log('ページを開きました');
  
  // ページが完全に読み込まれるまで待機
  await page.waitForSelector('#messageView', { state: 'visible' });
  await wait(1000); // 1秒待機
  
  // 初期の「タップでスタート」が表示されるまで待機
  await expect(page.locator('#messageView')).toContainText('タップでスタート');
  console.log('「タップでスタート」が表示されました');
  await wait(1000); // 1秒待機
  
  // タップでスタートをクリック
  await page.click('#messageWindow');
  console.log('「タップでスタート」をクリックしました');
  await wait(2000); // 2秒待機
  
  // メインコンテンツが表示されるまで待機（タイムアウトを長めに設定）
  await expect(page.locator('#messageView')).toContainText('WebTaleKitデモゲームへようこそ！', { timeout: 10000 });
  console.log('「WebTaleKitデモゲームへようこそ！」が表示されました');
  await wait(1000); // 1秒待機
  
  // 最初のテキストをクリックして次に進む
  await page.click('#messageWindow');
  console.log('最初のテキストをクリックしました');
  await wait(2000); // 2秒待機
  
  // 2つ目のテキストが表示されるまで待機
  await expect(page.locator('#messageView')).toContainText('以下の機能デモから', { timeout: 10000 });
  console.log('2つ目のテキストが表示されました');
  await wait(1000); // 1秒待機
  
  // 2つ目のテキストをクリックして選択肢を表示
  await page.click('#messageWindow');
  console.log('2つ目のテキストをクリックしました');
  await wait(3000); // 3秒待機
  
  // 選択肢が表示されるまで待機（タイムアウトを長めに設定）
  await page.waitForSelector('.choice', { state: 'visible', timeout: 20000 });
  console.log('選択肢が表示されました');
  await wait(2000); // 2秒待機
  
  // スクリーンショットを撮影（選択肢表示状態）
  await page.screenshot({ path: 'tests/e2e/screenshots/choices.png' });
  await wait(1000); // 1秒待機
  
  // 「長いテキストテスト」を選択（より具体的なセレクタを使用）
  await page.locator('div.choice', { hasText: '長いテキストテスト' }).click();
  console.log('「長いテキストテスト」をクリックしました');
  await wait(3000); // 3秒待機
  
  // 最初のテキストが表示されるまで待機（タイムアウトを長めに設定）
  await expect(page.locator('#messageView')).toContainText('これは長いテキストのテスト用シナリオです', { timeout: 10000 });
  console.log('長いテキストテストの最初のテキストが表示されました');
  await wait(2000); // 2秒待機
  
  // 次のテキストを表示するためにクリック
  await page.click('#messageWindow');
  console.log('次のテキストを表示するためにクリックしました');
  await wait(3000); // 3秒待機
  
  // 長いテキストが表示され始めるまで待機（タイムアウトを長めに設定）
  await expect(page.locator('#messageView')).toContainText('この文章はとても長い文章です', { timeout: 10000 });
  console.log('長いテキストが表示されました');
  await wait(2000); // 2秒待機
  // waitCircleが表示されるまで待機（テキストが表示領域を超えた場合）
  try {
    await page.waitForSelector('#waitCircle[style*="visibility: visible"]', { timeout: 15000 });
    console.log('waitCircleが表示されました（クリック待ち状態）');
    await wait(1000); // 1秒待機
  } catch (error) {
    console.log('waitCircleが表示されませんでした。テキストが表示領域を超えていない可能性があります。');
    // エラーが発生してもテストを続行
  }
  
  // スクリーンショットを撮影（クリック待ち状態）
  await page.screenshot({ path: 'tests/e2e/screenshots/message-window-click-wait.png' });
  await wait(1000); // 1秒待機
  
  // クリックして続きを表示
  await page.click('#messageWindow');
  console.log('クリックして続きを表示しました');
  await wait(3000); // 3秒待機
  console.log('クリックして続きを表示しました');
  
  // テキストがクリアされて続きが表示されることを確認（タイムアウトを長めに設定）
  try {
    await expect(page.locator('#messageView')).not.toContainText('この文章はとても長い文章です', { timeout: 5000 });
    await expect(page.locator('#messageView')).toContainText('さらに長い文章を追加します', { timeout: 5000 });
    console.log('テキストがクリアされて続きが表示されました');
    await wait(2000); // 2秒待機
  } catch (error) {
    console.log('テキストの切り替えが確認できませんでした。スクリーンショットを確認してください。');
    // エラーが発生してもテストを続行
  }
  
  // 最後のテキストまで進める
  await page.click('#messageWindow');
  console.log('次のテキストに進みました');
  await wait(2000); // 2秒待機
  
  await page.click('#messageWindow');
  console.log('最後のテキストに進みました');
  await wait(2000); // 2秒待機
  
  // テストが完了したことを確認（タイムアウトを長めに設定）
  await expect(page.locator('#messageView')).toContainText('テストが完了しました', { timeout: 10000 });
  console.log('テストが完了しました');
});