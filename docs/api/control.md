# 制御構文

シナリオの流れを制御する機能の概要とタグリファレンスです。

## 概要

webTaleKitでは、以下の制御構文を使ってシナリオの流れを制御できます：

- **jump** - 指定した行にジャンプ
- **if** - 条件分岐
- **route** - 別のシーンに移動
- **call** - JavaScript関数を呼び出し

## ジャンプ

### jump タグ

シナリオの指定した行にジャンプします。

```html
<jump index="10" />
```

[jump タグの詳細 →](/tags/jump)

### 基本的な使い方

```html
<!-- 行0 -->
<text>最初のテキスト</text>

<!-- 行1 -->
<jump index="10" />

<!-- 行2-9はスキップされる -->

<!-- 行10 -->
<text>ここにジャンプ</text>
```

### 選択肢でのジャンプ

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

### 条件付きジャンプ

```html
<jump index="50" if="hasKey" />
<jump index="60" if="!hasKey" />
```

## 条件分岐

### if タグ

条件に応じて処理を分岐します。

```html
<if condition="hasKey">
  <then>
    <text>鍵を持っているので扉を開けた。</text>
  </then>
  <else>
    <text>鍵がないので扉を開けられない。</text>
  </else>
</if>
```

### if 属性

全てのタグで `if` 属性を使用できます：

```html
<text if="hasKey">鍵を持っている。</text>
<text if="!hasKey">鍵を持っていない。</text>

<show path="chara/friend.png" if="hasMet" />
<say name="友人" if="hasMet">「また会ったね」</say>
```

### 複雑な条件式

```html
<if condition="score > 100 && hasItem">
  <then>
    <text>条件を満たしました！</text>
  </then>
  <else>
    <text>条件を満たしていません。</text>
  </else>
</if>
```

## シーン移動

### route タグ

別のシーンに移動します。

```html
<route to="chapter2" />
```

### 使用例

```html
<!-- title.scene -->
<choice prompt="ゲームを始めますか？">
  <item label="新しく始める">
    <route to="chapter1" />
  </item>
  <item label="続きから">
    <call name="loadGame" />
    <route to="chapter1" />
  </item>
</choice>
```

## 関数呼び出し

### call タグ

`<script>` セクションで定義したJavaScript関数を呼び出します。

```html
<scenario>
  <call name="addScore" args="[10]" />
  <text>スコアが増えました！</text>
</scenario>

<script>
let score = 0;

function addScore(points) {
  score += points;
  console.log(`現在のスコア: ${score}`);
}
</script>
```

### 引数なしの関数

```html
<call name="checkInventory" />
```

### 複数の引数

```html
<call name="addItem" args="['apple', 3]" />
```

## 実用例

### プロローグスキップ

```html
<!-- 行0 -->
<choice prompt="プロローグをスキップしますか？">
  <item label="はい">
    <jump index="50" />  <!-- プロローグ後の行へ -->
  </item>
  <item label="いいえ">
    <!-- 次の行に進む -->
  </item>
</choice>

<!-- 行1-49: プロローグ -->
<text>プロローグの内容...</text>
...

<!-- 行50: プロローグ後 -->
<text>本編の開始</text>
```

### 条件による自動分岐

```html
<text>扉の前に立った。</text>

<!-- 鍵を持っている場合は開ける -->
<jump index="10" if="hasKey" />

<!-- 鍵を持っていない場合は別の処理 -->
<text>鍵がかかっている。</text>
<jump index="20" />

<!-- 行10: 鍵を持っている場合 -->
<text>鍵を使って扉を開けた。</text>
<route to="next_room" />

<!-- 行20: 鍵を持っていない場合 -->
<text>別の道を探すことにした。</text>
```

### アイテムの管理

```html
<scenario>
  <choice prompt="何を取りますか？">
    <item label="リンゴ">
      <call name="addItem" args="['apple']" />
      <text>リンゴを手に入れた。（所持数: {{appleCount}}）</text>
    </item>
    <item label="剣">
      <call name="addItem" args="['sword']" />
      <text>剣を手に入れた。</text>
    </item>
  </choice>

  <text if="hasItem('apple')">リンゴの甘い香りがする。</text>
</scenario>

<script>
const inventory = {};
let appleCount = 0;

function addItem(itemName) {
  if (!inventory[itemName]) {
    inventory[itemName] = 0;
  }
  inventory[itemName]++;

  if (itemName === 'apple') {
    appleCount++;
  }
}

function hasItem(itemName) {
  return inventory[itemName] > 0;
}
</script>
```

### ルート分岐

```html
<scenario>
  <text>どのキャラクターのルートに進むか選択してください。</text>

  <choice prompt="誰のルートに進みますか？">
    <item label="キャラA">
      <call name="setRoute" args="['A']" />
      <route to="route_a" />
    </item>
    <item label="キャラB">
      <call name="setRoute" args="['B']" />
      <route to="route_b" />
    </item>
    <item label="共通ルート">
      <route to="common" />
    </item>
  </choice>
</scenario>

<script>
let currentRoute = 'common';

function setRoute(routeName) {
  currentRoute = routeName;
  console.log(`ルート設定: ${routeName}`);
}
</script>
```

### フラグ管理

```html
<scenario>
  <text if="!flag_met_friend">初めて友人に会った。</text>
  <text if="flag_met_friend">また友人に会った。</text>

  <call name="setFlag" args="['met_friend', true]" />

  <say name="友人" if="!flag_met_friend">「初めまして」</say>
  <say name="友人" if="flag_met_friend">「また会ったね」</say>
</scenario>

<script>
const flags = {
  met_friend: false,
  has_key: false,
  completed_quest: false
};

function setFlag(flagName, value) {
  flags[flagName] = value;
}

function getFlag(flagName) {
  return flags[flagName] || false;
}
</script>
```

## 行番号の数え方

行番号は0から始まり、各タグや文章が1行としてカウントされます：

```html
<!-- 行0 --><text>最初のテキスト</text>
<!-- 行1 --><say name="character">セリフ</say>
<!-- 行2 --><show path="image.png" />
<!-- 行3 --><choice prompt="選択">
<!-- 行4 -->  <item label="A"><jump index="10" /></item>
<!-- 行5 -->  <item label="B"><jump index="20" /></item>
<!-- 行6 --></choice>
```

::: tip デバッグのヒント
行番号を把握しやすくするため、コメントで番号を振っておくと便利です：

```html
<!-- [0] -->
<text>最初のテキスト</text>

<!-- [1] -->
<say name="character">セリフ</say>

<!-- [10] キャラAルート開始 -->
<text>キャラAと話し始めた</text>
```
:::

## ループ処理

特定の条件が満たされるまで繰り返す：

```html
<!-- 行0 -->
<text>戦闘中...</text>

<!-- 勝利条件をチェック -->
<jump index="10" if="enemyDefeated" />

<!-- まだ戦闘中の場合は行0に戻る -->
<jump index="0" if="!enemyDefeated" />

<!-- 行10: 勝利後 -->
<text>敵を倒した！</text>
```

::: warning ループの注意
無限ループに陥らないよう、必ず終了条件を設定してください。
:::

## トラブルシューティング

### ジャンプ先が正しく動作しない

- `index` の値が正しい行番号を指しているか確認
- 行番号は0から始まります

### 条件式が機能しない

- 変数が `<script>` セクションで定義されているか確認
- 条件式の構文が正しいか確認

### 関数が呼び出されない

- 関数名が正しいか確認
- 引数の形式が正しいか確認（配列形式で渡す）

## 関連タグ

- [jump](/tags/jump) - シナリオの行移動
- [if](/tags/if) - 条件分岐
- [route](/tags/route) - シーンの移動
- [call](/tags/call) - 関数呼び出し
- [choice](/tags/choice) - 選択肢

## 次のステップ

- [シーンファイル](/guide/scene-files) - シナリオの書き方
- [チュートリアル](/guide/tutorial-choices) - 実際に実装してみる
