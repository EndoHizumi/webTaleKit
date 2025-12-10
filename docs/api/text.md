# テキスト表示

テキスト表示に関連する機能の概要とタグリファレンスです。

## 概要

webTaleKitでは、以下の方法でテキストを表示できます：

- **text タグ** - 地の文（ナレーション）を表示
- **say タグ** - キャラクターのセリフを表示
- **newpage** - メッセージをクリアして新しいページを開始

## 主なタグ

### text タグ

地の文（ナレーション）を表示します。

```html
<text>夏の陽気が残る9月の初旬</text>
```

タグを省略することもできます：

```html
夏の陽気が残る9月の初旬
```

[text タグの詳細 →](/api/tags/text)

### say タグ

キャラクターのセリフを表示します。

```html
<say name="燈火">「先輩、別れてください」</say>
<say name="智樹">「え、ごめん。今･･･なんて」</say>
```

表情パターンやボイスも指定できます：

```html
<say name="主人公" pattern="smile" voice="greeting.mp3">
  「こんにちは！」
</say>
```

[say タグの詳細 →](/api/tags/say)

## テキスト表示の制御

### 表示速度の調整

```html
<text speed="0.1">速く表示されるテキスト</text>
<text speed="1.0">ゆっくり表示されるテキスト</text>
```

### クリック待ち

```html
<!-- クリック待ちあり（デフォルト） -->
<text wait="true">クリック待ちをします</text>

<!-- クリック待ちなし -->
<text wait="false">自動的に次に進みます</text>
```

### 前のメッセージのクリア

```html
<!-- 前のメッセージを消す（デフォルト） -->
<text clear="true">前のメッセージは消えます</text>

<!-- 前のメッセージを残す -->
<text clear="false">前のテキストに追加されます</text>
```

## 改行とページ制御

### テキスト内で改行

```html
<text>
  1行目のテキスト<br/>
  2行目のテキスト<br/>
  3行目のテキスト
</text>
```

### 新しいページを開始

```html
<text>最初のページのテキスト</text>
<newpage />
<text>新しいページのテキスト</text>
```

## 変数の使用

Mustache記法（`{{変数名}}`）で変数を埋め込めます：

```html
<scenario>
  <text>{{playerName}}は目を覚ました。</text>
  <text>所持金: {{money}}円</text>
</scenario>

<script>
const playerName = "太郎";
let money = 1000;
</script>
```

## 条件付き表示

`if` 属性を使って、条件を満たす場合のみ表示できます：

```html
<text if="hasKey">鍵を持っている。</text>
<text if="!hasKey">鍵を持っていない。</text>
```

## 実用例

### ストーリーの語り

```html
夏の陽気が残る9月の初旬

<text>
  聞き取れなかったわけじゃない。<br/>
  言われた意味が分からなかった。<br/>
  理解したくなかった。
</text>
```

### 会話シーン

```html
<say name="燈火">「先輩、別れてください」</say>
<say name="智樹">「え、ごめん。今･･･なんて」</say>

聞き取れなかったわけじゃない。
言われた意味が分からなかった。

<say name="燈火">「最初から好きじゃなかったんです」</say>
```

### 変数を使った動的テキスト

```html
<text>{{characterName}}は{{location}}に到着した。</text>
<text if="isNight">辺りはすっかり暗くなっている。</text>
<text if="!isNight">日差しが眩しい。</text>
```

## スタイルのカスタマイズ

テキストの見た目は、UIのCSSファイルで変更できます：

```css
/* screen/default.css */
.message-window {
  font-size: 18px;
  line-height: 1.8;
  color: #ffffff;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.character-name {
  font-size: 20px;
  font-weight: bold;
  color: #ffcc00;
}
```

## 関連タグ

- [text](/api/tags/text) - 地の文を表示
- [say](/api/tags/say) - キャラクターのセリフを表示
- [choice](/api/tags/choice) - 選択肢を表示

## 次のステップ

- [画像表示](/api/image) - 画像操作の機能
- [音声](/api/sound) - 音声再生の機能
- [制御構文](/api/control) - 条件分岐とジャンプ
