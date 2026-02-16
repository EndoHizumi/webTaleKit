# call タグ

JavaScriptコードを実行します。

## 基本的な使い方

```html
<call method="変数名 = 値" />
```

## 属性

| 属性 | 型 | 必須 | 説明 |
|------|------|------|------|
| method | string | 〇 | 実行するJavaScriptコード |
| if | string | × | 条件式（trueの場合のみ実行） |

## 使用例

### 変数の設定

```html
<call method="playerName = '太郎'" />
<call method="score = 100" />
<call method="hasKey = true" />
```

### 関数の呼び出し

```html
<call method="startBattle()" />
<call method="addItem('potion')" />
<call method="playSound('sfx/door.mp3')" />
```

### 条件付き実行

```html
<call method="score += 10" if="isCorrectAnswer" />
<call method="unlockDoor()" if="hasKey" />
```

## 実用例

### 選択肢での変数設定

```html
<choice prompt="好きな色を選んでください">
  <item label="赤">
    <call method="setFavoriteColor('red')" />
    <text>赤を選びました。</text>
  </item>
  <item label="青">
    <call method="setFavoriteColor('blue')" />
    <text>青を選びました。</text>
  </item>
  <item label="緑">
    <call method="setFavoriteColor('green')" />
    <text>緑を選びました。</text>
  </item>
</choice>
```

### フラグ管理

```html
<scenario>
  <text>扉を調べた。</text>
  <call method="hasExaminedDoor = true" />

  <text if="hasKey">鍵を使って開けることができそうだ。</text>
  <text if="!hasKey">鍵がかかっている。</text>
</scenario>
```

### スコア計算

```html
<scenario>
  <text>正解です！</text>
  <call method="score += 10" />
  <call method="correctAnswers += 1" />

  <text>現在のスコア: {{score}}点</text>
  <text>正解数: {{correctAnswers}}</text>
</scenario>
```

### 複雑な処理

```html
<scenario>
  <call method="calculateResult()" />
  <text>結果: {{result}}</text>
</scenario>

<script>
function calculateResult() {
  result = score * difficulty + bonusPoints;
}

let score = 0;
let difficulty = 1.5;
let bonusPoints = 100;
let result = 0;
</script>
```

## JavaScript実行環境

`call`タグで実行されるコードは、シーンファイルの`<script>`セクションと同じスコープで実行されます。

### 利用可能な機能

- シーンファイル内で定義した変数・関数へのアクセス
- グローバルオブジェクトへのアクセス
- 標準JavaScriptの機能

### 注意事項

- 複雑な処理は`<script>`セクションで関数を定義し、`call`タグで呼び出すことを推奨
- 非同期処理（async/await）は直接サポートされていません

## よくある使い方

### フラグの切り替え

```html
<call method="isNight = !isNight" />
```

### 配列への追加

```html
<call method="inventory.push('sword')" />
```

### オブジェクトの更新

```html
<call method="player.hp -= 10" />
<call method="player.level += 1" />
```

## 関連タグ

- [if](/tags/if) - 条件分岐
- [choice](/tags/choice) - 選択肢の表示

## 次のステップ

- [制御構文](/api/control) - 制御構文の概要
- [シーンファイル](/guide/scene-files) - scriptセクションの使い方
