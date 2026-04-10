# WebTaleKit プロジェクト作成マニュアル

## 前提条件

- Node.js 20以降がインストールされていること
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

2. シーンファイルには、`<scenario>`セクションと`<script>`セクションがあります。
   - `<scenario>`セクションでは、WebTaleScript（WTS）を使ってゲームの進行を制御します。
   - `<script>`セクションでは、JavaScriptを使ってシーンで使う処理や背景のデータ、変数の定義を記述します。

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

4. `<script>`セクションで、シーンの設定や変数の定義を行います。
前のシーンの設定を引継ぐ場合は、その項目は入力を省略できます。

   例：

   ```html
   <script>
   const sceneConfig = {
     background: '屋上.jpg'
   }
   </script>
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

## シナリオ検証とサニタイズ

WebTaleKit では、シナリオ配列に対して検証とサニタイズを行う公開APIを利用できます。

- `validateScenarioObjects` は `valid`、`errors`、`warnings` に加えて `sanitizedScenario` を返します
- `sanitizedScenario` は非破壊で生成されるため、元のシナリオ配列は変更されません
- `reportScenarioValidation` を使うと、既存 logger に合わせた警告・エラー出力ができます
- `assertScenarioValidation` を使うと、エラーがある場合に呼び出し側で停止できます

この機能は公開APIであり、エンジン本体が自動で適用するわけではありません。ツール、エディタ、ビルド処理、サーバー側変換など、必要な場所で明示的に呼び出してください。

```ts
import {
  reportScenarioValidation,
  validateScenarioObjects,
} from '../src/utils/validateScenario'

const result = validateScenarioObjects(scenarioObjects, commandList)
await reportScenarioValidation(result, 'Manual validation')

if (result.valid) {
  const scenarioForRuntime = result.sanitizedScenario
}
```

以上がWebTaleKitを使ってビジュアルノベルゲームを作成するための基本的な流れです。
タグの詳細については、[WebTaleKit仕様](documents/spec.md)を参照してください。
