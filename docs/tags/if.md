# if タグ

条件に応じて処理を分岐します。

## 基本的な使い方

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

## 属性

| 属性 | 型 | 必須 | 説明 |
|------|------|------|------|
| condition | string | ✓ | 評価するJavaScript式 |

## 子要素

| 要素 | 必須 | 説明 |
|------|------|------|
| then | × | 条件がtrueの場合に実行される内容（最初の子要素） |
| else | × | 条件がfalseの場合に実行される内容（2番目の子要素） |

## if 属性（全タグ共通）

全てのタグで`if`属性を使用できます：

```html
<text if="hasKey">鍵を持っている。</text>
<text if="!hasKey">鍵を持っていない。</text>

<show path="chara/friend.png" if="hasMet" />
<say name="友人" if="hasMet">「また会ったね」</say>
```

`if`属性がfalseの場合、そのタグは実行されません。

## 使用例

### 基本的な条件分岐

```html
<if condition="hasKey">
  <then>
    <text>鍵を使って扉を開けた。</text>
  </then>
  <else>
    <text>扉は固く閉ざされている。</text>
  </else>
</if>
```

### if 属性を使用（推奨）

```html
<text if="hasKey">鍵を使って扉を開けた。</text>
<text if="!hasKey">扉は固く閉ざされている。</text>
```

こちらの方が簡潔で読みやすくなります。

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

または：

```html
<text if="score > 100 && hasItem">条件を満たしました！</text>
<text if="!(score > 100 && hasItem)">条件を満たしていません。</text>
```

### 関数呼び出しを含む条件

```html
<text if="checkInventory('apple')">リンゴを持っている。</text>
<text if="scoreGreaterThan(100)">ハイスコア達成！</text>
```

## 実用例

### アイテム所持チェック

```html
<scenario>
  <text>扉の前に立った。</text>

  <text if="hasKey">鍵を使って扉を開けた。</text>
  <text if="!hasKey">鍵がないので開けられない。</text>
</scenario>

<script>
let hasKey = false;

function getKey() {
  hasKey = true;
}
</script>
```

### スコアによる分岐

```html
<scenario>
  <text if="score >= 80">素晴らしい成績だ！</text>
  <text if="score >= 50 && score < 80">まずまずの成績だ。</text>
  <text if="score < 50">もっと頑張ろう。</text>
</scenario>

<script>
let score = 0;

function addScore(points) {
  score += points;
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

### キャラクター表示の条件分岐

```html
<show path="chara/friend.png" if="hasMet" />
<say name="友人" if="hasMet">「やあ、久しぶり」</say>

<text if="!hasMet">誰もいない。</text>
```

### ルート分岐

```html
<choice prompt="どちらに行きますか？">
  <item label="右の道">
    <call name="setRoute" args="['right']" />
    <jump index="10" />
  </item>
  <item label="左の道">
    <call name="setRoute" args="['left']" />
    <jump index="20" />
  </item>
</choice>

<!-- 行10: 右ルート -->
<text if="currentRoute === 'right'">右の道を進んだ。</text>

<!-- 行20: 左ルート -->
<text if="currentRoute === 'left'">左の道を進んだ。</text>
```

## 条件式の記法

### 変数の評価

```html
<!-- 真偽値 -->
<text if="hasKey">...</text>
<text if="!hasKey">...</text>

<!-- 数値比較 -->
<text if="score > 100">...</text>
<text if="score >= 50">...</text>
<text if="score === 0">...</text>

<!-- 文字列比較 -->
<text if="playerName === '太郎'">...</text>
<text if="currentRoute === 'A'">...</text>
```

### 論理演算子

```html
<!-- AND条件 -->
<text if="hasKey && hasMap">...</text>

<!-- OR条件 -->
<text if="hasKey || hasLockpick">...</text>

<!-- 複雑な条件 -->
<text if="(score > 100 || hasBonus) && !gameOver">...</text>
```

### オブジェクトと配列

```html
<!-- オブジェクトのプロパティ -->
<text if="inventory.apple > 0">...</text>
<text if="player.level >= 10">...</text>

<!-- 配列の長さ -->
<text if="items.length > 0">...</text>

<!-- 配列のメソッド -->
<text if="items.includes('sword')">...</text>
```

### 関数呼び出し

```html
<text if="checkInventory('apple')">...</text>
<text if="isQuestComplete('main')">...</text>
```

## 実行コンテキスト

条件式は`<script>`セクションで定義された変数や関数にアクセスできます：

```html
<scenario>
  <text if="canOpenDoor()">扉を開けた。</text>
</scenario>

<script>
let hasKey = false;
let lockpickSkill = 5;

function canOpenDoor() {
  return hasKey || lockpickSkill >= 10;
}
</script>
```

## 注意事項

### 変数のスコープ

条件式で使用する変数は、`<script>`セクションで定義されている必要があります：

```html
<!-- ❌ 間違い：変数が定義されていない -->
<text if="undefinedVar">...</text>

<!-- ✅ 正しい -->
<scenario>
  <text if="definedVar">...</text>
</scenario>

<script>
let definedVar = true;
</script>
```

### elseの省略

`if`タグで`else`は省略できます：

```html
<if condition="hasKey">
  <then>
    <text>鍵を持っている。</text>
  </then>
</if>
<!-- elseがない場合、条件がfalseなら何も実行されない -->
```

### if属性の方が推奨

単純な条件分岐の場合、`if`タグより`if`属性を使う方が簡潔です：

```html
<!-- ⚠️ 冗長 -->
<if condition="hasKey">
  <then>
    <text>鍵を持っている。</text>
  </then>
</if>

<!-- ✅ 簡潔 -->
<text if="hasKey">鍵を持っている。</text>
```

複雑な分岐（複数行の処理など）がある場合は`if`タグを使用します。

## 関連タグ

- [jump](/tags/jump) - 条件付きジャンプ
- [choice](/tags/choice) - 選択肢による分岐
- [call](/tags/call) - 関数呼び出し

## 次のステップ

- [制御構文](/api/control) - 制御構文の概要
- [jumpタグ](/tags/jump) - シナリオのジャンプ
