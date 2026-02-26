# 用語集

webTaleKitで使用される用語と概念の一覧です。

## システム構成

### Core（コア）
**Core Class**

webTaleKitエンジンの中核となるクラス。ゲーム全体の制御、シナリオ実行、各種ハンドラーの管理を行います。全てのタグ処理は最終的にCoreクラスのメソッドで実行されます。

### Drawer（描画エンジン）
**Drawer Class**

Canvas要素への描画処理を担当するクラス。キャラクターや背景画像の表示、テキスト描画、フェード効果、画像移動などの視覚的な演出を管理します。

### ScenarioManager（シナリオ管理）
**ScenarioManager Class**

シナリオの進行状況、履歴管理、インデックス制御を担当するクラス。jumpタグによる分岐制御や、プレイヤーの選択結果の記録などを行います。

### ResourceManager（リソース管理）
**ResourceManager Class**

ゲーム内で使用される画像、音声、その他のアセットファイルの読み込み、キャッシュ、管理を行うクラス。config.jsからリソース定義を読み込み、名前でアクセスできるようにします。

### キャンバスレイヤー
**Canvas Layer**

webTaleKitの画面表示は3つのレイヤーで構成されます：UIレイヤー（HTML/CSS）、キャラレイヤー（Canvas）、背景レイヤー（Canvas）。キャラと背景は合成されるため実質2レイヤー構成となります。

## スクリプト・言語

### WebTaleScript（WTS）
**WebTaleScript**

webTaleKit独自のマークアップ言語。HTMLに似た構文でゲームの進行を記述できます。各タグはエンジンのメソッドと対応しており、最終的にJavaScriptに変換されて実行されます。

```html
<scenario>
  <say name="キャラクター名">「セリフ」</say>
  <choice prompt="どうしますか？">
    <item label="はい"><jump index="5" /></item>
    <item label="いいえ"><text>物語を続けます。</text></item>
  </choice>
</scenario>
```

### シーンファイル
**Scene File (.scene)**

WebTaleScript（WTS）とJavaScriptでゲームの進行を記述するファイル。`scenario` セクションにはWTSで進行制御を、`script` セクションにはJavaScriptで変数定義や関数を記述します。

```html
<scene>
  <scenario>
    <!-- WTSによるゲーム進行 -->
    <text>ここにシナリオを記述します。</text>
  </scenario>

  <script>
    export const sceneConfig = {
      name: 'scene1',
      background: './src/resource/background/room.jpg'
    }
  </script>
</scene>
```

### Scenarioオブジェクト
**Scenario Object**

WebTaleScriptを変換したJSONオブジェクト。webTaleKitエンジンはこのオブジェクトを読み取り・実行してゲームを進行させます。各要素は `type` と `content` プロパティを持ちます。

```javascript
{
  type: 'say',
  name: 'キャラクター名',
  msg: 'セリフの内容'
}
```

### ifグローバル属性
**if Global Attribute**

すべてのWebTaleScriptタグで使用できるグローバル属性。JavaScript式を条件として指定し、条件が `true` の場合のみそのタグが実行されます。動的なゲーム進行制御に使用されます。

```html
<text if="hasKey">鍵を持っている。</text>
<text if="!hasKey">鍵を持っていない。</text>
```

### sceneConfig
**Scene Configuration**

各シーンの設定を定義するJavaScriptオブジェクト。シーン名、背景画像、BGM、使用するテンプレートファイルなどを指定します。シーンファイルの `script` セクションでexportします。

```javascript
export const sceneConfig = {
  name: 'prologue',
  background: './src/resource/background/school.jpg',
  bgm: './src/resource/bgm/theme.mp3',
  template: './src/screen/default.html'
}
```

## リソース管理

### リソース定義オブジェクト
**Resource Configuration Object**

ゲーム内で使用する画像、音声ファイルのパスと名前を紐づけるオブジェクト。`config.js` ファイルで定義し、名前でリソースを呼び出せるようになります。

```javascript
// src/resource/config.js
export const chara = [
  { name: 'hero', path: '/chara/protagonist.png' }
]
export const bgm = [
  { name: 'title', path: '/bgm/title_theme.mp3' }
]
```

### ImageObject
**Image Object**

画像リソースを管理するクラス。画像の読み込み、フィルター効果（セピア、モノクロ、ぼかし）、透明度設定、左右反転などの操作を提供します。

### SoundObject
**Sound Object**

音声リソースを管理するクラス。BGM、効果音、ボイスの再生・停止・一時停止、音量調整などの機能を提供します。Web Audio APIを使用して実装されています。

### displayedImages
**Displayed Images Object**

現在画面に表示されている画像の管理オブジェクト。各画像の座標、サイズ、表示状態、フィルター設定などを保持し、`hide` や `moveto` タグでの操作対象の特定に使用されます。

## UI・表示

### テンプレート
**Template**

ゲーム画面のレイアウトを定義するHTMLファイル。メッセージウィンドウ、キャラクター名表示、選択肢ボタンなどのUI要素を含みます。シーンごとに異なるテンプレートを使用可能です。

### UIレイヤー
**UI Layer**

HTML、CSS、JavaScriptで構成されるユーザーインターフェース層。メッセージボックス、選択肢ボタン、システムメニューなどが表示されます。Canvas要素の上に重ねて表示されます。

### メッセージウィンドウ
**Message Window**

ゲーム内のテキストやキャラクターの台詞を表示するUI要素。通常は画面下部に配置され、背景が半透明になっています。クリックやキー入力で次のテキストに進みます。

### バックログ
**Backlog**

プレイヤーが過去に読んだテキストや選択した内容を記録する機能。一次配列として管理され、ゲーム履歴の確認やセーブデータの一部として使用されます。

## 音響

### BGM
**Background Music**

ゲーム中に流れる背景音楽。通常はループ再生され、シーン切り替え時に自動的に変更されます。`sound` タグの `mode="bgm"` で制御するか、`sceneConfig` で指定します。

### ボイス
**Voice**

キャラクターの台詞に同期して再生される音声ファイル。`say` タグの `voice` 属性で指定し、テキスト表示と同時に再生されます。キャラクターの感情表現を豊かにします。

### 効果音（SE）
**Sound Effect**

ゲーム中の演出で使用される短い音声ファイル。ドアの開閉音、足音、環境音などを再生してゲームの臨場感を高めます。通常は一度だけ再生されます。

## 開発・ビルド

### ビルドシステム
**Build System**

webTaleKitプロジェクトを本番環境向けにコンパイル・最適化するシステム。sceneファイルのJavaScript変換、screen以下のHTML/CSS/JSのインライン化、バンドル処理を行います。

### ディレクトリ構造
**Directory Structure**

webTaleKitプロジェクトの標準的なフォルダ構成。`src/scene`（シナリオ）、`src/screen`（テンプレート）、`src/resource`（素材）などに分けて整理されます。

```
your-game/
├── src/
│   ├── scene/       # シナリオファイル (.scene)
│   ├── screen/      # UIテンプレート (HTML/CSS/JS)
│   └── resource/    # ゲームアセット
│       ├── background/
│       ├── chara/
│       ├── bgm/
│       ├── se/
│       ├── voice/
│       └── config.js
└── webpack.config.js
```

### セーブシステム
**Save System**

ゲームの進行状況をJSONファイルとして保存・読み込みする機能。現在のシーン、進行インデックス、表示中の画像、開発者定義の変数などが保存されます。
