# 選択肢

選択肢に関連する機能の概要です。

## 概要

選択肢はプレイヤーがゲームの進行を選択する重要な要素です。`choice`タグを使って実装します。

## choice タグ

プレイヤーに選択肢を提示し、選択に応じて処理を分岐します。

### 基本的な使い方

```html
<choice prompt="選択してください">
  <item label="選択肢1">
    <text>選択肢1を選びました</text>
  </item>
  <item label="選択肢2">
    <text>選択肢2を選びました</text>
  </item>
</choice>
```

[choice タグの詳細 →](/api/tags/choice)

## 主な機能

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
<choice prompt="どちらに行きますか？">
  <item label="右の道">
    <jump index="10" />
  </item>
  <item label="左の道">
    <jump index="20" />
  </item>
</choice>
```

### 複数の選択肢（最大6つ）

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
        hover="button_a_hover.png">
    <text>キャラAを選びました</text>
  </item>
  <item label="キャラB"
        default="button_b.png"
        hover="button_b_hover.png">
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

## 実用例

### プロローグスキップ

```html
<choice prompt="プロローグをスキップしますか？">
  <item label="はい">
    <jump index="50" />  <!-- プロローグ後の行へ -->
  </item>
  <item label="いいえ">
    <!-- 次の行に進む -->
  </item>
</choice>
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

### アイテムの使用

```html
<choice prompt="どのアイテムを使いますか？">
  <item label="回復薬" if="hasPotion">
    <call name="usePotion" />
    <text>HPが回復した！</text>
  </item>
  <item label="魔法の鍵" if="hasMagicKey">
    <call name="useMagicKey" />
    <text>扉が開いた！</text>
  </item>
  <item label="使わない">
    <text>何も使わなかった。</text>
  </item>
</choice>
```

## トラブルシューティング

### 選択肢が表示されない

- `prompt` 属性が設定されているか確認
- `<item>` タグが `<choice>` タグの中にあるか確認
- 選択肢は最大6つまで

### ジャンプ先が正しく動作しない

- `index` の値が正しい行番号を指しているか確認
- 行番号は0から始まります

### 条件付き選択肢が表示されない

- `if` 属性の条件式が正しいか確認
- 変数が定義されているか確認

## 関連タグ

- [choice](/api/tags/choice) - 選択肢の詳細仕様
- [jump](/api/tags/jump) - シナリオの行移動
- [route](/api/tags/route) - シーンの移動
- [if](/api/tags/if) - 条件分岐

## 次のステップ

- [制御構文](/api/control) - if文やジャンプの詳細
- [チュートリアル](/guide/tutorial-choices) - 選択肢の実装を学ぶ
