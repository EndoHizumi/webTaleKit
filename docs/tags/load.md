# load タグ

セーブしたゲームの進行状況を読み込みます。

## 基本的な使い方

```html
<load slot="1" />
```

## 属性

| 属性 | 型 | 必須 | デフォルト | 説明 |
|------|------|------|----------|------|
| slot | string\|number | × | 'auto' | ロードするセーブスロットの識別子 |
| message | boolean | × | true | ロード完了/失敗メッセージを表示するかどうか |
| if | string | × | - | 条件式（trueの場合のみ実行） |

## 動作

`load`タグは以下の処理を行います：

1. 指定されたスロットからセーブデータを取得
2. セーブデータが存在しない場合はエラーメッセージを表示
3. セーブデータが存在する場合：
   - シナリオの進行状況を復元
   - 表示中の画像を復元
   - 背景画像を復元
   - BGMを復元
   - 音声を復元
   - シーンを再読み込み

## 使用例

### 基本的なロード

```html
<load slot="1" />
```

デフォルトでは、ロードが成功すると自動的にゲームが再開されます。失敗した場合は「セーブデータが見つかりません: スロット1」というメッセージが表示されます。

### メッセージを表示しないロード

```html
<load slot="auto" message="false" />
```

### 複数のセーブスロットから選択

```html
<choice prompt="どのセーブデータをロードしますか？">
  <item label="スロット1">
    <load slot="1" />
  </item>
  <item label="スロット2">
    <load slot="2" />
  </item>
  <item label="スロット3">
    <load slot="3" />
  </item>
  <item label="戻る">
    <text>タイトルに戻ります。</text>
    <route to="title" />
  </item>
</choice>
```

### 条件付きロード

```html
<load slot="auto" if="autoLoadEnabled" />
```

## 実用例

### ロードメニュー

```html
<scenario>
  <text>ロードメニュー</text>

  <choice prompt="ロードするデータを選択してください">
    <item label="スロット1" if="hasSaveData(1)">
      <load slot="1" />
    </item>
    <item label="スロット2" if="hasSaveData(2)">
      <load slot="2" />
    </item>
    <item label="スロット3" if="hasSaveData(3)">
      <load slot="3" />
    </item>
    <item label="戻る">
      <route to="title" />
    </item>
  </choice>
</scenario>

<script>
function hasSaveData(slot) {
  // localStorage からセーブデータの存在を確認
  return localStorage.getItem(`save_${slot}`) !== null;
}
</script>
```

### セーブデータ情報の表示

```html
<scenario>
  <text>セーブデータ一覧</text>

  <call name="loadSaveList" />

  <text if="saveData1">スロット1: {{saveData1.name}} ({{saveData1.date}})</text>
  <text if="saveData2">スロット2: {{saveData2.name}} ({{saveData2.date}})</text>
  <text if="saveData3">スロット3: {{saveData3.name}} ({{saveData3.date}})</text>

  <choice prompt="どのデータをロードしますか？">
    <item label="スロット1" if="saveData1">
      <load slot="1" />
    </item>
    <item label="スロット2" if="saveData2">
      <load slot="2" />
    </item>
    <item label="スロット3" if="saveData3">
      <load slot="3" />
    </item>
    <item label="戻る">
      <route to="title" />
    </item>
  </choice>
</scenario>

<script>
let saveData1 = null;
let saveData2 = null;
let saveData3 = null;

function loadSaveList() {
  for (let i = 1; i <= 3; i++) {
    const data = localStorage.getItem(`save_${i}`);
    if (data) {
      const parsed = JSON.parse(data);
      const saveInfo = {
        name: parsed.name,
        date: new Date(parsed.timestamp).toLocaleString('ja-JP')
      };

      if (i === 1) saveData1 = saveInfo;
      if (i === 2) saveData2 = saveInfo;
      if (i === 3) saveData3 = saveInfo;
    }
  }
}
</script>
```

### ロード前の確認ダイアログ

```html
<dialog>
  <prompt>
    <text>スロット1のデータをロードしますか？</text>
    <text>{{saveData1.name}}</text>
    <text>保存日時: {{saveData1.date}}</text>
    <text>現在の進行状況は失われます。</text>
  </prompt>
  <actions>
    <action id="load" label="ロードする">
      <load slot="1" />
    </action>
    <action id="cancel" label="キャンセル">
      <text>ロードをキャンセルしました。</text>
    </action>
  </actions>
</dialog>
```

### タイトル画面での自動ロード

```html
<scenario>
  <text>タイトル画面</text>

  <choice prompt="ゲームを始めますか？">
    <item label="続きから" if="hasAutoSave">
      <load slot="auto" />
    </item>
    <item label="新しく始める">
      <route to="prologue" />
    </item>
  </choice>
</scenario>

<script>
const hasAutoSave = localStorage.getItem('save_auto') !== null;
</script>
```

## ロード時の処理

### 復元される内容

以下の情報がセーブデータから復元されます：

1. **シナリオの進行状況**
   - 現在のシーン
   - 現在の行番号
   - 会話履歴

2. **画面の状態**
   - 表示中のキャラクター画像（位置、サイズ、向きなど）
   - 背景画像

3. **音声の状態**
   - BGM（再生位置は復元されません）
   - 効果音の情報

4. **シーン設定**
   - シーン名
   - テンプレート情報

### 復元されない内容

以下の情報はセーブデータから復元されません：

- `<script>` セクションのローカル変数
- 実行中の非同期処理
- カスタムUIの状態
- ユーザー入力中のデータ

## エラー処理

### セーブデータが存在しない

セーブデータが見つからない場合、以下のメッセージが表示されます：

```
セーブデータが見つかりません: スロット{slot}
```

`message="false"` を指定すると、このメッセージは表示されません。

### ロードエラーのハンドリング

```html
<scenario>
  <call name="tryLoad" args="[1]" />

  <text if="loadSuccess">ロードに成功しました。</text>
  <text if="!loadSuccess">ロードに失敗しました。</text>
</scenario>

<script>
let loadSuccess = false;

function tryLoad(slot) {
  const data = localStorage.getItem(`save_${slot}`);
  loadSuccess = (data !== null);

  if (loadSuccess) {
    // ロード処理は別途 load タグで実行
  }
}
</script>
```

## データの互換性

### バージョンアップ時の注意

ゲームのアップデートでシナリオ構造が変更された場合、古いセーブデータが正しく動作しない可能性があります。

対策：

1. **バージョン情報の保存**

```javascript
// セーブ時
const saveData = {
  version: '1.0.0',
  // その他のデータ
};

// ロード時
const data = JSON.parse(localStorage.getItem('save_1'));
if (data.version !== currentVersion) {
  // バージョンが異なる場合の処理
  console.warn('Save data version mismatch');
}
```

2. **マイグレーション処理**

古いバージョンのセーブデータを新しい形式に変換する処理を実装します。

## トラブルシューティング

### ロードできない

- セーブデータが存在するか確認（ブラウザの開発者ツール → Application → Local Storage）
- ブラウザのlocalStorageが有効になっているか確認

### ロード後の表示がおかしい

- セーブ時とロード時でシーン構造が変わっていないか確認
- 画像ファイルのパスが正しいか確認

### 進行状況が正しく復元されない

- セーブ時のシナリオインデックスが正しく保存されているか確認
- シナリオの行番号が変更されていないか確認

## 関連タグ

- [save](/tags/save) - ゲームのセーブ
- [route](/tags/route) - シーンの移動
- [call](/tags/call) - 関数呼び出し

## 次のステップ

- [saveタグ](/tags/save) - ゲームのセーブ方法
- [制御構文](/api/control) - 制御構文の概要
