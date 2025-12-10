# シーンファイル

シーンファイル（`.scene`）は、webTaleKitでゲームのシナリオを記述するためのファイルです。

## シーンファイルの構造

シーンファイルは2つのセクションで構成されます：

```html
<scenario>
  <!-- ゲームの進行をWebTaleScriptで記述 -->
</scenario>

<script>
  // JavaScriptで設定や変数を定義
</script>
```

### scenarioセクション

**WebTaleScript (WTS)** というマークアップ言語でゲームの進行を記述します。HTMLに似た構文で、直感的にシナリオを書けます。

### scriptセクション

JavaScriptでシーンの設定、変数の定義、関数の実装を行います。

## WebTaleScript (WTS)

### 基本的な書き方

#### 地の文（ナレーション）

```html
<scenario>
  <text>夏の陽気が残る9月の初旬</text>

  <!-- タグを省略することもできる -->
  突然、彼女は立ち止まった。
</scenario>
```

#### キャラクターのセリフ

```html
<say name="燈火">「先輩、別れてください」</say>
<say name="智樹">「え、ごめん。今･･･なんて」</say>
```

#### 選択肢

```html
<choice prompt="どうしますか？">
  <item label="話しかける">
    <text>彼女に話しかけた。</text>
  </item>
  <item label="様子を見る">
    <text>しばらく様子を見ることにした。</text>
  </item>
</choice>
```

### よく使うタグ

| タグ | 用途 | 例 |
|------|------|-----|
| text | 地の文の表示 | `<text>文章</text>` |
| say | セリフの表示 | `<say name="キャラ名">セリフ</say>` |
| choice | 選択肢の表示 | `<choice prompt="質問">...</choice>` |
| show | 画像の表示 | `<show path="image.png" />` |
| hide | 画像の非表示 | `<hide name="image" />` |
| sound | 音声の再生 | `<sound path="bgm.mp3" />` |
| jump | シナリオのジャンプ | `<jump index="10" />` |
| route | シーンの移動 | `<route to="chapter2" />` |

詳細は[APIリファレンス](/api/overview)を参照してください。

## scriptセクション

### シーン設定（sceneConfig）

シーン全体に適用される設定を定義します：

```javascript
const sceneConfig = {
  name: 'プロローグ',        // シーン名
  background: 'room.jpg',     // 背景画像
  bgm: 'main_theme.mp3',     // BGM
  template: 'default'         // UIテンプレート（省略可）
}
```

#### 設定項目

- **name**: シーンの名前（デバッグ時に便利）
- **background**: 背景画像のファイル名またはリソース名
- **bgm**: BGMのファイル名またはリソース名
- **template**: 使用するUIテンプレート（デフォルトは`default`）

### 変数の定義

```javascript
// グローバル変数
let playerName = "太郎";
let score = 0;
let hasKey = false;

// オブジェクト
const inventory = {
  apple: 3,
  sword: 1
};
```

### 関数の定義

```javascript
function addScore(points) {
  score += points;
  console.log(`スコア: ${score}`);
}

function checkInventory(item) {
  return inventory[item] > 0;
}
```

## 実用的な例

### 基本的なシーンファイル

```html
<scenario>
  <!-- 背景とBGMは自動的に適用される -->

  夏の陽気が残る9月の初旬

  <show path="chara/protagonist.png" name="主人公" left="300" top="100" />

  <say name="燈火">「先輩、別れてください」</say>
  <say name="智樹">「え、ごめん。今･･･なんて」</say>

  <choice prompt="どう答えますか？">
    <item label="もう一度聞き返す">
      <say name="智樹">「もう一度言ってくれる？」</say>
      <jump index="10" />
    </item>
    <item label="黙っている">
      <text>何も言えなかった。</text>
      <jump index="20" />
    </item>
  </choice>
</scenario>

<script>
const sceneConfig = {
  name: 'プロローグ',
  background: 'school_rooftop.jpg',
  bgm: 'sad_theme.mp3'
}
</script>
```

### 変数を使った分岐

```html
<scenario>
  <text if="firstTime">これは初めての訪問です。</text>
  <text if="!firstTime">またここに来ましたね。</text>

  <choice prompt="リンゴを取りますか？">
    <item label="はい">
      <call name="takeApple" />
      <text>リンゴを手に入れた。（所持数: {{appleCount}}）</text>
    </item>
    <item label="いいえ">
      <text>リンゴを取らなかった。</text>
    </item>
  </choice>
</scenario>

<script>
let firstTime = true;
let appleCount = 0;

function takeApple() {
  appleCount++;
  firstTime = false;
}
</script>
```

### 複数シーンの連携

**title.scene:**

```html
<scenario>
  <text>タイトル画面</text>

  <choice prompt="ゲームを始めますか？">
    <item label="新しくはじめる">
      <route to="chapter1" />
    </item>
    <item label="続きから">
      <call name="loadGame" />
      <route to="chapter1" />
    </item>
  </choice>
</scenario>

<script>
const sceneConfig = {
  name: 'タイトル',
  background: 'title_bg.jpg',
  bgm: 'title_theme.mp3'
}

function loadGame() {
  // セーブデータの読み込み処理
}
</script>
```

**chapter1.scene:**

```html
<scenario>
  <text>第1章が始まります。</text>

  <say name="主人公">「新しい一日が始まる」</say>

  <!-- シナリオが続く... -->
</scenario>

<script>
const sceneConfig = {
  name: '第1章',
  background: 'morning_room.jpg',
  bgm: 'morning_theme.mp3'
}
</script>
```

## シーンファイルのコンパイル

`.scene`ファイルは、ビルド時に自動的にJavaScriptに変換されます。

### CLIツールを使った手動変換

```bash
wtc src/scene/title.scene
```

これにより、`title.js`が生成されます。

## ベストプラクティス

### 1. シーンを適切に分割

長すぎるシーンは複数のファイルに分割しましょう：

```
scene/
├── title.scene           # タイトル画面
├── prologue.scene        # プロローグ
├── chapter1.scene        # 第1章
├── chapter2.scene        # 第2章
└── ending.scene          # エンディング
```

### 2. 意味のあるシーン名を付ける

```javascript
// Good
const sceneConfig = {
  name: '学校の屋上 - 別れの場面'
}

// Bad
const sceneConfig = {
  name: 'scene1'
}
```

### 3. コメントを活用

```html
<scenario>
  <!-- プロローグ開始 -->
  <text>夏の陽気が残る9月の初旬</text>

  <!-- [行10] キャラAルート分岐点 -->
  <choice prompt="どちらに行きますか？">
    ...
  </choice>
</scenario>
```

### 4. 変数名は分かりやすく

```javascript
// Good
let playerHealth = 100;
let hasMetFriend = false;

// Bad
let h = 100;
let f = false;
```

## トラブルシューティング

### シーンが読み込まれない

- ファイル名が正しいか確認
- `route` タグのシーン名が正確か確認
- コンソールでエラーメッセージを確認

### 変数が認識されない

- `<script>`セクションで変数が定義されているか確認
- Mustache記法を使用しているか確認（変数を <span v-pre>`{{変数名}}`</span> のように二重波括弧で囲む）

### 画像が表示されない

- `show`タグのパスが正しいか確認
- `config.js`にリソースが定義されているか確認

## 次のステップ

- [UIの作成](/guide/ui-creation) - カスタムUIの作成方法
- [APIリファレンス](/api/overview) - 全タグの詳細
- [チュートリアル](/guide/tutorial-scenario) - 実際にシナリオを書いてみる
