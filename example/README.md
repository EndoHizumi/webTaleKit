# example

このプロジェクトは、WebTaleKitを使用して作成されたサンプルゲームです。

## 起動方法

1. \`npm install\` を実行して、必要な依存関係をインストールします。
2. \`npm run dev\` を実行して、開発サーバーを起動します。
3. ブラウザで \`<http://localhost:8080\`> にアクセスしてゲームを開始します。

ブラウザ版パーサーのリアルタイム実行デモは \`http://localhost:8080/runtime-parser.html\` で確認できます。

## スクリプト

- \`npm run play\`: 開発モードでゲームを起動し、ブラウザを開きます。
- \`npm run dev\`: 開発モードでゲームを起動します。
- \`npm run build\`: プロダクションビルドを作成します。

## リアルタイム実行デモ

- \`runtime-parser.html\` は、ブラウザ版 \`domParserAdapter\` と \`parser/parser.js\` を使って WTS をその場でパースし、右側のプレビューで即時実行する確認ページです。
- Starter サンプルでは複数 scene を同時に読み込み、\`route\` での遷移までブラウザ内で確認できます。
- \`script type="text/typescript"\` の scene も、その場で JavaScript に変換して実行できます。

## プロジェクト構造

- \`src/scene/\`: シナリオファイルが格納されています。
- \`src/screen/\`: 画面のHTMLテンプレートが格納されています。
- \`src/resource/\`: ゲームで使用するリソース（画像、音声など）が格納されています。

## カスタマイズ

1. \`src/scene/title.scene\` を編集して、シナリオを変更できます。
2. \`src/screen/title.html\` を編集して、画面のレイアウトやスタイルを変更できます。
3. \`src/resource/\` に独自の画像や音声ファイルを追加して、ゲームをカスタマイズできます。

詳細な使用方法については、WebTaleKitのGitHubレポジトリのドキュメントを参照してください。
