# dialog タグ

モーダルダイアログを表示します。ゲーム内でのポップアップメッセージや確認ダイアログに使用できます。

## 基本的な使い方

```html
<dialog>
  <prompt>
    <text>本当に終了しますか？</text>
  </prompt>
  <actions>
    <action id="yes" label="はい">
      <text>ゲームを終了します。</text>
      <route to="title" />
    </action>
    <action id="no" label="いいえ">
      <text>ゲームを続けます。</text>
    </action>
  </actions>
</dialog>
```

## 属性

| 属性 | 型 | 必須 | デフォルト | 説明 |
|------|------|------|----------|------|
| if | string | × | - | 条件式（trueの場合のみ実行） |

## 子要素

| 要素 | 必須 | 説明 |
|------|------|------|
| prompt | ✓ | ダイアログに表示するメッセージ |
| actions | ✓ | ユーザーが選択できるアクション（ボタン） |

### prompt 要素

ダイアログ内に表示するテキストを指定します。複数のテキスト要素を含めることができます。

```html
<prompt>
  <text>セーブデータを削除しますか？</text>
  <text>この操作は取り消せません。</text>
</prompt>
```

### actions 要素

ダイアログのボタンを定義します。各アクションには以下の属性があります：

| 属性 | 型 | 必須 | 説明 |
|------|------|------|------|
| id | string | ✓ | アクションの識別子 |
| label | string | ✓ | ボタンに表示するテキスト |

```html
<actions>
  <action id="confirm" label="確認">
    <text>確認しました。</text>
  </action>
  <action id="cancel" label="キャンセル">
    <text>キャンセルしました。</text>
  </action>
</actions>
```

## 使用例

### 確認ダイアログ

```html
<dialog>
  <prompt>
    <text>このアイテムを購入しますか？</text>
    <text>価格: {{itemPrice}}円</text>
  </prompt>
  <actions>
    <action id="buy" label="購入する">
      <call name="buyItem" args="[itemId]" />
      <text>アイテムを購入しました。</text>
    </action>
    <action id="cancel" label="キャンセル">
      <text>購入をキャンセルしました。</text>
    </action>
  </actions>
</dialog>
```

### 選択肢ダイアログ

```html
<dialog>
  <prompt>
    <text>難易度を選択してください</text>
  </prompt>
  <actions>
    <action id="easy" label="イージー">
      <call name="setDifficulty" args="['easy']" />
      <text>イージーモードを選択しました。</text>
    </action>
    <action id="normal" label="ノーマル">
      <call name="setDifficulty" args="['normal']" />
      <text>ノーマルモードを選択しました。</text>
    </action>
    <action id="hard" label="ハード">
      <call name="setDifficulty" args="['hard']" />
      <text>ハードモードを選択しました。</text>
    </action>
  </actions>
</dialog>
```

### 情報ダイアログ

```html
<dialog>
  <prompt>
    <text>新しい実績を解除しました！</text>
    <text>「{{achievementName}}」</text>
  </prompt>
  <actions>
    <action id="ok" label="OK">
      <text>次に進みます。</text>
    </action>
  </actions>
</dialog>
```

### セーブ/ロード確認

```html
<dialog>
  <prompt>
    <text>セーブデータをロードしますか？</text>
    <text>現在の進行状況は失われます。</text>
  </prompt>
  <actions>
    <action id="load" label="ロードする">
      <load slot="1" />
      <text>セーブデータをロードしました。</text>
    </action>
    <action id="cancel" label="キャンセル">
      <text>ロードをキャンセルしました。</text>
    </action>
  </actions>
</dialog>
```

### 条件付きダイアログ

```html
<dialog if="showTutorial">
  <prompt>
    <text>チュートリアルを表示しますか？</text>
  </prompt>
  <actions>
    <action id="yes" label="はい">
      <route to="tutorial" />
    </action>
    <action id="no" label="いいえ">
      <call name="skipTutorial" />
      <route to="chapter1" />
    </action>
  </actions>
</dialog>
```

## 実用例

### ゲーム終了確認

```html
<scenario>
  <text>メニュー画面</text>

  <choice prompt="どうしますか？">
    <item label="ゲームを続ける">
      <text>ゲームを続けます。</text>
    </item>
    <item label="ゲームを終了">
      <dialog>
        <prompt>
          <text>本当に終了しますか？</text>
        </prompt>
        <actions>
          <action id="quit" label="終了する">
            <text>ゲームを終了しました。</text>
            <route to="title" />
          </action>
          <action id="cancel" label="キャンセル">
            <text>ゲームを続けます。</text>
          </action>
        </actions>
      </dialog>
    </item>
  </choice>
</scenario>
```

### アイテム購入システム

```html
<scenario>
  <text>ショップへようこそ</text>

  <choice prompt="何を購入しますか？">
    <item label="体力回復薬 (100円)">
      <dialog>
        <prompt>
          <text>体力回復薬を購入しますか？</text>
          <text>価格: 100円</text>
          <text>所持金: {{money}}円</text>
        </prompt>
        <actions>
          <action id="buy" label="購入する">
            <call name="buyPotion" />
            <text if="purchaseSuccess">体力回復薬を購入しました。</text>
            <text if="!purchaseSuccess">お金が足りません。</text>
          </action>
          <action id="cancel" label="キャンセル">
            <text>購入をキャンセルしました。</text>
          </action>
        </actions>
      </dialog>
    </item>
  </choice>
</scenario>

<script>
let money = 500;
let purchaseSuccess = false;

function buyPotion() {
  if (money >= 100) {
    money -= 100;
    purchaseSuccess = true;
  } else {
    purchaseSuccess = false;
  }
}
</script>
```

## 動作の詳細

### 内部処理

1. 既存のダイアログがあれば閉じる
2. ダイアログテンプレートを読み込む
3. `prompt` 要素の内容をダイアログに表示
4. `actions` 要素からボタンを生成
5. ダイアログをモーダル表示（`showModal()`）
6. ユーザーがボタンをクリック
7. 選択されたアクションの内容を実行
8. ダイアログを閉じる

### テンプレート

ダイアログのHTMLテンプレートは以下の要素を含む必要があります：

- `#dialogContainer`: ダイアログのコンテナ（`<dialog>` 要素）
- `.dialog-prompt`: プロンプトテキストを表示する要素
- `.dialog-buttons`: ボタンを配置するコンテナ

デフォルトテンプレートが使用されますが、カスタムテンプレートも指定できます。

## choiceタグとの違い

| 特徴 | dialog | choice |
|------|--------|--------|
| 表示方法 | モーダルダイアログ | ゲーム画面内 |
| 一時停止 | ゲームを完全に停止 | シナリオの進行を停止 |
| 用途 | 確認、警告、重要な選択 | ストーリーの分岐 |
| 見た目 | ポップアップウィンドウ | インゲームUI |

```html
<!-- ストーリー分岐 -->
<choice prompt="どちらに行きますか？">
  <item label="右の道">...</item>
  <item label="左の道">...</item>
</choice>

<!-- 重要な確認 -->
<dialog>
  <prompt><text>本当に実行しますか？</text></prompt>
  <actions>
    <action id="yes" label="はい">...</action>
    <action id="no" label="いいえ">...</action>
  </actions>
</dialog>
```

## スタイルのカスタマイズ

ダイアログの見た目は、CSSでカスタマイズできます：

```css
/* デフォルトのダイアログスタイル */
#dialogContainer {
  border: 2px solid #333;
  border-radius: 10px;
  padding: 20px;
  background: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}

.dialog-prompt {
  font-size: 18px;
  margin-bottom: 20px;
  color: #333;
}

.dialog-button {
  padding: 10px 20px;
  margin: 5px;
  border: none;
  border-radius: 5px;
  background: #007bff;
  color: white;
  cursor: pointer;
}

.dialog-button:hover {
  background: #0056b3;
}
```

## トラブルシューティング

### ダイアログが表示されない

- `prompt` と `actions` 要素が正しく定義されているか確認
- ブラウザのコンソールでエラーを確認

### ボタンが動作しない

- 各アクションに `id` と `label` 属性が設定されているか確認
- アクション内のタグが正しいか確認

### ダイアログが閉じない

- アクションの処理が完了すると自動的に閉じます
- エラーが発生していないかブラウザのコンソールを確認

## 関連タグ

- [choice](/tags/choice) - ストーリー分岐の選択肢
- [text](/tags/text) - テキスト表示
- [call](/tags/call) - 関数呼び出し

## 次のステップ

- [選択肢](/api/choice) - 選択肢機能の概要
- [制御構文](/api/control) - 制御構文の概要
