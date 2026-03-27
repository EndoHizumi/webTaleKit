# WebTaleKit × Vue.js サンプルゲーム

WebTaleKit のイベント駆動アーキテクチャを活かし、UI 層を **Vue.js** で実装したサンプルゲームです。

## ゲーム概要

**電脳の夢** — 深夜の研究所で AI「イヴ」と出会う短編ビジュアルノベル。
2 つの選択肢でエンディングが分岐します。

## アーキテクチャ

WebTaleKit の Core はゲームロジックのみを担当し、UI の実装を知りません。
`EventBus` を介してイベントを発行し、Vue コンポーネントがそれを受け取って描画します。

```text
WebTaleKit Core (ゲームロジック)
  │
  │ EventBus.emit('text:show')
  │ EventBus.emit('choice:show')
  │ EventBus.emit('screen:load')
  │ EventBus.emit('input:bind')
  ↓
useWebTaleKit.js (コンポーザブル — EventBus → Vue reactive state ブリッジ)
  │
  ├─ MessageWindow.vue  (text:show / text:clear)
  ├─ ChoicePanel.vue    (choice:show)
  └─ WaitCursor.vue     (クリック待ちカーソル)
```

`new Core({ customUI: true })` を渡すことで、デフォルトの DOM ハンドラを無効化し、
すべての UI イベントを Vue 側で制御します。

## ディレクトリ構成

```text
example-vue/
├── src/
│   ├── scene/            # シナリオソースファイル (.scene)
│   │   ├── title.scene
│   │   ├── chapter1.scene
│   │   ├── ending_a.scene
│   │   └── ending_b.scene
│   ├── js/               # wtc でコンパイルされた JS (自動生成)
│   ├── screen/
│   │   └── game.html     # Drawer 初期化用の最小テンプレート
│   ├── composables/
│   │   └── useWebTaleKit.js
│   ├── components/
│   │   ├── MessageWindow.vue
│   │   ├── ChoicePanel.vue
│   │   └── WaitCursor.vue
│   ├── App.vue
│   ├── index.js
│   └── template.html
├── engineConfig.json
├── webpack.config.js
└── package.json
```

## セットアップ

```bash
cd example-vue
npm install
npm run dev   # → http://localhost:8081
```

`npm run dev` は `.scene` ファイルのコンパイルと webpack dev server の起動を自動で行います。

## スクリプト

| コマンド | 説明 |
| ------- | ---- |
| `npm run compile` | `src/scene/*.scene` → `src/js/*.js` に変換 |
| `npm run dev` | compile 後に webpack dev server を起動 (port 8081) |
| `npm run build` | compile 後に本番ビルドを出力 (`dist/`) |

## シナリオの編集

1. `src/scene/` 内の `.scene` ファイルを編集
2. `npm run compile` でコンパイル
3. webpack dev server が自動リロード

`.scene` ファイルの書き方は [WebTaleKit ドキュメント](../docs/) または `example/src/scene/` 内のサンプルを参照してください。
