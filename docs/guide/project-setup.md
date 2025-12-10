# プロジェクト作成

webTaleKitを使った新しいゲームプロジェクトの詳細な作成方法を説明します。

## 前提条件

以下がインストールされている必要があります：

- **Node.js 20以降**
- **Git**

詳細なインストール方法は[クイックスタート](/guide/getting-started)を参照してください。

## プロジェクトの作成方法

### 方法1: npm create コマンド（推奨）

最も簡単な方法は、`npm create`コマンドを使用することです：

```bash
npm create tale-game your-game-title
cd your-game-title
npm install
```

このコマンドは、必要なディレクトリ構造とサンプルファイルを自動的に作成します。

### 方法2: 手動でプロジェクトを作成

より細かい制御が必要な場合は、手動でプロジェクトを作成できます。

#### 1. プロジェクトディレクトリの作成

```bash
mkdir my-visual-novel
cd my-visual-novel
npm init -y
```

#### 2. webTaleKitのインストール

```bash
npm install webtalekit-alpha
```

#### 3. ディレクトリ構造の作成

```bash
mkdir -p src/scene
mkdir -p src/screen
mkdir -p src/resource/background
mkdir -p src/resource/chara
mkdir -p src/resource/bgm
mkdir -p src/resource/se
mkdir -p src/resource/voice
mkdir -p src/resource/system
```

#### 4. 設定ファイルの作成

**package.json にスクリプトを追加:**

```json
{
  "scripts": {
    "play": "webpack serve",
    "build": "webpack --mode production"
  }
}
```

**webpack.config.js を作成:**

```javascript
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  devServer: {
    static: './dist',
    port: 3000
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html'
    })
  ],
  module: {
    rules: [
      {
        test: /\.scene$/,
        use: 'webtalekit-alpha/parser/loader'
      }
    ]
  }
};
```

**tsconfig.json を作成:**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true
  },
  "include": ["src/**/*"]
}
```

## 初期ファイルの作成

### エントリーポイント（index.html）

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Visual Novel</title>
</head>
<body>
  <div id="game-container"></div>
</body>
</html>
```

### メインスクリプト（src/index.js）

```javascript
import { Core } from 'webtalekit-alpha';

// ゲームエンジンの初期化
const game = new Core({
  container: '#game-container',
  width: 1280,
  height: 720
});

// 最初のシーンを読み込み
game.loadScene('title');
```

### 最初のシーンファイル（src/scene/title.scene）

```html
<scenario>
  <text>ゲームを始めます。</text>
  <say name="ガイド">「ようこそ！」</say>

  <choice prompt="ゲームを始めますか？">
    <item label="はい">
      <text>それでは始めましょう！</text>
    </item>
    <item label="いいえ">
      <text>また後でお会いしましょう。</text>
    </item>
  </choice>
</scenario>

<script>
const sceneConfig = {
  name: 'タイトル',
  background: 'title_bg.jpg',
  bgm: 'title_theme.mp3'
}
</script>
```

### リソース設定（src/resource/config.js）

```javascript
export const background = [
  { title_bg: '/resource/background/title_bg.jpg' }
];

export const chara = [
  {
    name: 'guide',
    path: '/resource/chara/guide.png'
  }
];

export const audio = [
  { title_theme: '/resource/bgm/title_theme.mp3' }
];
```

## プロジェクトの実行

### 開発サーバーの起動

```bash
npm run play
```

ブラウザが自動的に開き、`http://localhost:3000` でゲームが表示されます。

### 本番ビルド

```bash
npm run build
```

ビルドされたファイルは `dist/` ディレクトリに出力されます。

## プロジェクト構造の確認

作成されたプロジェクトは以下のような構造になります：

```
my-visual-novel/
├── src/
│   ├── scene/
│   │   └── title.scene
│   ├── screen/
│   │   ├── default.html
│   │   ├── default.css
│   │   └── default.js
│   ├── resource/
│   │   ├── background/
│   │   ├── chara/
│   │   ├── bgm/
│   │   ├── se/
│   │   ├── voice/
│   │   └── config.js
│   ├── index.html
│   └── index.js
├── dist/
├── package.json
├── tsconfig.json
└── webpack.config.js
```

## 次のステップ

- [プロジェクト構造](/guide/project-structure) - 各ディレクトリとファイルの詳細
- [シーンファイル](/guide/scene-files) - シナリオの書き方
- [UIの作成](/guide/ui-creation) - カスタムUIの作成方法

## トラブルシューティング

### ポートが既に使用されている

開発サーバーが起動しない場合は、別のポートを指定できます：

```bash
npm run play -- --port 3001
```

### Webpackのエラー

依存関係が正しくインストールされているか確認してください：

```bash
npm install webpack webpack-cli webpack-dev-server html-webpack-plugin --save-dev
```

### リソースが読み込まれない

リソースのパスが正しいか、`config.js` の設定を確認してください。
