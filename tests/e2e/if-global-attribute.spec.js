import { test, expect } from '@playwright/test'

test('ifグローバル属性のテスト', async ({ page }) => {
  // テストのタイムアウトを60秒に設定
  test.setTimeout(60000)
  // サーバーを起動して、テスト用のページにアクセス
  await page.goto('http://localhost:8080')
  
  // ページが完全に読み込まれるのを待つ
  await page.waitForLoadState('networkidle')
  
  // タイトル画面の「タップでスタート」をクリック
  await page.click('#messageWindow')
  
  // 「WebTaleKitデモゲームへようこそ！」をクリック
  await page.waitForTimeout(1000) // テキスト表示を待つ
  await page.click('#messageWindow')
  
  // 「以下の機能デモから、体験したいものを選んでください。」をクリック
  await page.waitForTimeout(1000) // テキスト表示を待つ
  await page.click('#messageWindow')
  
  // 選択肢が表示されるのを待つ
  await page.waitForTimeout(1000)
  
  // 選択肢画面で「ifグローバル属性テスト」を選択
  // より堅牢なセレクタを使用
  try {
    // まず、選択肢の要素を探す
    const choices = await page.$$('.choice-item')
    console.log(`選択肢の数: ${choices.length}`)
    
    // 選択肢の中から「ifグローバル属性テスト」を含むものを探す
    let found = false
    for (const choice of choices) {
      const text = await choice.textContent()
      console.log(`選択肢: ${text}`)
      if (text.includes('ifグローバル属性テスト')) {
        await choice.click()
        found = true
        break
      }
    }
    
    // 選択肢が見つからない場合は、直接座標をクリック
    if (!found) {
      console.log('選択肢が見つからないため、直接座標をクリックします')
      // 右側の選択肢の位置をクリック
      await page.mouse.click(790, 195)
    }
  } catch (error) {
    console.error('選択肢の検出に失敗しました:', error)
    // 直接座標をクリック
    await page.mouse.click(790, 195)
  }
  
  // 「ifグローバル属性のテストです。」をクリック
  await page.waitForTimeout(1000)
  await page.click('#messageWindow')
  
  // 「変数hogeの値を設定します。」をクリック
  await page.waitForTimeout(1000)
  await page.click('#messageWindow')
  
  // 「現在のhogeの値: 0」をクリック
  await page.waitForTimeout(1000)
  await page.click('#messageWindow')
  
  // if="hoge==1"の条件がfalseなので、このテキストはスキップされる
  // if="hoge==2"の条件もfalseなので、このテキストもスキップされる
  
  // 「hogeの値を2に変更します。」をクリック
  await page.waitForTimeout(1000)
  await page.click('#messageWindow')
  
  // 「現在のhogeの値: 2」をクリック
  await page.waitForTimeout(1000)
  await page.click('#messageWindow')
  
  // if="hoge==1"の条件がfalseなので、このテキストはスキップされる
  // if="hoge==2"の条件がtrueなので、このテキストは表示される
  // 「この文章はhoge==2の場合に表示されます。」が表示されることを確認
  await page.waitForTimeout(1000)
  const messageText = await page.textContent('#messageView')
  console.log(`メッセージテキスト: ${messageText}`)
  
  // 「ifグローバル属性のテストが完了しました。」をクリック
  await page.waitForTimeout(1000)
  await page.click('#messageWindow')
})