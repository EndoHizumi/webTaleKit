# APIリファレンス 概要

webTaleKitで使用できる機能の概要を説明します。

## WebTaleScript (WTS)

WebTaleScriptは、HTMLに似たマークアップ言語で、ゲームの進行を制御します。

### 基本構造

```html
<scenario>
  <!-- ここにゲームの進行を記述 -->
</scenario>

<script>
  // ここにJavaScriptで設定や変数を定義
</script>
```

## 主な機能カテゴリ

### テキスト表示

| タグ | 説明 |
|------|------|
| [text](/tags/text) | 地の文（ナレーション）を表示 |
| [say](/tags/say) | キャラクターのセリフを表示 |
| newpage | メッセージをクリアして新しいページを開始 |

### 画像操作

| タグ | 説明 |
|------|------|
| [show](/tags/show) | 画像やキャラクターを表示 |
| [hide](/tags/hide) | 画像やキャラクターを非表示 |
| [moveTo](/tags/moveto) | 画像を移動（アニメーション） |

### 音声

| タグ | 説明 |
|------|------|
| [sound](/tags/sound) | 音声を再生・停止 |
| bgm | BGM用のsoundエイリアス |
| se | 効果音用のsoundエイリアス |
| voice | ボイス用のsoundエイリアス |

### ユーザーインタラクション

| タグ | 説明 |
|------|------|
| [choice](/tags/choice) | 選択肢を表示 |

### 制御構文

| タグ | 説明 |
|------|------|
| [jump](/tags/jump) | 指定した行にジャンプ |
| [if](/tags/if) | 条件分岐 |
| [route](/tags/route) | 別のシーンに移動 |
| [call](/tags/call) | JavaScript関数を呼び出し |

## 属性

多くのタグで共通して使用できる属性があります。

### 条件実行

すべてのタグで `if` 属性を使用して、条件付きで実行できます：

```html
<text if="hasFlag">このテキストはhasFlagがtrueの時だけ表示されます</text>
```

### 繰り返し

`for` 属性を使用して、繰り返し処理ができます：

```html
<text for="i in items">{{i}}</text>
```

## シーン設定（sceneConfig）

`<script>` セクションで、シーン全体の設定を定義できます：

```javascript
const sceneConfig = {
  name: 'シーン名',           // シーンの名前
  background: 'bg.jpg',        // 背景画像
  bgm: 'theme.mp3',           // BGM
  template: 'custom.html'     // カスタムUIテンプレート
}
```

## リソース定義

リソースを名前で参照できるように、`config.js` で定義します：

```javascript
// src/resource/config.js
export const audio = [
  { title: '/audio/mainTheme.mp3' }
]

export const chara = [
  {
    name: 'protagonist',
    path: '/chara/protagonist.png',
    faces: {
      normal: '/chara/protagonist_normal.png',
      smile: '/chara/protagonist_smile.png'
    }
  }
]
```

## 変数の使用

### 変数の定義

```html
<script>
const playerName = "太郎";
let score = 0;

function addScore(points) {
  score += points;
}
</script>
```

### 変数の参照

Mustache記法（`{{変数名}}`）で変数を参照できます：

```html
<scenario>
  <text>{{playerName}}の現在のスコアは{{score}}点です。</text>
</scenario>
```

## JavaScript連携

### 関数の呼び出し

`<call>` タグでJavaScript関数を呼び出せます：

```html
<scenario>
  <call name="addScore" args="[10]" />
  <text>スコアが増えました！</text>
</scenario>

<script>
let score = 0;

function addScore(points) {
  score += points;
}
</script>
```

### コアAPIへのアクセス

`<script>` セクション内で、エンジンのAPIにアクセスできます：

```javascript
// 背景を直接変更
engine.scenarioManager.setBackground('new_bg.jpg');

// 変数を保存
engine.store.set('playerName', 'Taro');
```

## 次のステップ

各機能の詳細については、以下のページを参照してください：

- [テキスト表示](/api/text) - テキスト関連の機能
- [画像表示](/api/image) - 画像操作の機能
- [音声](/api/sound) - 音声再生の機能
- [選択肢](/api/choice) - 選択肢の実装
- [制御構文](/api/control) - 条件分岐とジャンプ
