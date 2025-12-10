# 選択肢の追加

選択肢はプレイヤーがゲームの進行を選ぶ重要な要素です。`<choice>` タグを使って簡単に実装できます。

## 基本的な選択肢の書き方

```html
<choice prompt="選択肢を表示する際の文言">
  <item label="選択肢1">
    <!-- 選択後に実行される内容 -->
    <text>選択肢1を選びました</text>
  </item>
  <item label="選択肢2">
    <text>選択肢2を選びました</text>
  </item>
</choice>
```

### 構成要素

- **prompt**: 選択肢を表示する前にメッセージウインドウに表示される文言
- **item**: 個別の選択肢（最大6つまで）
- **label**: 選択肢のボタンに表示されるテキスト

## 実用的な例

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

`<jump>` タグを使うと、指定した行番号にジャンプできます：

```html
<choice prompt="どちらに行きますか？">
  <item label="右の道">
    <jump index="10" />
  </item>
  <item label="左の道">
    <jump index="20" />
  </item>
</choice>
```

::: info index について
`index` は、シナリオの行番号を指定します。0から始まり、各タグや文章が1行としてカウントされます。
:::

### 三択以上の選択肢

```html
<choice prompt="ゲームを始めますか？">
  <item label="はい">
    <jump index="5" />
  </item>
  <item label="いいえ">
    <jump index="16" />
  </item>
  <item label="ちょっと待ってくれ">
    <text>承知しました。</text>
    <jump index="1" />
  </item>
</choice>
```

## 選択肢内で実行できること

選択肢の中では、様々なタグを使用できます：

### テキストを表示

```html
<item label="話しかける">
  <text>彼女に話しかけた。</text>
  <say name="彼女">「はい、何でしょう？」</say>
</item>
```

### キャラクターを表示

```html
<item label="部屋に入る">
  <text>部屋のドアを開けた。</text>
  <show path="chara/character1.png" name="キャラ1" left="300" top="100" />
  <say name="キャラ1">「よく来たね」</say>
</item>
```

### BGMを変更

```html
<item label="戦う">
  <sound path="bgm/battle.mp3" name="battle_bgm" />
  <text>戦闘が始まった！</text>
</item>
```

### 変数を変更

```html
<item label="リンゴを取る">
  <call name="getApple" />
  <text>リンゴを手に入れた。</text>
</item>
```

::: info call タグ
`<call>` タグは、`<script>` セクションで定義したJavaScript関数を呼び出します。
:::

## 選択肢の見た目をカスタマイズ

### 個別の選択肢に画像を設定

```html
<choice prompt="選択してください">
  <item label="選択肢A" default="button_a.png" hover="button_a_hover.png">
    <text>Aを選択しました</text>
  </item>
</choice>
```

### 全体の選択肢画像を設定

```html
<choice prompt="選択してください"
        default="button.png"
        hover="button_hover.png"
        select="button_select.png">
  <item label="選択肢1">
    <text>選択肢1を選びました</text>
  </item>
  <item label="選択肢2">
    <text>選択肢2を選びました</text>
  </item>
</choice>
```

画像の属性：
- **default**: 通常時の画像
- **hover**: マウスを乗せた時の画像
- **select**: クリックした時の画像

## 条件付き選択肢

`if` 属性を使って、条件を満たす場合のみ選択肢を表示できます：

```html
<choice prompt="どうしますか？">
  <item label="アイテムを使う" if="hasItem">
    <text>アイテムを使用した。</text>
  </item>
  <item label="何もしない">
    <text>様子を見ることにした。</text>
  </item>
</choice>
```

## よくあるパターン

### プロローグスキップ

```html
<choice prompt="プロローグをスキップしますか？">
  <item label="はい">
    <jump index="50" />
  </item>
  <item label="いいえ">
    <!-- 次に進む（何も記述しない） -->
  </item>
</choice>
```

### ルート分岐

```html
<choice prompt="誰のルートに進みますか？">
  <item label="キャラA">
    <route to="routeA" />
  </item>
  <item label="キャラB">
    <route to="routeB" />
  </item>
  <item label="共通ルート">
    <route to="common" />
  </item>
</choice>
```

## トラブルシューティング

::: warning 選択肢が表示されない
- `prompt` 属性が正しく設定されているか確認してください
- `<item>` タグが `<choice>` タグの中にあるか確認してください
- 選択肢は最大6つまでです
:::

::: warning ジャンプ先が正しく動作しない
- `index` の値が正しい行番号を指しているか確認してください
- 行番号は0から始まります
:::

## 次のステップ

- [制御構文](/api/control) - if文やジャンプの詳細
- [choiceタグリファレンス](/tags/choice) - 全ての属性とオプション
- [jumpタグリファレンス](/tags/jump) - ジャンプの使い方
