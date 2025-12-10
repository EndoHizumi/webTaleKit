# クイックスタート

このガイドでは、webTaleKitを使って最初のビジュアルノベルゲームを作成する方法を説明します。

## 前提条件

webTaleKitを使用するには、以下がインストールされている必要があります：

### Node.js 20以降

**インストール確認:**

```bash
node --version
```

v20以上のバージョンが表示されればOKです。

::: details Node.jsのインストール方法

**Windows:**
[Node.js公式サイト](https://nodejs.org/)からインストーラーをダウンロードしてください。

**Mac:**
```bash
brew install node
```

**Linux:**
```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

:::

### Git

**インストール確認:**

```bash
git --version
```

バージョンが表示されればOKです。

::: details Gitのインストール方法

**Windows:**
[Git公式サイト](https://git-scm.com/)からインストーラーをダウンロードしてください。

**Mac:**
```bash
brew install git
```

**Linux:**
```bash
sudo apt-get update
sudo apt-get install git
```

:::

## プロジェクトの作成

以下のコマンドを実行して、新しいゲームプロジェクトを作成します：

```bash
npm create tale-game your-game-title
cd your-game-title
npm run play
```

これでデモゲームが起動します。ブラウザが自動的に開き、ゲームが表示されれば環境構築は完了です。

## 動作確認用デモ

既存のデモゲームで動作確認したい場合は、以下を実行してください：

```bash
git clone https://github.com/EndoHizumi/testGame.git
cd testGame
npm install
npm run play
```

## オンラインデモ

ブラウザで今すぐ試すこともできます：

[https://test-game-chi.vercel.app/](https://test-game-chi.vercel.app/)

Firefox、Chrome、Edgeなど、お好きなブラウザでアクセスしてください。

## プロジェクト構造

作成されたプロジェクトには以下のような構造があります：

```
your-game-title/
├── src/
│   ├── scene/          # シナリオファイル（.scene）
│   ├── screen/         # UIファイル（HTML/CSS/JS）
│   └── resource/       # ゲームリソース
│       ├── background/ # 背景画像
│       ├── chara/      # キャラクター画像
│       ├── bgm/        # BGM
│       ├── se/         # 効果音
│       ├── voice/      # ボイス
│       └── config.js   # リソース定義
├── tsconfig.json
└── webpack.config.js
```

## 次のステップ

- [プロジェクト構造](/guide/project-structure) - ディレクトリ構成の詳細
- [画像の差し替え](/guide/tutorial-images) - 簡単なカスタマイズから始める
- [シナリオの編集](/guide/tutorial-scenario) - ゲームの内容を変更する
