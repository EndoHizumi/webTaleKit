# WebTaleKit仕様

- index
  - 概要
  - 技術要件
  - ターゲットプラットホーム
    - 概要
      - 技術要件
      - ターゲットプラットフォーム
      - 動作フロー
      - 画面構成
    - エンジンのメソッド
    - 管理変数･オブジェクト構造
    - その他仕様
    - 独自マークアップ言語について
    - ディレクトリ構造
    - ビルドについて

## 概要

HTML/CSS/JavaScriptで作成できるビジュアルノベルエンジンです。
画面をHTMLとCSSで作成して出来、物語の進行をHTMLに似たスクリプトタグとJavaScriptで制御します。

## 技術用件

Node.js 16以降

## ターゲットプラットホーム

- Firefox
- Chrome
- Windows
- macOS
- SteamOS

## 動作フロー

1. ブラウザからアクセスする。
2. index.htmlをリクエストする。
3. index.htmlに記述されているindex.jsを実行する。
4. (エンジン)canvasタグ/divのタグのサイズの設定を行う。
5. (エンジン)config.jsをリクエストして読み込み、対応する配列に追加
6. (エンジン)jsファイルをダイナミックインポートからの実行して、UI画面の描画･ゲームの進行を行う。（初期表示は、title.js）
7. routeタグがあった場合は、6からフローを実行する。
8. ファイルの末尾に到達した場合、エンジンの実行を終了する。

## 画面構成

３つのレイヤーで構成されている。

- UIレイヤー
- キャラレイヤー
- 背景レイヤー
  - キャラと背景は合成するので実質2つ

### UIレイヤー

HTMLとCSS・javaScriptで構成されているだたのHTML
メッセージボックスやゲーム操作部分がここで表示される。

### キャラレイヤー

キャラクターを表示するcanvasタグ
表示したキャラの座標などはdisplayedImageオブジェクト配列で保持する。
キャラを移動させるときは、保持された座標を変更してから、再描画する。

### 背景レイヤー

背景画像を表示するレイヤー

## エンジンのメソッド

WebTaleKit
core <- engineの大本
drawer <- canvasに描画する奴（画像の移動やフィルターの処理も）
soundObject <- 音楽再生・操作するやつ
imageObject <- 画像保持・フィルター操作するやつ

## 独自マークアップ言語について

WebTaleScript(以下:WTS)という名称で、HTMLに似たマークアップ言語で、ゲームの進行を制御できる。
WTSは、対応するJSに変換される。
タグ名と要素はエンジンのインターフェースで定義しているメソッド名と引数名と同じ名前である。
シーンファイルとは、WebTaleScript(WTS)とJavaScriptの両方でゲームの進行制御を記述するためのファイルである。
scenarioとLogicの二つのセクションがあり、ゲーム進行制御をscenarioセクションはWTSで、Logicセクションは、scenarioセクションで使う処理や背景のデータ、変数の定義をJavaScriptで記述する。

```vue
%% WebTaleScriptのサンプル %%
<scenario>
 <choice prompt="プロローグをスキップしますか？">
   <item label="はい">
     <jump index="1"></jump>
   </item>
   <item label="いいえ"></item>
 </choice>
  夏の陽気が残る９月の初旬
  <
 name="燈火">「先輩、別れてください」</
>
  <
 name="智樹"> 「え、ごめん。今･･･なんて」</
>
  聞き取れなかったわけじゃない。
  言われた意味が分からなかった。
  理解したくなかった。
  <
 name="燈火">「最初から好きじゃなかったんです･･･」</
>
  <
 name="智樹"> 「「そんな･･･そんなこと･･･」</
>
   視界が揺らぎ、自分が立っているのか分からなくなる。
   額からはイヤな汗が首筋を伝わり落ちる。
   これは夢だとそうも思いたかった。
   目が覚めて、授業中に寝てしまって、みんなで昼飯をとって、そんないつも通りに生活があるんだと。
   だが、そんな都合のいい現実は有るはずがないのだ。
   そして、すれ違い瞬間、最後の言葉が俺の耳に届いた。
   <
 name="燈火">「さよなら･･･」</
>
</scenario>
<logic>
const sceneConfig = {
  background: '屋上.jpg'
}
</logic>
```

```Javascript
// このようなJSに変換される
 export let index = 0
 export const sceneConfig ={
  background: '屋上.jpg'
 };
export const scenario = [
　{type: "choice", prompt: "プロローグをスキップしますか？", items: [{onSelect:   [{type: "jump", index: 1}],label: "はい"},{onSelect: undefined,label: "いいえ"}]},
　{type: text, msg: "夏の陽気が残る９月の初旬"},
　{type: 
, name:"燈火",msg: "先輩、別れてください"},
　{type: 
, name: "智樹", msg: "え、ごめん。今･･･なんて"},
　{type: text, msg: "聞き取れなかったわけじゃない。/n言われた意味が分からなかった。/n理解したくなかった。"}
 ]
 // 他のロジック
export const skipScenario = () => {
 index = 1
}
```

### テキスト表示

HTMLのメッセージウィンドウへ入力された条件でテキストを表示する。

- text(msg: string,speed:number,wait: number､clear: boolean)

  - overview: メッセージウインドウに入力された条件でテキストを表示する
  - msg: 表示するテキスト
  - speed: テキストの表示間隔。初期値は、0.5s
  - wait: クリック待ちをするかどうか。初期値は、true。改行(<br/>)ごとにクリック待ちをする。
  - clear: 前のメッセージをけすかどうか。初期値は、true。
  - 対応するWTS:`<text speed='' wait=''>msg</text>`
  - 特に指定がない場合は、このタグを使わなくても表示される。

- newPage()

  - overview: メッセージをクリアする

-

say(name:string, pattern: string, voice: string, ...text)

- overview: textのwrapperでキャラクターのセリフの時に使うことを想定している。キャラが表示されていないときは、表示する
- name: リソース定義オブジェクトのcharaのnameの値、定義していない値を指定可能。
- pattern: リソース定義オブジェクトのcharaのfacesの値、未定義のキャラの場合、無視される。
- voice: 再生するボイスファイルを指定できる。
- 対応するWTS:`<say name='' pattern='' voice=''>msg</say>`

### 画像の表示

- show(path: string, name?: string, x: number, y: number, look: ['right' | 'left'] ､ entryTime: number, entryWait: boolean, content: {フィルターやアニメーションの指定} ) -> Object

  - overview: キャラクター立ち絵・背景・その他画像を表示する。子要素でフィルターが指定されている場合は、フィルターを設定してから描画する。アニメーションの指定がある場合は、描画時かその直後にアニメーションを再生する。
  - path: 表示する画像のファイルパスを指定する。
  - name: リソース定義オブジェクトのnameの値
    - ファイル名の前にスラッシュで区切ってリソース種類を指定する(記述例: chara/hogehoge)
    - 表示済み画像を変更する場合、同じnameを指定する。
  - pos: 画像を表示する座標を指定する。
  - look: 表示画像の向きを指定できる。デフォルト値は、"Left"
  - entry: 表示を開始するまでの時間と表示待ちの設定を指定できる。WTSの場合は、本属性を指定した時点で、表示待ちが有効になり、値が遅延時間と認識される。値の指定がない場合は、１秒に設定される。
  - 対応するWTS: `<show path="" name="" left="" top="" look="left" wait="0.5">フィルターやアニメーションの指定WSTタグをここに書ける</show>`
    - 表示した画像のname（ないときは、path）をキーにして、戻り値をリソース管理オブジェクトに追加する。

- hide(name?:string)

  - overview: キャラクター立ち絵・背景・その他画像を画面から削除する。
  - name: リソース定義オブジェクトのnameの値
    - ファイル名の前にスラッシュで区切ってリソース種類を指定する(記述例: chara/hogehoge)
  - 対応するWTS: `<hide name="" >フィルターやアニメーションの指定WSTタグをここに書ける</show>`

- scenarioManager.setBackground(path: string, name?: string0) -> Obejct
  - overview: 指定した画像を背景レイヤーをに表示する。背景用のshowのエイリアス。
  - path: 表示する画像のファイルパスを指定する。
  - name: リソース定義オブジェクトのbackgroundのnameの値
- scenarioManager.getBackground(path: string, name?: string) -> Object
  - overview: 背景レイヤーの情報を返す。
  - path: 表示する画像のファイルパスを指定する。
  - name: リソース定義オブジェクトのbackgroundのnameの値

### 画像の操作

表示時に返されたオブジェクトのメソッドの形で実装する。

- 位置変更(coreでやる)
- アニメーション
- 透明度の設定
- セピア化
- モノクロ化
- ぼかし
- フィルターの解除(表示・非表示時の特殊効果）

### 音楽の操作

音楽の操作・SEの再生・ボイスの再生
最初に定義する。

- 定義した音声のname（ないときは、path）をキーにして、戻り値をリソース管理オブジェクトに追加する。

- sound(path: string, name?: string, wait: boolean) -> Object
  戻ってきたObjectで定義するメソッド

  - play
  - stop
  - pause
  - setVolume
  - getVolume

- 対応するWTS: `<sound path="" name="" wait="" volume="" play stop pause>`
- bgm
  - bgm用のsoundタグのエイリアス。soundとの違いは、nameの指定の際に、名称だけでいい。（bgm/と先頭にスラッシュにつけなくていい）
- voice
  - voice用のsoundタグのエイリアス。soundとの違いは、nameの指定の際に、名称だけでいい。（voice/と先頭にスラッシュにつけなくていい）
- se
  - se用のsoundタグのエイリアス。soundとの違いは、nameの指定の際に、名称だけでいい。（se/と先頭にスラッシュにつけなくていい）

### 画面演出

画面を揺らす

- quake(sec: double, speed: double)
  - overview: 画面を上下に移動させる
  - sec: 画面を揺らす時間
  - speed: 揺らす速度を設定する
  - 対応するWTS: `quake(sec="" speed="")`

画面を暗転させる

- mask(layer: string, color: string)
  - overview: 画面を指定色で塗りつぶす。
  - layer: 塗りつぶすレイヤーを指定する：（'background' | 'chara' | 'ui' | 'all'）
  - color:色の指定をRGB・カラー名で指定する。
  - off: 暗転を解除する
  - 対応するWTS: `<mask layer="" color="" off>`

### その他

- メソッド呼び出し
  - call(name: string)
    - overview: logicセクションで宣言したメソッドを呼び出す。
    - name: 呼び出すメソッドの名称を記載する
    - restriction: 変数や関数の定義は実行後に消えるため、ほかのタグから呼び出せない。

- リソース定義
  - define(type: ['audio'|'se'|'voice'|'chara'|'picture'|'background'|'key'], name: string, path: string)
    - リソースのパスを任意の名前と紐づけたオブジェクトを対応するオブジェクトに追加する。
    - Type：登録オブジェクトの種類を指定できる
      - 'audio'： 主に、BGMなどの音楽ファイル
      - 'se'：SE向けの音声ファイル
      - 'voice'：キャラクターボイス
      - 'chara'：キャラクターの立ち絵
      - 'picture'：その他の画像
      - 'background'：背景画像
      - 'key'：ユーザー任意のユーザーショートカット
    - name: オブジェクト内での識別名
    - path: 対応するリソースのパス（キーボードショートカットの場合はショートカットの組み合わせ）

- 画面の表示・移動 -次のシーンに移動
  - 対応するWTS: `<route to="">`

- 選択肢の表示・定義
  - choice(id:number, prompt: String, Items:{onSelect: function, label: String, src?: String})
  - 対応するWTS:

    ```html
    <choice id="" prompt="">
      <item src="">label</item>
    </choice>
    ```

- 進行制御
  - jump(index: number)
    - 対応するWTS: `<jump index=''/>`
  - if (condition: string, then: webTaleScript, else: webTaleScript)
  - 対応するWTS

       ```html
         <if condition="">
            <then>
                <!-- trueの場合、処理したいWTSをここに書く -->
            </then>
            <else>
                <!-- falseの場合、処理したいWTSをここに書く -->
            </else>
        </if>
        ```

- セーブ＆ロード機能
  - 進行状況をJSONに保存またはJSONから読込
  - saveDataList.jsonを起動時に読み込む

- save(id: number, data:Object) // 指定したIDにあるパスへJSONを保存する。`
- load(id: number) // 指定したIDにあるパスからJSONを読む込むする。

- セーブデータ形式  
  - 以下を基本として、開発者の指定したオブジェクトを保存する。

  ```javascript
  [
    {
      displayedImage // 表示しているキャラと座標・表情
      scnario: 'title', // どのシーンなのか。
      index: '0'　// テキスト行
      // これ以降ゲーム開発者の指定したデータ
    }
  ]
  ```

### 管理変数･オブジェクト構造

- Scenarioオブジェクト
  - WebTaleScriptを変換したJSONのこと
  - WebTaleKitはこのオブジェクトを読み取り・書き込むことでゲームを実行する。
  - 以下のScenarioオブジェクトの形式例であり、typeでタグの種類を示し、contentの中に文字列などデータが格納されている。
  　オプションは、`オプション名：値`の形式で、Scenarioオブジェクトにプロパティとして追加される。

   ```json
  {
      type: 'tagName',
      content: {
      },
  }
  ```

- リソース定義オブジェクト
  - リソースのパスと名前を紐づけることができる。
  - 名前で呼び出すリソースを指定できるようになる。
  - ルートディレクトリに下記のように記述したconfig.jsを置くと、そこを読み込んで、設定してくれる。
  - importで外部JSに分けたコンフィグを読み込める。

  ```javascript
  // リソース種別: {リソース名:リソースのパス}
  // 変数名はリソース定義メソッド(define)のTypeを参照すること。
  export const audio = [{ title: '/audio/mainTheme.wav' }]
  export const se = [{ corsor: '/audio/cousor.wav' }]
  ```

- バックログ管理一次配列

  ```javascript
  ['テキスト1', 'テキスト2', 'テキスト3']
  ```

- ゲーム設定ファイルまたはオブジェクト
  - オブジェクト（sceneConfig)の場合は、そのシーン全体。ファイル（コンフィグファイル）の場合は、ゲーム全体で設定が適応される。
  - 解像度や文字の大きさ、共通で使うメッセージウインドウや選択肢ボタンの画像パスなどを設定できる。
  - 設定の優先度は、WTS > sceneConfig > configファイル

- リソース管理オブジェクト
  - WTSで音楽再生・画像表示をした際に、メソッドから返される管理用オブジェクトが格納される。hideなどの既存のリソースを操作するメソッドで操作対象を特定するのに使う。

  ```javascript
  // プロパティ名は、pathないしname。値は戻り値のオブジェクトが入っている。
  　{
  　'/audio/mainTheme.wav': {},
  　'cursor': {}
  　}
  ```

リソース操作用オブジェクト

- soundやshowの戻り値として返されるオブジェクト。これを使って、画像にフィルターをかけたり、音楽の操作を行う。

  ```javascript
  {
      id: string, //リソースに振られる一意な値
      objejct: obejct //音声リソースの場合は、audioContext。画像の場合は、表示している子レイヤーの番号が入っている。
  }

  ```

## ディレクトリ構造

├─src
│ ├─scene
│ | └─title.scene
| ├─ screen
| | ├─title
│ | ├─title.html
│ | ├─title.css
│ | └─title.js
│ ├─resource
│ ├─audio
│ ├─background
│ ├─chara
│ ├─key
│ ├─se
│ ├─config.js
│ └─voice

## ビルドについて

バンドルされる前に、sceneファイルをjsに変換し、screen以下のhtml・css・jsはインライン化する
