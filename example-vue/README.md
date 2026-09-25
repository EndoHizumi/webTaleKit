# WebTaleKit × Vue.js サンプルゲーム

WebTaleKit のイベント駆動アーキテクチャを活かし、UI 層を **Vue.js** で実装したサンプルゲームです。

## ゲーム概要

タイトル画面から 3 つのデモを選べます。

- **ストーリーデモ** — 「電脳の夢」: 深夜の研究所で AI「イヴ」と出会う短編ビジュアルノベル。選択肢によって 2 つのエンディングに分岐します。
- **ダイアログデモ** — `dialog` タグ(`dialog:show` イベント)を `DialogPanel.vue` で表示します。
- **セーブ・ロードデモ** — `save` / `load` タグを試せます。

## アーキテクチャ

WebTaleKit の Core はゲームロジックのみを担当し、UI の実装を知りません。
`EventBus` を介してイベントを発行し、Vue コンポーネントがそれを受け取って描画します。

```text
WebTaleKit Core (ゲームロジック)
  │
  │ EventBus.emit('screen:load')   … Drawer のキャンバス初期化
  │ EventBus.emit('text:clear')
  │ EventBus.emit('text:show')
  │ EventBus.emit('choice:show')
  │ EventBus.emit('dialog:show')
  │ EventBus.emit('input:bind')    … 進行・スキップ用コールバックの受け渡し
  ↓
useWebTaleKit.js (コンポーザブル — EventBus → Vue reactive state ブリッジ)
  │
  ├─ MessageWindow.vue  (text:show / text:clear)
  ├─ ChoicePanel.vue    (choice:show)
  ├─ DialogPanel.vue    (dialog:show)
  ├─ WaitCursor.vue     (クリック待ちカーソル)
  │
  └─ onEvent コールバック
       ↓
     useEventBusMonitor.js (受け取ったイベントを記録するデバッグ用コンポーザブル)
       ├─ EventBusMonitor.vue    (イベントの流れとログ)
       └─ VueStateInspector.vue  (各コンポーネントに渡している状態)
```

`new Core({ customUI: true })` を渡すことで、デフォルトの DOM ハンドラを無効化し、
すべての UI イベントを Vue 側で制御します。
クリック・Enter・Ctrl の入力は `App.vue` が `#gameContainer` で受け取り、
`input:bind` で受け取ったコールバックを通して Core に伝えます。

## デバッグ用パネル

EventBus で Core と UI がどうつながっているかを目で確認するためのパネルです。
どちらも `useWebTaleKit` の `onEvent` コールバック経由で情報を受け取るので、EventBus を直接購読しません。

### EventBusMonitor

画面左上に、`Core → EventBus → Vue UI` のフロー図と直近 6 件のイベントログを表示します。

- イベントが届くたびに、Core → EventBus → Vue UI の順にノードが光ります
- ログにはイベント名と、セリフの冒頭や選択肢の件数などの要約が並びます
- ヘッダーをクリックすると折りたたみます。開き直すとログはクリアされます

### VueStateInspector

画面右上に、Vue DevTools 風のコンポーネントツリーを表示します。
`MessageWindow`・`ChoicePanel`・`DialogPanel`・`WaitCursor`・`EventBusMonitor` に渡している状態を一覧でき、
値が変わった行は一瞬ハイライトされます。`content` などの配列はクリックで開閉できます。

## ディレクトリ構成

```text
example-vue/
├── src/
│   ├── scene/            # シナリオソースファイル (.scene)
│   │   ├── title.scene
│   │   ├── chapter1.scene
│   │   ├── ending_a.scene
│   │   ├── ending_b.scene
│   │   ├── dialog_demo.scene     # dialog タグのデモ
│   │   └── save_load_demo.scene  # save / load タグのデモ
│   ├── js/               # wtc でコンパイルされた JS (自動生成)
│   ├── screen/
│   │   └── game.html     # Drawer 初期化用の最小テンプレート
│   ├── composables/
│   │   ├── useWebTaleKit.js       # EventBus → Vue reactive state ブリッジ
│   │   └── useEventBusMonitor.js  # デバッグ用: イベントの記録
│   ├── components/
│   │   ├── MessageWindow.vue
│   │   ├── ChoicePanel.vue
│   │   ├── DialogPanel.vue
│   │   ├── WaitCursor.vue
│   │   ├── EventBusMonitor.vue    # デバッグ用パネル
│   │   └── VueStateInspector.vue  # デバッグ用パネル
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
