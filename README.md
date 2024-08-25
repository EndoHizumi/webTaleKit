# webTaleKit

![wabTaleKitロゴ](s-plan1-5Light-s-1.jpg)

## 目次

- 概要
- デモ
- 環境構築手順
- 動作確認手順
- Quick Start（デモゲームを弄ってみよう）
- できること
- できないこと
- フィードバックフォームのご案内

## 概要

TypeScript(JavaScript) ベースのビジュアルノベルゲームエンジンです。  
UIをHTML・CSS・JavaScriptで柔軟に作成でき、シナリオをマークアップ言語とJavaScriptで制御できます。  
自動スケーリング機能で、様々なウインドウで遊ぶことができます。  
VS Codeの拡張機能を用いたGUIエディタやREST API呼び出しによる生成AI連携の追加を提供予定です。  

## デモ

Firefoxでも、Chromeでも、Edgeでも、好きなブラウザを使いたまえ・・・！
<https://test-game-chi.vercel.app/>
![alt text](image.png)

## 環境構築手順

1. Node.js(20以降)が必要です。(nvm等お好みの方法がある場合は、そちらでも構いません)
   - Windowsの場合は、Node.js公式サイト (<https://nodejs.org/>) からインストールしてください。
   - Macの場合は、`brew install node` を実行してインストールしてください。
   - Linuxの場合は、以下のコマンドを実行して、インストールしてください。

    ```bash
        curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
        sudo apt-get install -y nodejs
    ```

2. 以下のコマンドを実行してください

    ``` bash
    npm create tale-game
    ```

プロジェクトに移動して、`npm run play`を実行して、デモゲームが起動すれば、構築は完了です。

## 動作確認手順

以下のコマンドを実行してください。

```bash
git clone https://github.com/EndoHizumi/testGame.git
npm install
npm run play
```

## Quick Start（デモゲームを弄ってみよう

### 画像を差し替える

- キャラを変える場合
  - src/resource/chara/guide.png に上書きしてください。
- 背景画像を変える
  - src/resource/background/title_bg.png　に上書きしてください。
- BGMを変える
  - src/resource/bgm/title_theme.mp3　に上書きしてください。

- 選択肢の画像を変える
  - src\resource\system\systemPicture\02_button\button.png　に上書きしてください。
- 選択肢(マウスオーバー時)の画像を変える
  - src\resource\system\systemPicture\02_button\button2.png　に上書きしてください。
- 選択肢(クリック時)の画像を変える
  - src\resource\system\systemPicture\02_button\button3.png　に上書きしてください。

- キャラを増やす
  - src\resource\character 以下に表示したい画像を置きます。
  - 登場させたい行数で、`<show src="表示したい画像のパス"></show>` を記述する
- セリフを増やす
  - セリフを表示させたい行数で、`<say name="キャラの名前">セリフをここに入れる</say>` を記述する
- 地の文を増やす
  - 地の文を表示させたい行数で、`<text>セリフをここに入れる</text>` を記述する

- 選択肢を増やす
  - 43行目のchoiceタグの中(44行-50行)で、以下のように記述すると、選択されたときに、地の文を表示する

   ``` html
    <item label='選択肢の文言'>
        <text>セリフをここに入れる</text>
    </item>
   ```

   実装例

   ```　html
          <choice prompt="ゲームを始めますか？">
            <item label="はい">
                <jump index="5" />
            </item>
            <item label="いいえ">
                <jump index="16" />
            </item>
            <item label='ちょっと待ってくれ'>
              <text>承知しました。</text>
               <jump index="1" />
            </item>
        </choice>
   ```

## 現在の状況

webTaleKitは、現在アルファ版です。  

開発進捗は、[@endo_hizumi](https://x.com/endo_hizumi) で行っております。
実装予定の項目については、こちらの[Trello](https://trello.com/b/qYNGh7MY)からも確認できます。

デモをプレイした感想・WebTaleKitを使って気になったことなど、意見・感想はこちらで受け付けています！
[https://forms.gle/uejQwvwAb99wcJht7](https://forms.gle/uejQwvwAb99wcJht7)

検索Hashtag: #webTalekit

## アルファ版(0.1.x-0.2.x)で、できること

### テキスト表示
- 地の文の表示
- キャラクターのセリフの表示・ボイスの再生
- 定義した変数の表示

### キャラクター・画像操作
- キャラクターの画像の表示・位置変更・アニメーション
- その他の画像の画像の表示・位置変更・アニメーション
- キャラクターの複数表示・位置変更・アニメーション
- CGの表示・変更
- 背景画像の表示・変更

### 画像処理
- 画像のフィルター操作
  - モノクロ化
  - セピア化
  - 透明度の変更
  - サイズの変更

### ユーザーインタラクション
- 選択肢の表示
- 選択肢の画像の変更
  - 通常時
  - マウスオーバー
  - 選択時
- Ctrlキーでの強制スキップ
- Enterキーで全文表示

### シナリオ制御
- 表示する文章・画像の条件分岐
- セリフのジャンプ
- シナリオ（シーン）の切り替え

### 音声
- BGMの再生・停止
- SEの再生・停止

### システム設定・UI
- HTMLで作った画面の表示
- 解像度の設定変更

### プログラミング連携
- JavaScript連携
  - メソッドの呼び出し
  - 式の実行
  - 変数の定義・値の変更
- REST API呼び出し（レスポンスの表示）

## アルファ版（0.1.x-0.2.x）の制限事項

### ビルド・プラットフォーム
- Desktopアプリケーションへのビルド
- Android(iOS)向けのビルド

### ユーザーインターフェース (UI)
- 画面各種のボタン
- セーブファイルの一覧の取得

### キャラクター操作
- sayタグの以下の機能
  - キャラが表示されていないときは、表示する

### セーブ＆ロード
- セーブ＆ロード機能

### 視覚効果
- showタグ / hideタグの以下の機能
  - 子要素でフィルター指定
  - 子要素でアニメーション指定
  - スラッシュで区切ってリソース種類を指定
- quakeタグ（画面を揺らす）
- maskタグ（画面の暗転）

### 音声
- soundタグの以下の機能
  - pause
  - setVolume
  - getVolume
  - bgmエイリアス
  - voiceエイリアス
  - seエイリアス

### リソース管理
- JavaScript側での背景画像の変更
- JavaScriptでのリソースの動的定義

### 設定・最適化
- ゲーム設定ファイルの反映
- 画面用HTMLのcss・jsのインライン化・minify化

## アイコン素材

- <https://www.silhouette-illust.com/>

## カラーコード

青: #3178C6 (TypeScript BLue)
緑: #02a889 (WebTaleKit Green)
白: #f8f8f8 (White Smoke)
