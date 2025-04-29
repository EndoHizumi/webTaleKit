# WebTaleKit テキスト処理の改善提案

## 現状の textHandler の動作

現在の `textHandler` は以下の主要な機能を持っています：

- テキスト表示の処理（文字列や配列を受け取り画面に表示）
- 名前表示の処理（キャラクター名などの表示）
- 変数展開（`{{変数名}}` 形式の記述を実際の値に展開）
- 特殊テキスト要素（改行、待機、装飾）の処理
- テキスト表示速度の制御
- HTTP レスポンス処理と履歴管理

```javascript
async textHandler(scenarioObject) {
  // 文章だけの場合は、contentプロパティに配列として設定する
  if (typeof scenarioObject === 'string') scenarioObject = { content: [scenarioObject] };
  
  // 名前が設定されている場合は、名前を表示する
  if (scenarioObject.name) {
    this.drawer.drawName(scenarioObject.name);
  } else {
    this.drawer.drawName('');
  }

  this.drawer.clearText(); // テキスト表示領域をクリア
  
  // 表示する文章を1行ずつ表示する
  for (const text of scenarioObject.content) {
    if (typeof text === 'string') {
      await this.drawer.drawText(this.expandVariable(text), scenarioObject.speed || 25);
    } else {
      if (text.type === 'br' || text.type === 'wait') {
        if (text.type === 'br') this.drawer.drawLineBreak();
        if (!text.nw) {
          await this.waitHandler({ wait: text.time });
        }
      } else {
        const container = this.drawer.createDecoratedElement(text);
        await this.drawer.drawText(this.expandVariable(text.content[0]), text.speed || 25, container);
      }
    }
  }
  
  await this.waitHandler({ wait: scenarioObject.time });
  this.scenarioManager.setHistory(scenarioObject.content);
}
```

## 課題：メッセージボックスのオーバーフロー

現在の実装では、テキスト量がメッセージボックスの容量を超えた場合に適切に処理できていません。これにより以下の問題が発生します：

- テキストがメッセージボックスの外にはみ出す
- スクロールバーが表示されず、テキストの一部が読めない
- レイアウトが崩れる可能性がある

### 懸念点

#### 技術的懸念
- フォントによって文字幅が異なる（特に等幅でないフォント）
- 日本語と英語が混在する場合、正確な計算が困難
- 装飾付きテキスト（色付き、太字など）の幅計算が複雑
- DOM描画のタイミングと計算のタイミングの整合性確保

#### ユーザー体験の懸念
- 意図しない箇所での文章分割
- ユーザーのページ送り操作の一貫性
- シナリオ作者の演出意図を損なう可能性

#### 実装上の懸念
- シナリオオブジェクト構造変更の副作用
- 分割ポイントの決定アルゴリズム
- 特殊要素（装飾タグなど）をまたぐ分割の処理
- 

## 提案：Canvas API を使用した自動改行機能

Canvas API の `measureText` メソッドを使用して、実際のテキスト幅を計算し、メッセージボックスの容量に応じて適切に分割する方法を提案します。

### 基本的なアルゴリズム

1. メッセージボックスの幅と高さを取得
2. 一行の高さを計算し、表示可能な最大行数を算出
3. テキストを文字単位で分析し、行に分割
4. 行数が最大行数を超える場合、超過分を次のコンテンツとして分割

### 実装例

```javascript
async textHandler(scenarioObject) {
  // 既存の処理（文字列→オブジェクト変換など）
  if (typeof scenarioObject === 'string') scenarioObject = { content: [scenarioObject] };
  
  // 名前表示などの処理
  if (scenarioObject.name) {
    this.drawer.drawName(scenarioObject.name);
  } else {
    this.drawer.drawName('');
  }
  
  this.onNextHandler = () => { this.drawer.isSkip = true };
  this.drawer.clearText();
  
  // メッセージボックスの寸法を取得
  const messageBox = this.screenHtml.querySelector('#messageView');
  const messageBoxWidth = messageBox.clientWidth;
  const messageBoxHeight = messageBox.clientHeight;
  
  // 一時的なcanvasを作成してテキスト測定に使用
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // メッセージボックスのスタイルを取得してcanvasに適用
  const styles = window.getComputedStyle(messageBox);
  ctx.font = styles.font;
  
  // 一行の高さを計算（フォントサイズに基づく）
  const lineHeight = parseInt(styles.lineHeight) || parseInt(styles.fontSize) * 1.2;
  
  // 最大行数を計算
  const maxLines = Math.floor(messageBoxHeight / lineHeight);
  
  // 表示するコンテンツを処理
  for (let i = 0; i < scenarioObject.content.length; i++) {
    const text = scenarioObject.content[i];
    
    // 文字列の場合は行分割処理
    if (typeof text === 'string') {
      const expandedText = this.expandVariable(text);
      const textLines = this.calculateTextLines(ctx, expandedText, messageBoxWidth);
      
      // オーバーフローの確認
      if (textLines.length > maxLines) {
        // 表示可能な行数までを表示
        const displayText = textLines.slice(0, maxLines).join('\n');
        await this.drawer.drawText(displayText, scenarioObject.speed || 25);
        
        // 残りのテキストを次のコンテンツとして挿入
        const remainingText = textLines.slice(maxLines).join('\n');
        scenarioObject.content.splice(i + 1, 0, remainingText);
        
        // 一旦表示を完了し、ユーザーの入力を待つ
        await this.waitHandler({ wait: scenarioObject.time });
        this.drawer.clearText();
        continue;
      }
      
      // オーバーフローしない場合は通常通り表示
      await this.drawer.drawText(expandedText, scenarioObject.speed || 25);
    } else {
      // 特殊要素（brやwaitなど）の処理
      // （既存コードと同様）
    }
  }
  
  await this.waitHandler({ wait: scenarioObject.time });
  this.drawer.isSkip = false;
  this.scenarioManager.setHistory(scenarioObject.content);
}

// テキストを行に分割する関数
calculateTextLines(ctx, text, maxWidth) {
  const words = text.split('');
  const lines = [];
  let currentLine = '';
  
  for (let i = 0; i < words.length; i++) {
    const char = words[i];
    const testLine = currentLine + char;
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    
    if (testWidth > maxWidth && currentLine !== '') {
      lines.push(currentLine);
      currentLine = char;
    } else {
      currentLine = testLine;
    }
  }
  
  if (currentLine !== '') {
    lines.push(currentLine);
  }
  
  return lines;
}
```

## 文字装飾の対応

WebTaleKitでは文字装飾が以下のような形式で提供されます：

```javascript
// コンテンツ例
[
  {type: 'color', content: ['文字の色を変えたり'], value: 'red'},
  '、',
  {type: 'b', content: ['太字にしたり']},
  '、',
  {type: 'i', content: ['斜体にしたり']},
  'することもできます。'
]
```

このような複合的な装飾テキストに対応するためには、テキスト分割処理を拡張する必要があります。

### 複合テキスト処理

```javascript
// 複合テキストの行分割計算
calculateMixedTextLines(ctx, contentArray, maxWidth) {
  const lines = [];
  let currentLine = [];
  let currentLineWidth = 0;
  
  for (const item of contentArray) {
    if (typeof item === 'string') {
      // 通常の文字列処理
      for (const char of item) {
        const charWidth = ctx.measureText(char).width;
        
        if (currentLineWidth + charWidth > maxWidth) {
          lines.push([...currentLine]);
          currentLine = [char];
          currentLineWidth = charWidth;
        } else {
          if (currentLine.length > 0 && typeof currentLine[currentLine.length - 1] === 'string') {
            currentLine[currentLine.length - 1] += char;
          } else {
            currentLine.push(char);
          }
          currentLineWidth += charWidth;
        }
      }
    } else {
      // 装飾テキスト処理
      const decoratedText = item.content[0];
      let tempFont = ctx.font;
      
      // 装飾に応じたフォント設定
      if (item.type === 'b') ctx.font = 'bold ' + tempFont;
      if (item.type === 'i') ctx.font = 'italic ' + tempFont;
      
      let currentDecoratedPart = '';
      let currentDecoratedWidth = 0;
      
      for (const char of decoratedText) {
        const charWidth = ctx.measureText(char).width;
        
        if (currentLineWidth + currentDecoratedWidth + charWidth > maxWidth) {
          // 現在の装飾部分を現在の行に追加
          if (currentDecoratedPart !== '') {
            const decoratedFragment = { ...item, content: [currentDecoratedPart] };
            currentLine.push(decoratedFragment);
            currentLineWidth += currentDecoratedWidth;
          }
          
          // 行を確定
          lines.push([...currentLine]);
          currentLine = [];
          currentLineWidth = 0;
          
          // 新しい装飾部分を開始
          currentDecoratedPart = char;
          currentDecoratedWidth = charWidth;
        } else {
          currentDecoratedPart += char;
          currentDecoratedWidth += charWidth;
        }
      }
      
      // 残りの装飾部分を追加
      if (currentDecoratedPart !== '') {
        const decoratedFragment = { ...item, content: [currentDecoratedPart] };
        currentLine.push(decoratedFragment);
        currentLineWidth += currentDecoratedWidth;
      }
      
      // フォント設定を元に戻す
      ctx.font = tempFont;
    }
  }
  
  // 最後の行を追加
  if (currentLine.length > 0) {
    lines.push(currentLine);
  }
  
  return lines;
}

// 複合テキストの描画
async drawMixedTextLine(line, speed) {
  for (const item of line) {
    if (typeof item === 'string') {
      await this.drawer.drawText(item, speed);
    } else {
      const container = this.drawer.createDecoratedElement(item);
      await this.drawer.drawText(item.content[0], item.speed || speed, container);
    }
  }
}
```

### textHandler の拡張

```javascript
async textHandler(scenarioObject) {
  // ...既存の前処理...
  
  // メッセージボックスの寸法と最大行数計算
  const messageBox = this.screenHtml.querySelector('#messageView');
  const messageBoxWidth = messageBox.clientWidth;
  const messageBoxHeight = messageBox.clientHeight;
  const lineHeight = parseInt(styles.lineHeight) || parseInt(styles.fontSize) * 1.2;
  const maxLines = Math.floor(messageBoxHeight / lineHeight);
  
  // 混合テキストコンテンツの処理
  const allTextLines = this.calculateMixedTextLines(ctx, scenarioObject.content, messageBoxWidth);
  
  // 表示可能な行数を超える場合は分割
  if (allTextLines.length > maxLines) {
    // 表示可能な分を表示
    for (let i = 0; i < maxLines; i++) {
      await this.drawMixedTextLine(allTextLines[i], scenarioObject.speed || 25);
      if (i < maxLines - 1) this.drawer.drawLineBreak();
    }
    
    // 残りの行を次のシナリオオブジェクトとして挿入
    const remainingLines = allTextLines.slice(maxLines);
    const remainingContent = this.flattenTextLines(remainingLines);
    
    // 残りのコンテンツをシナリオに追加
    this.scenarioManager.addScenario([{ ...scenarioObject, content: remainingContent }]);
    
    await this.waitHandler({ wait: scenarioObject.time });
    this.drawer.clearText();
  } else {
    // 全て表示可能な場合
    for (let i = 0; i < allTextLines.length; i++) {
      await this.drawMixedTextLine(allTextLines[i], scenarioObject.speed || 25);
      if (i < allTextLines.length - 1) this.drawer.drawLineBreak();
    }
    
    await this.waitHandler({ wait: scenarioObject.time });
  }
  
  this.drawer.isSkip = false;
  this.scenarioManager.setHistory(scenarioObject.content);
}
```

## 実装上の最適化ポイント

### パフォーマンス最適化
- 計算結果のキャッシュを実装
- テキスト測定処理を効率化
- 大きなテキストブロックの処理を分散

### 言語処理の最適化
- 日本語/英語の違いを考慮した分割ロジック
- 単語の途中での分割を回避する英語モード
- 読みやすさを考慮した分割ポイントの選定

### デバッグサポート
- 開発モードでの分割ポイントの可視化
- メッセージボックスのサイズと行数の表示
- オーバーフロー検出時の警告ログ

## まとめ

WebTaleKit のテキスト処理システムに Canvas API を活用した自動改行機能を実装することで、メッセージボックスのオーバーフロー問題を解決できます。さらに、複合的な装飾テキストにも対応した拡張により、より高度なテキスト表現が可能になります。

この改善によって：
1. シナリオ作者は文章量を気にせずに創作に集中できる
2. プレイヤーはより快適な読書体験を得られる
3. 装飾テキストを含む複雑な表現にも対応できる

実装にあたっては、パフォーマンスと正確性のバランスに注意しつつ、段階的なテストを行いながら機能を拡充していくことが重要です。
