# textHandler テスト仕様書

## 概要

textHandlerはビジュアルノベルエンジンのテキスト表示を制御する重要なコンポーネントです。
このテスト仕様では、textHandlerの各機能が正しく動作することを確認するためのテストケースを定義します。

## テストケース

### 1. 基本的なテキスト処理

#### 1.1 文字列入力の処理

```javascript
describe('文字列入力の処理', () => {
  it('単一の文字列を配列に変換して処理すること', async () => {
    const input = 'こんにちは'
    // 期待値: { content: ["こんにちは"] }として処理される
  })
})
```

#### 1.2 配列入力の処理

```javascript
describe('配列入力の処理', () => {
  it('配列形式の入力を正しく処理すること', async () => {
    const input = { content: ['テスト1', 'テスト2'] }
    // 期待値: 各テキストが順番に表示される
  })
})
```

#### 1.3 HTTPレスポンスの処理

```javascript
describe('HTTPレスポンスの処理', () => {
  it('thenプロパティのテキストを追加すること', async () => {
    const input = {
      content: ['基本テキスト'],
      then: ['追加テキスト'],
    }
    // 期待値: content配列に"追加テキスト"が追加される
  })

  it('errorプロパティのテキストを追加すること', async () => {
    const input = {
      content: ['基本テキスト'],
      error: ['エラーテキスト'],
    }
    // 期待値: content配列に"エラーテキスト"が追加される
  })
})
```

### 2. 変数展開機能

#### 2.1 基本的な変数展開

```javascript
describe('変数展開', () => {
  it('{{}}で囲まれた変数を正しく展開すること', async () => {
    const input = { content: ['名前は{{userName}}です'] }
    // 期待値: 変数が実際の値に置換される
  })

  it('複数の変数を展開できること', async () => {
    const input = { content: ['{{firstName}} {{lastName}}さん'] }
    // 期待値: 全ての変数が正しく置換される
  })
})
```

#### 2.2 オブジェクト変数の展開

```javascript
describe('オブジェクト変数の展開', () => {
  it('オブジェクト型の変数をJSON文字列として展開すること', async () => {
    const input = { content: ['データ: {{userData}}'] }
    // 期待値: オブジェクトがJSON.stringify()で文字列化される
  })
})
```

### 3. メッセージボックス制御

#### 3.1 テキストオーバーフロー検出

```javascript
describe('テキストオーバーフロー検出', () => {
  it('テキストが表示領域を超える場合に検出すること', async () => {
    const input = { content: ['長いテキスト...'] }
    // 期待値: checkOverflow()がtrueを返す
  })

  it('テキストが表示領域内の場合に検出しないこと', async () => {
    const input = { content: ['短いテキスト'] }
    // 期待値: checkOverflow()がfalseを返す
  })
})
```

#### 3.2 テキスト分割処理

```javascript
describe('テキスト分割処理', () => {
  it('長いテキストを適切に分割すること', async () => {
    const input = { content: ['表示領域を超える長いテキスト...'] }
    // 期待値:
    // 1. テキストが表示可能な行数に分割される
    // 2. 残りのテキストが新しいシナリオとして追加される
  })

  it('分割されたテキストが正しい速度で表示されること', async () => {
    const input = {
      content: ['長いテキスト...'],
      speed: 50,
    }
    // 期待値: 分割後も指定された速度が維持される
  })
})
```

### 4. テキスト表示制御

#### 4.1 名前表示

```javascript
describe('名前表示', () => {
  it('名前が指定された場合に表示すること', async () => {
    const input = {
      content: ['テキスト'],
      name: 'キャラクター名',
    }
    // 期待値: drawName()が"キャラクター名"で呼ばれる
  })

  it('名前が指定されない場合に空文字を表示すること', async () => {
    const input = { content: ['テキスト'] }
    // 期待値: drawName()が空文字で呼ばれる
  })
})
```

#### 4.2 テキスト表示速度

```javascript
describe('テキスト表示速度', () => {
  it('指定された速度でテキストを表示すること', async () => {
    const input = {
      content: ['テキスト'],
      speed: 50,
    }
    // 期待値: drawText()が指定された速度で実行される
  })

  it('速度指定がない場合にデフォルト速度を使用すること', async () => {
    const input = { content: ['テキスト'] }
    // 期待値: drawText()がデフォルト速度(25)で実行される
  })
})
```

#### 4.3 装飾要素の処理

```javascript
describe('装飾要素の処理', () => {
  it('改行タグを正しく処理すること', async () => {
    const input = {
      content: ['テキスト', { type: 'br' }, '次の行'],
    }
    // 期待値: drawLineBreak()が呼ばれる
  })

  it('待機タグを正しく処理すること', async () => {
    const input = {
      content: ['テキスト', { type: 'wait', time: 1000 }, '次のテキスト'],
    }
    // 期待値: waitHandler()が指定された時間で呼ばれる
  })

  it('装飾付きテキストを正しく処理すること', async () => {
    const input = {
      content: [
        {
          type: 'decorated',
          content: ['装飾テキスト'],
          speed: 30,
        },
      ],
    }
    // 期待値:
    // 1. createDecoratedElement()が呼ばれる
    // 2. 指定された速度でテキストが表示される
  })
})
```

### 5. 履歴管理

#### 5.1 テキスト履歴の保存

```javascript
describe('テキスト履歴の保存', () => {
  it('表示したテキストを履歴に保存すること', async () => {
    const input = { content: ['テキスト1', 'テキスト2'] }
    // 期待値: setHistory()が正しい内容で呼ばれる
  })
})
```

## テスト実装の注意点

1. 非同期処理

- textHandlerは非同期関数のため、全てのテストでasync/awaitを適切に使用する
- Promiseの解決を適切に待機する

2. モック化が必要なオブジェクト

- drawer: テキスト描画関連のメソッド
- textMeasurer: テキストサイズ測定関連のメソッド
- scenarioManager: シナリオ管理関連のメソッド

3. テストデータ

- 日本語文字列を含むテストケース
- 特殊文字を含むテストケース
- 長文テキストのテストケース

4. エッジケース

- 空の入力
- nullやundefinedを含む入力
- 不正なフォーマットの入力

## 期待される結果

1. 全てのテストケースが成功すること
2. エッジケースでも適切にエラーハンドリングされること
3. パフォーマンスが許容範囲内であること
4. メモリリークが発生しないこと
