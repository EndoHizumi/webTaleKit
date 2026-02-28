# moveTo タグ

画像を移動させます（アニメーション付き）。

## 基本的な使い方

```html
<show path="chara/protagonist.png" name="hero" left="300" top="100" />
<moveTo name="hero" x="100" y="0" duration="2" />
```

## 属性

| 属性 | 型 | 必須 | デフォルト | 説明 |
|------|------|------|----------|------|
| name | string | ✓ | - | 移動させる画像の識別子（showタグで指定したもの） |
| x | number | ✓ | - | 相対的なX方向の移動量（ピクセル） |
| y | number | ✓ | - | 相対的なY方向の移動量（ピクセル） |
| duration | number | × | 1 | アニメーションの時間（秒） |
| if | string | × | - | 条件式 |

## 重要な仕様

### 相対移動

`moveTo`タグは**相対移動**です。現在位置からの移動量を指定します：

```html
<!-- 初期位置: left=300, top=100 -->
<show path="chara/hero.png" name="hero" left="300" top="100" />

<!-- 右に100px移動 → 新しい位置: left=400, top=100 -->
<moveTo name="hero" x="100" y="0" />

<!-- さらに右に100px移動 → 新しい位置: left=500, top=100 -->
<moveTo name="hero" x="100" y="0" />
```

### マイナス値で逆方向

マイナス値を指定すると逆方向に移動します：

```html
<!-- 左に移動 -->
<moveTo name="hero" x="-100" y="0" />

<!-- 上に移動 -->
<moveTo name="hero" x="0" y="-50" />
```

## 使用例

### キャラクターを右に移動

```html
<show path="chara/protagonist.png" name="hero" left="300" top="100" />
<text>彼は近づいてきた。</text>
<moveTo name="hero" x="200" y="0" duration="3" />
```

### キャラクターを左に移動

```html
<moveTo name="hero" x="-200" y="0" duration="2" />
```

### 斜めに移動

```html
<moveTo name="hero" x="100" y="50" duration="2.5" />
```

### 素早い移動

```html
<!-- 1秒で移動（デフォルト） -->
<moveTo name="hero" x="150" y="0" />

<!-- 0.5秒で素早く移動 -->
<moveTo name="hero" x="150" y="0" duration="0.5" />
```

## 実用例

### キャラクターの登場と移動

```html
<!-- 画面外から登場 -->
<show path="chara/friend.png" name="friend" left="-200" top="100" />
<text>友人が走ってきた。</text>
<moveTo name="friend" x="500" y="0" duration="2" />

<say name="友人">「待たせてごめん！」</say>
```

### 複数のキャラクターを同時に移動

```html
<show path="chara/charA.png" name="charA" left="100" top="100" />
<show path="chara/charB.png" name="charB" left="800" top="100" />

<text>二人が中央に歩み寄った。</text>
<moveTo name="charA" x="200" y="0" duration="2" />
<moveTo name="charB" x="-200" y="0" duration="2" />
```

::: warning 注意
複数の`moveTo`を連続して書いても、並行実行はされません。1つずつ順番に実行されます。
:::

### キャラクターの退場

```html
<say name="友人">「じゃあね」</say>
<text>友人は去っていった。</text>

<!-- 画面左へ退場 -->
<moveTo name="friend" x="-500" y="0" duration="2" />
<hide name="friend" />
```

### 画面を横切る

```html
<!-- 左端から登場 -->
<show path="chara/runner.png" name="runner" left="0" top="300" />

<!-- 右端まで走る -->
<moveTo name="runner" x="1280" y="0" duration="3" />
<hide name="runner" />

<text>誰かが駆け抜けていった。</text>
```

### 段階的な移動

```html
<show path="chara/hero.png" name="hero" left="100" top="100" />

<text>少しずつ近づいていく。</text>
<moveTo name="hero" x="100" y="0" duration="1" />

<text>さらに近づく。</text>
<moveTo name="hero" x="100" y="0" duration="1" />

<text>目の前まで来た。</text>
<moveTo name="hero" x="100" y="0" duration="1" />
```

### 上下の移動

```html
<!-- 飛び跳ねる動き -->
<show path="chara/sprite.png" name="sprite" left="400" top="300" />

<moveTo name="sprite" x="0" y="-50" duration="0.3" />
<moveTo name="sprite" x="0" y="50" duration="0.3" />
```

### 条件付き移動

```html
<moveTo name="character" x="200" y="0" if="shouldMove" />
```

## 座標系

### 画面サイズ

```
標準の画面サイズ: 1280x720

X座標: 0（左端）～ 1280（右端）
Y座標: 0（上端）～ 720（下端）
```

### 標準的な配置

```
左側: left="100"
中央: left="450"
右側: left="800"

上部: top="50"
中央: top="200"
下部: top="400"
```

### 移動量の目安

```html
<!-- 少し移動 -->
<moveTo name="hero" x="50" y="0" />

<!-- 適度に移動 -->
<moveTo name="hero" x="150" y="0" />

<!-- 大きく移動 -->
<moveTo name="hero" x="300" y="0" />

<!-- 画面を横切る -->
<moveTo name="hero" x="600" y="0" />
```

## アニメーション

### スムーズな動き

`moveTo`は60fpsで滑らかにアニメーションします：

```html
<!-- 3秒かけてゆっくり移動 -->
<moveTo name="hero" x="400" y="0" duration="3" />
```

### タイミング

- `duration`は秒単位で指定
- 小数点も使用可能（例：`0.5`、`1.5`、`2.5`）
- アニメーション終了まで次のコマンドは待機

## トラブルシューティング

### 移動しない

1. `name`属性が正しいか確認
2. `show`タグで同じ名前を指定しているか確認
3. `x`と`y`の両方が`0`になっていないか確認

```html
<!-- ❌ 移動しない（x, y が両方0） -->
<moveTo name="hero" x="0" y="0" />

<!-- ✅ 右に移動 -->
<moveTo name="hero" x="100" y="0" />
```

### 意図した位置に移動しない

相対移動であることを確認：

```html
<!-- 初期位置 left=300 -->
<show path="chara/hero.png" name="hero" left="300" top="100" />

<!-- ❌ left=500に移動させたい場合、x="500"ではない -->
<moveTo name="hero" x="500" y="0" />  <!-- left=800になる -->

<!-- ✅ 正しくは x="200" -->
<moveTo name="hero" x="200" y="0" />  <!-- left=500になる -->
```

絶対位置に移動させたい場合は、showタグで位置を指定：

```html
<!-- 絶対位置指定 -->
<show path="chara/hero.png" name="hero" left="500" top="100" />
```

## 関連タグ

- [show](/tags/show) - 画像を表示
- [hide](/tags/hide) - 画像を非表示
- [text](/tags/text) - テキストを表示

## 次のステップ

- [画像表示](/api/image) - 画像操作の概要
- [showタグ](/tags/show) - 画像の表示方法
