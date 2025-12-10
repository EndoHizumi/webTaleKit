# webTaleKit ドキュメント

このディレクトリには、webTaleKitの公式ドキュメントが含まれています。

## ドキュメントの構成

```
docs/
├── .vitepress/         # VitePress設定
│   └── config.mjs      # サイト設定
├── index.md            # トップページ
├── guide/              # ガイド
│   ├── introduction.md
│   ├── getting-started.md
│   ├── project-structure.md
│   ├── tutorial-images.md
│   ├── tutorial-scenario.md
│   └── tutorial-choices.md
└── api/                # APIリファレンス
    ├── overview.md
    └── tags/           # タグリファレンス
        ├── text.md
        ├── say.md
        ├── show.md
        ├── choice.md
        └── jump.md
```

## 開発環境のセットアップ

### 依存関係のインストール

プロジェクトルートで以下を実行：

```bash
npm install
```

### ドキュメントサイトの起動

```bash
npm run docs:dev
```

ブラウザで [http://localhost:5173](http://localhost:5173) にアクセスすると、ドキュメントサイトが表示されます。

### ビルド

本番用にビルドする場合：

```bash
npm run docs:build
```

ビルドされたファイルは `docs/.vitepress/dist` に出力されます。

### プレビュー

ビルドしたサイトをプレビューする場合：

```bash
npm run docs:preview
```

## ドキュメントの編集

### 新しいページの追加

1. 該当するディレクトリ（`guide/` または `api/`）に Markdown ファイルを作成
2. `docs/.vitepress/config.mjs` のサイドバー設定に追加
3. 変更を保存すると、自動的にホットリロードされます

例：

```javascript
// config.mjs
sidebar: {
  '/guide/': [
    {
      text: 'はじめに',
      items: [
        { text: '新しいページ', link: '/guide/new-page' }
      ]
    }
  ]
}
```

### マークダウンの拡張機能

VitePressは以下の拡張機能をサポートしています：

#### カスタムコンテナ

```markdown
::: tip ヒント
便利な情報をここに記述
:::

::: warning 注意
注意事項をここに記述
:::

::: danger 警告
重要な警告をここに記述
:::
```

#### コードブロック

```markdown
```javascript
// コードをここに記述
const example = 'Hello';
\```
```

#### リンク

```markdown
<!-- 相対リンク -->
[テキスト](/guide/getting-started)

<!-- 外部リンク -->
[GitHub](https://github.com/EndoHizumi/webTaleKit)
```

## コントリビューション

ドキュメントの改善提案やバグ報告は、GitHubのIssuesでお願いします。

## ライセンス

MIT License
