import { test, expect } from '@playwright/test';

test.describe('メッセージウィンドウのオーバーフロー問題のテスト', () => {
  test('長いテキストが自動的に改行され、高さを超えた場合は適切に処理される', async ({ page }) => {
    // テストページにアクセス
    await page.goto('/');
    
    // タイトル画面が表示されるのを待つ
    await page.waitForSelector('#messageWindow');
    
    // 初期テキストをクリック（タップでスタート）
    await page.click('#messageWindow');
    
    // テスト用のシーンに移動
    await page.evaluate(() => {
      // グローバルオブジェクトからCoreインスタンスを取得
      const core = (window as any).core;
      // message_overflow_testシーンをロード
      core.loadScene('message_overflow_test').then(() => {
        core.loadScreen(core.sceneConfig);
      });
    });
    
    // 短いテキストが表示されるのを待つ
    await page.waitForFunction(() => {
      const messageText = document.querySelector('#messageView')?.textContent;
      return messageText && messageText.includes('これは短いテキスト');
    });
    
    // スクリーンショットを撮影（短いテキスト）
    await page.screenshot({ path: 'tests/e2e/screenshots/short-text.png' });
    
    // クリックして次のテキストへ
    await page.click('#messageWindow');
    
    // 長いテキストが表示されるのを待つ
    await page.waitForFunction(() => {
      const messageText = document.querySelector('#messageView')?.textContent;
      return messageText && messageText.includes('これは非常に長いテキスト');
    });
    
    // スクリーンショットを撮影（長いテキスト - 自動改行の確認）
    await page.screenshot({ path: 'tests/e2e/screenshots/long-text-wrap.png' });
    
    // メッセージビューの内容を取得
    const messageViewContent = await page.evaluate(() => {
      return document.querySelector('#messageView')?.innerHTML || '';
    });
    
    // 自動改行が行われていることを確認（<br>タグが含まれているか）
    expect(messageViewContent).toContain('<br>');
    
    // クリックして次のテキストへ
    await page.click('#messageWindow');
    
    // 改行コードを含むテキストが表示されるのを待つ
    await page.waitForFunction(() => {
      const messageText = document.querySelector('#messageView')?.textContent;
      return messageText && messageText.includes('これは複数行にわたる長いテキスト');
    });
    
    // スクリーンショットを撮影（改行コードを含むテキスト）
    await page.screenshot({ path: 'tests/e2e/screenshots/multiline-text.png' });
    
    // 改行が適切に処理されていることを確認
    const multilineContent = await page.evaluate(() => {
      return document.querySelector('#messageView')?.innerHTML || '';
    });
    
    // 改行コードが<br>タグに変換されていることを確認
    expect(multilineContent.split('<br>').length).toBeGreaterThan(3);
    
    // クリックして次のテキストへ
    await page.click('#messageWindow');
    
    // 非常に長いテキストが表示されるのを待つ
    await page.waitForFunction(() => {
      const messageText = document.querySelector('#messageView')?.textContent;
      return messageText && messageText.includes('これはメッセージウィンドウの高さを超える');
    });
    
    // スクリーンショットを撮影（非常に長いテキスト - スクロールまたはページ分割の確認）
    await page.screenshot({ path: 'tests/e2e/screenshots/very-long-text.png' });
    
    // メッセージウィンドウのスクロール位置またはページ分割を確認
    const scrollInfo = await page.evaluate(() => {
      const messageWindow = document.querySelector('#messageWindow');
      const messageView = document.querySelector('#messageView');
      
      return {
        windowHeight: messageWindow?.clientHeight || 0,
        contentHeight: messageView?.scrollHeight || 0,
        scrollTop: messageWindow?.scrollTop || 0,
        hasNextPageIndicator: document.querySelector('#messageView div')?.textContent === '▼'
      };
    });
    
    // メッセージウィンドウの高さを超えるコンテンツがある場合、
    // スクロールされているか、または次のページ表示があることを確認
    if (scrollInfo.contentHeight > scrollInfo.windowHeight) {
      expect(scrollInfo.scrollTop > 0 || scrollInfo.hasNextPageIndicator).toBeTruthy();
    }
  });
});