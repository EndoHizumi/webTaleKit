# webTaleKit

![wabTaleKitロゴ](s-plan1-5Light-s-1.jpg)

## 概要

TypeScript(JavaScript) ベースのビジュアルノベルゲームエンジンです。
UIをHTML・CSS・JavaScriptで柔軟に作成でき、シナリオをマークアップ言語とJavaScriptで制御できます。
自動スケーリング機能で、様々なウインドウで遊ぶことができます。
VS Codeの拡張機能を用いたGUIエディタやREST API呼び出しによる生成AI連携の追加を提供予定です。

## 動作確認

動作確認のデモゲームは、こちらのリポジトリのREADMEを元にセットアップすることでプレイできます。
https://github.com/EndoHizumi/testGame

## 現在の状況

webTaleKitは、現在アルファ版です。
開発進捗は、[@endo_hizumi](https://x.com/endo_hizumi) で行っております。
Hashtag: #webTalekit

## アルファ版(0.1.x)機能未実装

- Desktopアプリケーションへのビルド
- Android(iOS)向けのビルド
- オートモード
- スキップ
- 画面各種のボタン
- sayタグ
  - キャラが表示されていないときは、表示する
- セーブ＆ロード機能
- showタグ / hideタグ
  - 子要素でフィルター指定
  - 子要素でアニメーション指定
  - スラッシュで区切ってリソース種類を指定
- scenarioManager.setBackground
- scenarioManager.getBackground
- soundタグ
  - pause
  - setVolume
  - getVolume
  - bgmエイリアス
  - voiceエイリアス
  - seエイリアス
- quakeタグ（画面を揺らす）
- maskタグ（画面の暗転）
- リソース定義メソッド
- セーブファイル管理配列
- ゲーム設定ファイルの反映
- html・css・jsのインライン化・minify

## WebTaleKitチュートリアル

このチュートリアルでは、WebTaleKitを使ってビジュアルノベルゲームを作成する方法を学びます。

## 前提条件

- Node.js 16以降がインストールされていること
- HTML、CSS、JavaScriptの基本的な知識があること

## プロジェクトの作成

1. 新しいディレクトリを作成し、そこにWebTaleKitのディレクトリ構造を設定します。

```bash
├─src
│ ├─scene
│ | └─title.scene
| ├─ screen
│ | ├─title.html
│ | ├─title.css
│ | └─title.js
│ ├─resource
│ │ ├─audio
│ │ ├─background
│ │ ├─chara
│ │ ├─key
│ │ ├─se
│ │ ├─config.js
│ │ └─voice
├─tsconfig.json
├─webpack.config.js

```

## シーンの作成

1. `src/scene`ディレクトリに新しいシーンファイル（例：`title.scene`）を作成します。

2. シーンファイルには、`<scenario>`セクションと`<logic>`セクションがあります。
   - `<scenario>`セクションでは、WebTaleScript（WTS）を使ってゲームの進行を制御します。
   - `<logic>`セクションでは、JavaScriptを使ってシーンで使う処理や背景のデータ、変数の定義を記述します。

3. WTSを使って、テキストの表示、キャラクターの表示、選択肢の表示などを行います。
   例：

   ```html
   <scenario>
     <say name="燈火">「先輩、別れてください」</say>
     <say name="智樹">「え、ごめん。今･･･なんて」</say>
     <choice prompt="プロローグをスキップしますか？">
       <item label="はい">
         <jump index="1"></jump>
       </item>
       <item label="いいえ"></item>
     </choice>
   </scenario>
   ```

   - 利用できるWTSタグ
     - text（テキストの表示）
     - choice（選択肢の表示）
     - show（画像の表示）
     - hide（画像の日表示）
     - newpage（画面のクリア）
     - jump（シナリオの行移動）
     - sound（音楽の再生）
     - say（名前付きテキストの表示・ボイス再生）
     - if（処理分岐）
     - call（JSメソッドの呼び出し）
     - moveTo（画像の水平・平行移動）
     - route（シーンの移動）

4. `<logic>`セクションで、シーンの設定や変数の定義を行います。
前のシーンの設定を引継ぐ場合は、その項目は入力を省略できます。

   例：

   ```html
   <logic>
   const sceneConfig = {
     background: '屋上.jpg'
   }
   </logic>
   ```

   - 利用できる設定
     - template（シーンのUIのHTML）
     - name （シーンの名前）
     - background（シーンの背景）
     - bgm（シーンのBGM）

## UIの作成

1. `src/screen`ディレクトリにシーンごとのUIファイル（HTML、CSS、JavaScript）を作成します。

2. HTMLファイルでUIの構造を定義し、CSSファイルでスタイルを設定します。

3. JavaScriptファイルでUIの動作を制御します。

## ビルドとデプロイ

1. WebPackやViteを使ってプロジェクトをビルドします。

2. ビルド時に、シーンファイル（`.scene`）がJavaScriptに変換され、UIファイル（HTML、CSS、JavaScript）がインライン化されます。

3. ビルドされたファイルを`dist`ディレクトリに出力します。

4. `dist`ディレクトリの内容をWebサーバーにデプロイすることで、ゲームを公開できます。

以上がWebTaleKitを使ってビジュアルノベルゲームを作成するための基本的な流れです。
タグの詳細については、[WebTaleKit仕様](documents/spec.md)を参照してください。

## アイコン素材

- https://www.silhouette-illust.com/

## カラーコード

青: #3178C6 (TypeScript BLue)
緑: #02a889 (WebTaleKit Green)
白: #f8f8f8 (White Smoke)
