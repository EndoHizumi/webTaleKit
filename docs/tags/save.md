# save タグ

ゲームの進行状況をセーブします。

## 基本的な使い方

```html
<save slot="1" name="チャプター1クリア" />
```

## 属性

| 属性 | 型 | 必須 | デフォルト | 説明 |
|------|------|------|----------|------|
| slot | string\|number | × | 'auto' | セーブスロットの識別子 |
| name | string | × | `セーブ{slot}` | セーブデータの名前 |
| message | boolean | × | true | セーブ完了メッセージを表示するかどうか |
| if | string | × | - | 条件式（trueの場合のみ実行） |

## セーブされる内容

セーブデータには以下の情報が含まれます：

- **slot**: セーブスロット番号
- **name**: セーブデータの名前
- **timestamp**: セーブ日時（ISO 8601形式）
- **scenarioManager**: シナリオの進行状況
  - progress: 進行度
  - sceneName: 現在のシーン名
  - currentIndex: 現在の行番号
  - history: 会話履歴
- **sceneConfig**: シーン設定
- **displayedImages**: 表示中の画像
- **backgroundImage**: 背景画像
- **usedSounds**: 使用中の音声
- **bgmSrc**: 再生中のBGM

## 使用例

### 基本的なセーブ

```html
<save slot="1" name="プロローグ終了" />
```

デフォルトでは「ゲームをセーブしました: プロローグ終了」というメッセージが表示されます。

### オートセーブ

```html
<save slot="auto" name="オートセーブ" message="false" />
```

`message="false"` を指定すると、セーブ完了メッセージを表示しません。

### 複数のセーブスロット

```html
<choice prompt="どのスロットにセーブしますか？">
  <item label="スロット1">
    <save slot="1" name="セーブデータ1" />
  </item>
  <item label="スロット2">
    <save slot="2" name="セーブデータ2" />
  </item>
  <item label="スロット3">
    <save slot="3" name="セーブデータ3" />
  </item>
</choice>
```

### チャプター自動セーブ

```html
<text>第2章が始まります...</text>
<save slot="chapter2" name="第2章開始" message="false" />
<route to="chapter2" />
```

### 条件付きセーブ

```html
<save slot="quicksave" name="クイックセーブ" if="autoSaveEnabled" />
```

## 実用例

### セーブメニュー

```html
<scenario>
  <text>セーブメニュー</text>

  <choice prompt="セーブしますか？">
    <item label="スロット1にセーブ">
      <save slot="1" name="{{getCurrentChapterName()}}" />
      <text>スロット1にセーブしました。</text>
    </item>
    <item label="スロット2にセーブ">
      <save slot="2" name="{{getCurrentChapterName()}}" />
      <text>スロット2にセーブしました。</text>
    </item>
    <item label="スロット3にセーブ">
      <save slot="3" name="{{getCurrentChapterName()}}" />
      <text>スロット3にセーブしました。</text>
    </item>
    <item label="戻る">
      <text>メニューに戻ります。</text>
    </item>
  </choice>
</scenario>

<script>
function getCurrentChapterName() {
  // 現在のチャプター名を取得する関数
  return `第${currentChapter}章`;
}

let currentChapter = 1;
</script>
```

### オートセーブシステム

```html
<scenario>
  <!-- 重要なポイントで自動セーブ -->
  <text>チャプター1をクリアしました！</text>
  <call name="autoSave" />

  <route to="chapter2" />
</scenario>

<script>
function autoSave() {
  // オートセーブを実行（メッセージ非表示）
  // この処理はJavaScriptから直接呼び出すため、
  // タグとしては使用しない
  console.log('Auto-save completed');
}
</script>
```

または、シナリオ内で：

```html
<save slot="auto" name="チャプター1クリア" message="false" />
```

### セーブ前の確認ダイアログ

```html
<dialog>
  <prompt>
    <text>スロット1にセーブしますか？</text>
    <text if="saveExists">既存のデータは上書きされます。</text>
  </prompt>
  <actions>
    <action id="save" label="セーブする">
      <save slot="1" name="{{saveDataName}}" />
      <text>セーブしました。</text>
    </action>
    <action id="cancel" label="キャンセル">
      <text>セーブをキャンセルしました。</text>
    </action>
  </actions>
</dialog>
```

## セーブデータの保存先

セーブデータは `localStorage` に保存されます：

- キー: `save_{slot}`
- 例: `save_1`, `save_2`, `save_auto`

## セーブデータの構造

```javascript
{
  slot: "1",
  name: "プロローグ終了",
  timestamp: "2024-01-15T10:30:00.000Z",
  scenarioManager: {
    progress: { /* 進行状況 */ },
    sceneName: "prologue",
    currentIndex: 42,
    history: [/* 会話履歴 */]
  },
  sceneConfig: {
    name: "プロローグ",
    background: "room.jpg",
    bgm: "main_theme.mp3"
  },
  displayedImages: {
    /* 表示中の画像情報 */
  },
  backgroundImage: "backgrounds/room.jpg",
  usedSounds: {
    /* 使用中の音声情報 */
  },
  bgmSrc: "bgm/main_theme.mp3"
}
```

## セーブ時の注意事項

### 保存されない情報

以下の情報はセーブデータに含まれません：

- `<script>` セクションで定義したローカル変数（シーン固有の変数）
- 実行中の非同期処理
- DOM要素の状態（カスタムUIの状態など）

### 変数の永続化

ゲーム全体で共有したい変数は、グローバルスコープまたは専用のストレージに保存する必要があります：

```javascript
// グローバル変数（推奨しない）
window.gameState = {
  playerName: '太郎',
  score: 100
};

// localStorageに保存（推奨）
function saveGameState() {
  localStorage.setItem('gameState', JSON.stringify({
    playerName: playerName,
    score: score
  }));
}

function loadGameState() {
  const data = localStorage.getItem('gameState');
  if (data) {
    const state = JSON.parse(data);
    playerName = state.playerName;
    score = state.score;
  }
}
```

## トラブルシューティング

### セーブができない

- ブラウザのlocalStorageが有効になっているか確認
- プライベートモード/シークレットモードでは、localStorageが制限される場合があります

### セーブデータが消える

- ブラウザのキャッシュをクリアするとlocalStorageも削除されます
- 重要なセーブデータはサーバーにバックアップすることを推奨

### セーブ容量の制限

- localStorageの容量制限（通常5～10MB）に注意
- 大量の画像データなどは保存しない

## 関連タグ

- [load](/tags/load) - セーブデータの読み込み
- [call](/tags/call) - 関数呼び出し
- [dialog](/tags/dialog) - 確認ダイアログ

## 次のステップ

- [loadタグ](/tags/load) - セーブデータの読み込み方法
- [制御構文](/api/control) - 制御構文の概要
