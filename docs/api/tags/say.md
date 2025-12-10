# say タグ

キャラクターのセリフを表示します。名前付きの吹き出しでテキストを表示し、オプションでボイスを再生できます。

## 構文

```html
<say name="キャラクター名" pattern="表情" voice="ボイスファイル">
  セリフの内容
</say>
```

## 属性

| 属性 | 型 | 必須 | 説明 |
|------|-----|------|------|
| name | string | ○ | キャラクター名（UIとリソース定義で使用） |
| pattern | string | × | キャラクターの表情パターン |
| voice | string | × | 再生するボイスファイルのパス |
| if | string | × | 条件式（trueの場合のみ実行） |

## 基本的な使い方

### シンプルなセリフ

```html
<say name="燈火">「先輩、別れてください」</say>
<say name="智樹">「え、ごめん。今･･･なんて」</say>
```

### 複数行のセリフ

```html
<say name="燈火">
  「最初から好きじゃなかったんです」<br/>
  「ごめんなさい」
</say>
```

## 表情パターンの指定

リソース定義で複数の表情を定義している場合、`pattern` 属性で表情を切り替えられます：

```javascript
// config.js
export const chara = [
  {
    name: 'protagonist',
    path: '/chara/protagonist.png',
    faces: {
      normal: '/chara/protagonist_normal.png',
      smile: '/chara/protagonist_smile.png',
      sad: '/chara/protagonist_sad.png',
      angry: '/chara/protagonist_angry.png'
    }
  }
]
```

```html
<!-- 通常の表情 -->
<say name="protagonist" pattern="normal">「こんにちは」</say>

<!-- 笑顔 -->
<say name="protagonist" pattern="smile">「嬉しいな！」</say>

<!-- 悲しい表情 -->
<say name="protagonist" pattern="sad">「そんな...」</say>

<!-- 怒った表情 -->
<say name="protagonist" pattern="angry">「許さない！」</say>
```

## ボイスの再生

`voice` 属性でボイスファイルを指定すると、セリフと同時にボイスが再生されます：

```html
<say name="燈火" voice="voice/touka_01.mp3">
  「先輩、別れてください」
</say>
```

### リソース定義を使用

```javascript
// config.js
export const voice = [
  { touka_01: '/voice/touka_greeting.mp3' },
  { touka_02: '/voice/touka_farewell.mp3' }
]
```

```html
<say name="燈火" voice="touka_01">
  「こんにちは、先輩」
</say>
```

## キャラクターの自動表示

::: warning アルファ版の制限
現在のバージョンでは、キャラクターの自動表示機能は実装されていません。`<show>` タグを使って事前にキャラクターを表示してください。
:::

将来的には、`say` タグで指定したキャラクターが画面に表示されていない場合、自動的に表示されるようになる予定です。

```html
<!-- 将来の実装予定 -->
<say name="friend">「やあ！」</say>
<!-- friendが表示されていなければ自動的に表示される -->
```

現在の回避策：

```html
<show name="friend" left="300" top="100" />
<say name="friend">「やあ！」</say>
```

## 未定義のキャラクター

リソース定義にないキャラクター名も使用できます。その場合、表情変更などの機能は使用できませんが、名前の表示は可能です：

```html
<!-- config.jsに定義がなくても使える -->
<say name="通行人A">「こんにちは」</say>
<say name="店員">「いらっしゃいませ」</say>
```

## 実用例

### 会話シーン

```html
<show name="protagonist" left="200" top="100" />
<show name="friend" left="600" top="100" />

<say name="protagonist" pattern="normal">「おはよう」</say>
<say name="friend" pattern="smile">「おはよう！」</say>
<say name="protagonist" pattern="smile">「今日も良い天気だね」</say>
<say name="friend" pattern="smile">「そうだね！」</say>
```

### 表情を変えながらの会話

```html
<say name="protagonist" pattern="normal">「実は相談があるんだ」</say>
<say name="friend" pattern="normal">「なに？」</say>
<say name="protagonist" pattern="sad">「最近、悩んでることがあって...」</say>
<say name="friend" pattern="worried">「大丈夫？」</say>
```

### ボイス付きセリフ

```html
<say name="heroine" pattern="smile" voice="heroine_greeting.mp3">
  「おはようございます、先輩！」
</say>

<say name="heroine" pattern="embarrassed" voice="heroine_shy.mp3">
  「あの...今日は一緒に帰りませんか？」
</say>
```

### 条件付きセリフ

```html
<say name="protagonist" pattern="normal" if="firstMeeting">
  「初めまして」
</say>

<say name="protagonist" pattern="smile" if="!firstMeeting">
  「また会ったね」
</say>
```

## textタグとの違い

| 特徴 | text | say |
|------|------|-----|
| 名前の表示 | なし | あり |
| キャラクター連携 | なし | あり（リソース定義による） |
| ボイス再生 | なし | あり（voice属性） |
| 表情変更 | なし | あり（pattern属性） |
| 用途 | 地の文・ナレーション | キャラクターのセリフ |

## スタイルのカスタマイズ

キャラクター名やセリフの見た目は、UIのCSSファイルでカスタマイズできます：

```css
/* screen/default.css */
.character-name {
  font-size: 20px;
  font-weight: bold;
  color: #ffcc00;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
}

.character-message {
  font-size: 18px;
  color: #ffffff;
  line-height: 1.8;
}
```

## JavaScript での実装

内部的には、以下のようなScenarioオブジェクトに変換されます：

```javascript
{
  type: 'say',
  name: 'キャラクター名',
  pattern: '表情パターン',
  voice: 'ボイスファイル',
  msg: 'セリフの内容'
}
```

## 関連タグ

- [text](/api/tags/text) - 地の文を表示
- [show](/api/tags/show) - キャラクターを表示
- [sound](/api/tags/sound) - 音声を再生

## 注意事項

- `name` 属性は必須です
- `pattern` を使用するには、リソース定義で faces を設定する必要があります
- 未定義のキャラクター名を使用した場合、`pattern` は無視されます
- ボイスの再生は、セリフの表示と同時に開始されます
- アルファ版では、キャラクターの自動表示機能は未実装です
