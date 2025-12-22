# route タグ

別のシーンに移動します。

## 基本的な使い方

```html
<route to="chapter2" />
```

## 属性

| 属性 | 型 | 必須 | 説明 |
|------|------|------|------|
| to | string | ✓ | 移動先のシーンファイル名（拡張子なし） |
| scene | string | × | （非推奨）`to`と同じ。後方互換性のためサポート |
| if | string | × | 条件式 |

## 動作

`route`タグが実行されると、以下の処理が自動的に行われます：

1. 現在のBGMを停止
2. 画面上の画像をクリア
3. 現在のシーンの`cleanUp()`関数を実行（定義されている場合）
4. 新しいシーンファイルを読み込み
5. 新しいシーンのUIテンプレートと背景を読み込み
6. 新しいシーンのBGMを再生

## 使用例

### 基本的なシーン移動

```html
<text>第1章が終了しました。</text>
<route to="chapter2" />
```

### 選択肢からのシーン移動

```html
<choice prompt="どこに行きますか？">
  <item label="学校">
    <route to="school" />
  </item>
  <item label="公園">
    <route to="park" />
  </item>
  <item label="自宅">
    <route to="home" />
  </item>
</choice>
```

### 条件付きシーン移動

```html
<route to="good_ending" if="score >= 100" />
<route to="normal_ending" if="score >= 50 && score < 100" />
<route to="bad_ending" if="score < 50" />
```

## 実用例

### タイトル画面から本編へ

**title.scene:**

```html
<scenario>
  <text>タイトル画面</text>

  <choice prompt="ゲームを始めますか？">
    <item label="新しくはじめる">
      <call name="newGame" />
      <route to="prologue" />
    </item>
    <item label="続きから">
      <call name="loadGame" />
      <route to="chapter1" />
    </item>
    <item label="設定">
      <route to="settings" />
    </item>
  </choice>
</scenario>

<script>
const sceneConfig = {
  name: 'タイトル',
  background: 'title_bg.jpg',
  bgm: 'title_theme.mp3'
}

function newGame() {
  // 新規ゲームの初期化処理
  localStorage.removeItem('saveData');
}

function loadGame() {
  // セーブデータの読み込み処理
  const saveData = localStorage.getItem('saveData');
  if (saveData) {
    // データを復元
  }
}
</script>
```

### チャプター間の移動

```html
<text>第1章「出会い」が終了しました。</text>
<route to="chapter2" />
```

### ルート分岐

```html
<choice prompt="誰のルートに進みますか？">
  <item label="キャラA">
    <call name="setRoute" args="['A']" />
    <route to="route_a_chapter1" />
  </item>
  <item label="キャラB">
    <call name="setRoute" args="['B']" />
    <route to="route_b_chapter1" />
  </item>
  <item label="共通ルート">
    <route to="common_chapter1" />
  </item>
</choice>
```

### エンディング分岐

```html
<scenario>
  <text>物語は終わりを迎えようとしている。</text>

  <call name="calculateEnding" />

  <route to="true_ending" if="ending === 'true'" />
  <route to="good_ending" if="ending === 'good'" />
  <route to="normal_ending" if="ending === 'normal'" />
  <route to="bad_ending" if="ending === 'bad'" />
</scenario>

<script>
let ending = 'normal';

function calculateEnding() {
  if (score >= 100 && flag_all_events) {
    ending = 'true';
  } else if (score >= 80) {
    ending = 'good';
  } else if (score >= 50) {
    ending = 'normal';
  } else {
    ending = 'bad';
  }
}
</script>
```

### ゲームオーバーとリトライ

```html
<text>ゲームオーバー</text>

<choice prompt="どうしますか？">
  <item label="リトライ">
    <route to="battle" />
  </item>
  <item label="タイトルに戻る">
    <route to="title" />
  </item>
</choice>
```

## シーンファイルの構造

移動先のシーンファイルは以下の形式で作成します：

**chapter2.scene:**

```html
<scenario>
  <text>第2章が始まります。</text>
  <say name="主人公">「新しい一日が始まる」</say>
</scenario>

<script>
const sceneConfig = {
  name: '第2章',
  background: 'morning_room.jpg',
  bgm: 'morning_theme.mp3',
  template: 'default'  // 省略可
}

// シーン開始時に実行（省略可）
function init() {
  console.log('第2章開始');
}

// シーン終了時に実行（省略可）
function cleanUp() {
  console.log('第2章終了');
}
</script>
```

### sceneConfigの必須項目

```javascript
const sceneConfig = {
  name: 'シーン名',      // シーンの識別名
  background: 'bg.jpg',  // 背景画像（任意）
  bgm: 'music.mp3',      // BGM（任意）
  template: 'default'    // UIテンプレート（省略時は'default'）
}
```

### ライフサイクル関数（任意）

```javascript
// シーン開始時に1回だけ実行
function init() {
  // 初期化処理
  score = 0;
  flags = {};
}

// シーン終了時に1回だけ実行
function cleanUp() {
  // クリーンアップ処理
  saveProgress();
}
```

## ファイル配置

シーンファイルは以下のディレクトリに配置します：

```
src/
├── scene/
│   ├── title.scene      # タイトル画面
│   ├── prologue.scene   # プロローグ
│   ├── chapter1.scene   # 第1章
│   ├── chapter2.scene   # 第2章
│   └── ending.scene     # エンディング
```

コンパイル後は`.js`ファイルとして以下に配置されます：

```
example/src/js/
├── title.js
├── prologue.js
├── chapter1.js
├── chapter2.js
└── ending.js
```

## 注意事項

### シーンファイル名

`route`タグの`to`属性には**拡張子なし**のファイル名を指定します：

```html
<!-- ✅ 正しい -->
<route to="chapter2" />

<!-- ❌ 間違い -->
<route to="chapter2.scene" />
<route to="chapter2.js" />
```

### 非推奨の属性

`scene`属性は後方互換性のためサポートされていますが、新しいコードでは`to`属性を使用してください：

```html
<!-- ✅ 推奨 -->
<route to="chapter2" />

<!-- ⚠️ 非推奨（動作はしますが、toを使用してください） -->
<route scene="chapter2" />
```

### BGMの自動切り替え

シーン移動時、BGMは自動的に切り替わります。`sceneConfig`の`bgm`に指定した音楽が再生されます。

BGMを再生したくない場合は、`bgm`を空文字列にします：

```javascript
const sceneConfig = {
  name: 'サイレントシーン',
  background: 'dark.jpg',
  bgm: ''  // BGMなし
}
```

### 画面のクリア

シーン移動時、以下が自動的にクリアされます：

- 表示中の全ての画像
- メッセージウィンドウの内容
- 再生中のBGM

新しいシーンで必要なキャラクターや画像は、新しいシーン内で再度`show`タグで表示してください。

### 変数のスコープ

各シーンの`<script>`セクションで定義した変数は、そのシーン内でのみ有効です。

シーン間でデータを共有したい場合は、以下の方法があります：

1. **グローバル変数を使用**（推奨しない）
2. **LocalStorageを使用**（推奨）
3. **専用のストアモジュールを作成**

```javascript
// LocalStorageの例
function saveProgress() {
  localStorage.setItem('gameProgress', JSON.stringify({
    chapter: 2,
    score: score,
    flags: flags
  }));
}

function loadProgress() {
  const data = localStorage.getItem('gameProgress');
  if (data) {
    const progress = JSON.parse(data);
    // データを復元
  }
}
```

## jumpタグとの違い

| タグ | 用途 | スコープ | BGM | 画像 |
|------|------|----------|-----|------|
| route | 別のシーンファイルに移動 | シーンが切り替わる | 自動切り替え | クリアされる |
| jump | 同じシーン内の別の行に移動 | 同じシーン内 | 変わらない | 残る |

```html
<!-- 同じシーン内を移動 -->
<jump index="10" />

<!-- 別のシーンに移動 -->
<route to="chapter2" />
```

## 関連タグ

- [jump](/tags/jump) - 同じシーン内の移動
- [call](/tags/call) - 関数呼び出し
- [choice](/tags/choice) - 選択肢

## 次のステップ

- [制御構文](/api/control) - 制御構文の概要
- [jumpタグ](/tags/jump) - シーン内の移動
- [シーンファイル](/guide/scene-files) - シーンファイルの書き方
