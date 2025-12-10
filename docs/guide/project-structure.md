# プロジェクト構造

webTaleKitプロジェクトのディレクトリ構造と各ファイルの役割を説明します。

## 基本的なディレクトリ構造

```
your-game-title/
├── src/
│   ├── scene/          # シナリオファイル
│   ├── screen/         # UIファイル
│   └── resource/       # ゲームリソース
├── dist/               # ビルド出力
├── tsconfig.json       # TypeScript設定
├── webpack.config.js   # Webpack設定
└── package.json        # プロジェクト設定
```

## src/ ディレクトリ

ゲームのソースコードとリソースが格納されるメインディレクトリです。

### scene/ - シナリオファイル

```
src/scene/
├── title.scene         # タイトル画面
├── chapter1.scene      # 第1章
├── chapter2.scene      # 第2章
└── ending.scene        # エンディング
```

`.scene` ファイルは、WebTaleScript（WTS）とJavaScriptを組み合わせたシナリオファイルです。

**シナリオファイルの構造:**

```html
<scenario>
  <!-- ゲームの進行をWTSで記述 -->
</scenario>

<script>
  // JavaScriptで設定や変数を定義
</script>
```

### screen/ - UIファイル

```
src/screen/
├── title.html          # タイトル画面のHTML
├── title.css           # タイトル画面のCSS
├── title.js            # タイトル画面のJS
├── default.html        # デフォルトUI
├── default.css
└── default.js
```

各シーンに対応するUIファイル（HTML/CSS/JavaScript）を配置します。

**UIファイルの役割:**

- **HTML**: メッセージウインドウ、ボタンなどのレイアウト
- **CSS**: UIのスタイル定義
- **JavaScript**: UI要素の動作制御

### resource/ - ゲームリソース

```
src/resource/
├── background/         # 背景画像
│   ├── title_bg.png
│   ├── room.jpg
│   └── school.jpg
├── chara/             # キャラクター画像
│   ├── protagonist.png
│   ├── friend.png
│   └── heroine.png
├── bgm/               # BGM
│   ├── title_theme.mp3
│   └── main_theme.mp3
├── se/                # 効果音
│   ├── click.mp3
│   └── door.mp3
├── voice/             # ボイス
│   └── greeting.mp3
└── config.js          # リソース定義
```

#### config.js - リソース定義ファイル

リソースを名前で参照できるように定義します：

```javascript
// src/resource/config.js
export const audio = [
  { title: '/audio/mainTheme.mp3' },
  { battle: '/audio/battle.mp3' }
]

export const chara = [
  {
    name: 'protagonist',
    path: '/chara/protagonist.png',
    faces: {
      normal: '/chara/protagonist_normal.png',
      smile: '/chara/protagonist_smile.png',
      sad: '/chara/protagonist_sad.png'
    }
  }
]

export const background = [
  { room: '/background/room.jpg' },
  { school: '/background/school.jpg' }
]

export const se = [
  { click: '/se/click.mp3' },
  { door: '/se/door.mp3' }
]

export const voice = [
  { greeting: '/voice/greeting.mp3' }
]
```

## 設定ファイル

### engineConfig.json

エンジン全体の設定ファイル：

```json
{
  "title": "ゲームタイトル",
  "resolution": {
    "width": 1280,
    "height": 720
  },
  "defaultTemplate": "default",
  "autoSave": true
}
```

### package.json

プロジェクトの依存関係とスクリプトを定義：

```json
{
  "name": "your-game-title",
  "version": "1.0.0",
  "scripts": {
    "play": "webpack serve",
    "build": "webpack --mode production",
    "dev": "webpack serve --mode development"
  },
  "dependencies": {
    "webtalekit-alpha": "^0.2.13"
  }
}
```

### tsconfig.json

TypeScriptの設定ファイル：

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "strict": true
  },
  "include": ["src/**/*"]
}
```

### webpack.config.js

ビルド設定ファイル：

```javascript
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html'
    })
  ]
};
```

## dist/ ディレクトリ

ビルド後の出力ファイルが格納されます：

```
dist/
├── index.html          # エントリーポイント
├── bundle.js           # バンドルされたJavaScript
├── assets/             # リソース
└── scenes/             # 変換されたシナリオ
```

## ファイルの命名規則

### シナリオファイル

- 拡張子: `.scene`
- 命名: `シーン名.scene` (例: `title.scene`, `chapter1.scene`)

### UIファイル

- HTML/CSS/JSは同じベース名を使用
- 例: `title.html`, `title.css`, `title.js`

### リソースファイル

| リソースタイプ | ディレクトリ | 推奨形式 |
|--------------|------------|---------|
| 背景画像 | `background/` | JPG, PNG |
| キャラクター | `chara/` | PNG（透過推奨） |
| BGM | `bgm/` | MP3, OGG |
| 効果音 | `se/` | MP3, OGG |
| ボイス | `voice/` | MP3, OGG |

## ビルドプロセス

ビルド時に以下の処理が実行されます：

1. `.scene` ファイルがJavaScriptに変換
2. HTML/CSS/JSがインライン化・最適化
3. リソースが `dist/` にコピー
4. すべてがバンドルされて `dist/` に出力

```bash
npm run build
```

## 開発ワークフロー

1. **シナリオの作成**: `src/scene/` に `.scene` ファイルを追加
2. **リソースの配置**: `src/resource/` に画像・音声を配置
3. **リソースの定義**: `config.js` にリソースを登録
4. **UIのカスタマイズ**: `src/screen/` でHTMLとCSSを編集
5. **ビルド**: `npm run build` または `npm run dev`

## 次のステップ

- [シーンファイル](/guide/scene-files) - シナリオファイルの詳細
- [UIの作成](/guide/ui-creation) - カスタムUIの作成方法
- [チュートリアル](/guide/tutorial-images) - 実際に作ってみる
