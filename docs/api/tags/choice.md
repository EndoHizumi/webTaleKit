# choice タグ

選択肢を表示し、プレイヤーの選択に応じて処理を分岐します。

## 構文

```html
<choice prompt="選択肢を表示する際の文言"
        default="button.png"
        hover="button_hover.png"
        select="button_select.png">
  <item label="選択肢1" default="" hover="" select="">
    <!-- 選択後に実行される内容 -->
  </item>
  <item label="選択肢2">
    <!-- 選択後に実行される内容 -->
  </item>
</choice>
```

## 属性

### choice要素の属性

| 属性 | 型 | 必須 | 説明 |
|------|-----|------|------|
| prompt | string | ○ | 選択肢を表示する際にメッセージウインドウに表示される文言 |
| default | string | × | すべての選択肢の通常時の背景画像パス |
| hover | string | × | すべての選択肢のマウスオーバー時の背景画像パス |
| select | string | × | すべての選択肢のクリック時の背景画像パス |
| id | number | × | 選択肢を識別するID（自動設定） |

### item要素の属性

| 属性 | 型 | 必須 | 説明 |
|------|-----|------|------|
| label | string | ○ | 選択肢のボタンに表示されるテキスト |
| default | string | × | この選択肢の通常時の背景画像パス |
| hover | string | × | この選択肢のマウスオーバー時の背景画像パス |
| select | string | × | この選択肢のクリック時の背景画像パス |
| color | string | × | ボタンの文字色（色名またはRGB） |
| if | string | × | 条件式（trueの場合のみ表示） |

## 基本的な使い方

### シンプルな二択

```html
<choice prompt="ゲームを始めますか？">
  <item label="はい">
    <text>それでは始めましょう！</text>
  </item>
  <item label="いいえ">
    <text>また後でお会いしましょう。</text>
  </item>
</choice>
```

### ジャンプを使った分岐

```html
<choice prompt="どちらに進みますか？">
  <item label="右の道">
    <jump index="10" />
  </item>
  <item label="左の道">
    <jump index="20" />
  </item>
</choice>
```

### 複数の選択肢

最大6つまで選択肢を設定できます：

```html
<choice prompt="行き先を選んでください">
  <item label="学校"><jump index="10" /></item>
  <item label="図書館"><jump index="20" /></item>
  <item label="公園"><jump index="30" /></item>
  <item label="商店街"><jump index="40" /></item>
  <item label="駅"><jump index="50" /></item>
  <item label="家"><jump index="60" /></item>
</choice>
```

## 見た目のカスタマイズ

### 全体の画像を設定

```html
<choice prompt="選択してください"
        default="system/button.png"
        hover="system/button_hover.png"
        select="system/button_select.png">
  <item label="選択肢1">
    <text>1を選びました</text>
  </item>
  <item label="選択肢2">
    <text>2を選びました</text>
  </item>
</choice>
```

### 個別の画像を設定

```html
<choice prompt="キャラクターを選択してください">
  <item label="キャラA"
        default="button_a.png"
        hover="button_a_hover.png"
        select="button_a_select.png">
    <text>キャラAを選びました</text>
  </item>
  <item label="キャラB"
        default="button_b.png"
        hover="button_b_hover.png"
        select="button_b_select.png">
    <text>キャラBを選びました</text>
  </item>
</choice>
```

### 文字色を変更

```html
<choice prompt="難易度を選択してください">
  <item label="イージー" color="green">
    <call name="setDifficulty" args="['easy']" />
  </item>
  <item label="ノーマル" color="blue">
    <call name="setDifficulty" args="['normal']" />
  </item>
  <item label="ハード" color="red">
    <call name="setDifficulty" args="['hard']" />
  </item>
</choice>
```

## 条件付き選択肢

`if` 属性を使って、条件を満たす場合のみ選択肢を表示できます：

```html
<choice prompt="どうしますか？">
  <item label="アイテムを使う" if="hasItem">
    <call name="useItem" />
    <text>アイテムを使用した。</text>
  </item>
  <item label="魔法を使う" if="hasMagic">
    <call name="useMagic" />
    <text>魔法を唱えた。</text>
  </item>
  <item label="何もしない">
    <text>様子を見ることにした。</text>
  </item>
</choice>
```

## 選択後の処理

### 複数のタグを実行

```html
<item label="部屋に入る">
  <text>ドアを開けて部屋に入った。</text>
  <show path="chara/character1.png" name="char1" />
  <sound path="bgm/room.mp3" />
  <say name="キャラ1">「よく来たね」</say>
</item>
```

### 変数の変更

```html
<item label="リンゴを取る">
  <call name="addItem" args="['apple']" />
  <call name="incrementAppleCount" />
  <text>リンゴを手に入れた。</text>
</item>
```

### シーンの移動

```html
<item label="次の章へ">
  <route to="chapter2" />
</item>
```

## JavaScript での実装

内部的には、以下のようなScenarioオブジェクトに変換されます：

```javascript
{
  type: 'choice',
  id: 0,
  prompt: '選択してください',
  items: [
    {
      id: 0,
      label: '選択肢1',
      onSelect: [
        { type: 'text', msg: '1を選びました' }
      ]
    },
    {
      id: 1,
      label: '選択肢2',
      onSelect: [
        { type: 'text', msg: '2を選びました' }
      ]
    }
  ],
  src: {
    default: 'button.png',
    hover: 'button_hover.png',
    select: 'button_select.png'
  }
}
```

## 関連タグ

- [jump](/api/tags/jump) - シナリオの行移動
- [route](/api/tags/route) - シーンの移動
- [if](/api/tags/if) - 条件分岐
- [call](/api/tags/call) - 関数呼び出し

## 注意事項

- 選択肢は最大6つまで設定できます
- `prompt` 属性は必須です
- 個別の画像設定は全体の設定を上書きします
- 選択肢が1つもない場合はエラーになります
