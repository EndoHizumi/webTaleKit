# text タグ

地の文（ナレーション）を表示します。

## 構文

```html
<text speed="0.5" wait="true" clear="true">表示するテキスト</text>
```

または、タグを省略してテキストだけを記述することもできます：

```html
表示するテキスト
```

## 属性

| 属性 | 型 | 必須 | デフォルト | 説明 |
|------|-----|------|-----------|------|
| speed | number | × | 0.5 | テキストの表示間隔（秒単位） |
| wait | boolean | × | true | クリック待ちをするかどうか |
| clear | boolean | × | true | 前のメッセージを消すかどうか |
| if | string | × | - | 条件式（trueの場合のみ実行） |

## 基本的な使い方

### シンプルなテキスト表示

```html
<text>夏の陽気が残る9月の初旬</text>
```

タグを省略することもできます：

```html
夏の陽気が残る9月の初旬
```

### 複数行のテキスト

```html
<text>
  夏の陽気が残る9月の初旬
  そんな日に、彼女は言った。
</text>
```

## 表示速度の調整

### 速く表示

```html
<text speed="0.1">素早く表示されるテキスト</text>
```

### ゆっくり表示

```html
<text speed="1.0">ゆっくり表示されるテキスト</text>
```

### 即座に表示

```html
<text speed="0">一瞬で表示されるテキスト</text>
```

## クリック待ち

### クリック待ちあり（デフォルト）

```html
<text wait="true">
  このテキストの後、クリック待ちをします。
</text>
```

### クリック待ちなし

次のテキストや処理に自動的に進みます：

```html
<text wait="false">クリック待ちせず次に進みます</text>
<text>次のテキスト</text>
```

## メッセージのクリア

### 前のメッセージを消す（デフォルト）

```html
<text clear="true">前のメッセージは消えます</text>
```

### 前のメッセージを残す

```html
<text>最初のテキスト</text>
<text clear="false">前のテキストに追加されます</text>
```

結果：
```
最初のテキスト
前のテキストに追加されます
```

## 改行

### テキスト内で改行

```html
<text>
  1行目のテキスト<br/>
  2行目のテキスト<br/>
  3行目のテキスト
</text>
```

### 新しいページを開始

`<newpage>` タグを使うと、メッセージをクリアして新しいページを開始できます：

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

### 状況説明

```html
<text>
  目の前には3つの扉がある。<br/>
  どれを選ぶべきか...
</text>
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
```

## JavaScript での実装

内部的には、以下のようなScenarioオブジェクトに変換されます：

```javascript
{
  type: 'text',
  msg: '表示するテキスト',
  speed: 0.5,
  wait: true,
  clear: true
}
```

## 関連タグ

- [say](/api/tags/say) - キャラクターのセリフを表示
- [newpage](#) - メッセージをクリア
- [choice](/api/tags/choice) - 選択肢を表示

## 注意事項

- `speed` は秒単位で指定します（0.5 = 0.5秒間隔）
- `wait` が `false` の場合、すぐに次の処理に進みます
- 改行ごとにクリック待ちが発生します（`wait="true"` の場合）
- HTMLタグは一部使用できますが、基本的には `<br/>` のみ推奨
