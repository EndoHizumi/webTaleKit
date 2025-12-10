# jump タグ

シナリオの指定した行にジャンプします。

## 構文

```html
<jump index="行番号" />
```

## 属性

| 属性 | 型 | 必須 | 説明 |
|------|-----|------|------|
| index | number | ○ | ジャンプ先の行番号（0から開始） |
| if | string | × | 条件式（trueの場合のみ実行） |

## 基本的な使い方

### 指定した行にジャンプ

```html
<jump index="10" />
```

行番号は0から始まります。各タグや文章が1行としてカウントされます。

## 選択肢でのジャンプ

最も一般的な使用方法は、選択肢と組み合わせた分岐です：

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

## 条件付きジャンプ

`if` 属性を使って、条件を満たす場合のみジャンプできます：

```html
<jump index="50" if="hasKey" />
<jump index="60" if="!hasKey" />
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

### ルート分岐

```html
<choice prompt="誰に話しかけますか？">
  <item label="キャラA">
    <jump index="100" />  <!-- キャラAのシーン -->
  </item>
  <item label="キャラB">
    <jump index="200" />  <!-- キャラBのシーン -->
  </item>
  <item label="誰にも話しかけない">
    <jump index="300" />  <!-- 通常シーン -->
  </item>
</choice>
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
...

<!-- 行20: 鍵を持っていない場合 -->
<text>別の道を探すことにした。</text>
...
```

### ループ処理

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

## 行番号の数え方

行番号は以下のようにカウントされます：

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

## シーン間の移動

別のシーンに移動する場合は、`jump` ではなく `route` タグを使用します：

```html
<!-- 同じシーン内の移動 -->
<jump index="10" />

<!-- 別のシーンへの移動 -->
<route to="chapter2" />
```

## JavaScript での実装

内部的には、以下のようなScenarioオブジェクトに変換されます：

```javascript
{
  type: 'jump',
  index: 10
}
```

JavaScriptから直接ジャンプする場合：

```javascript
// logicセクション内
function skipToEnd() {
  index = 100;  // 行100にジャンプ
}
```

```html
<scenario>
  <call name="skipToEnd" />
</scenario>
```

## 関連タグ

- [choice](/tags/choice) - 選択肢の表示
- [route](/tags/route) - 別のシーンに移動
- [if](/tags/if) - 条件分岐
- [call](/tags/call) - JavaScript関数を呼び出し

## 注意事項

- 行番号は0から始まります
- 存在しない行番号を指定すると、シナリオが終了します
- ジャンプ先の行番号は、タグや文章を1行としてカウントします
- 同じシーン内でのみジャンプできます（別シーンへは `route` を使用）
- 無限ループに注意してください
