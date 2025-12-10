# show タグ

画像やキャラクターを画面に表示します。

## 構文

```html
<show path="画像パス"
      name="識別名"
      left="X座標"
      top="Y座標"
      look="向き"
      wait="待機時間" />
```

## 属性

| 属性 | 型 | 必須 | 説明 |
|------|-----|------|------|
| path | string | ○ | 表示する画像のファイルパス |
| name | string | × | リソースの識別名（後で参照する際に使用） |
| left | number | × | X座標（ピクセル単位） |
| top | number | × | Y座標（ピクセル単位） |
| look | 'left' \| 'right' | × | 画像の向き（デフォルト: 'left'） |
| wait | number | × | 表示開始までの待機時間（秒単位） |
| if | string | × | 条件式（trueの場合のみ実行） |

## 基本的な使い方

### 画像を表示

```html
<show path="chara/protagonist.png" />
```

### 座標を指定して表示

```html
<show path="chara/protagonist.png" left="300" top="100" />
```

### 識別名を付けて表示

後で `hide` や `moveTo` で操作する場合は、`name` 属性を指定します：

```html
<show path="chara/protagonist.png" name="hero" left="200" top="100" />
```

### 向きを指定

```html
<!-- 左向き（デフォルト） -->
<show path="chara/character.png" look="left" />

<!-- 右向き -->
<show path="chara/character.png" look="right" />
```

## リソース定義を使用

`config.js` でリソースを定義している場合、名前で参照できます：

```javascript
// src/resource/config.js
export const chara = [
  {
    name: 'hero',
    path: '/chara/protagonist.png'
  }
]
```

```html
<!-- pathの代わりにnameを使用 -->
<show name="hero" left="300" top="100" />
```

### リソース種別を指定

スラッシュで区切ってリソース種類を指定できます：

```html
<show name="chara/hero" left="300" top="100" />
<show name="background/room" />
<show name="picture/item" left="500" top="200" />
```

## 表示タイミング

### 待機時間を設定

`wait` 属性で表示開始までの時間を設定できます：

```html
<!-- 0.5秒後に表示 -->
<show path="chara/character.png" wait="0.5" />

<!-- 2秒後に表示 -->
<show path="chara/character.png" wait="2" />
```

### 即座に表示

```html
<!-- waitを指定しない場合は即座に表示 -->
<show path="chara/character.png" />
```

## 既存の画像を更新

同じ `name` を指定すると、既存の画像を更新できます：

```html
<!-- 最初に表示 -->
<show path="chara/hero_normal.png" name="hero" left="300" top="100" />

<!-- 表情を変更（座標はそのまま） -->
<show path="chara/hero_smile.png" name="hero" />

<!-- 位置を変更（画像はそのまま） -->
<show name="hero" left="400" top="100" />
```

## キャラクターの表情変更

リソース定義で複数の表情を定義している場合：

```javascript
// config.js
export const chara = [
  {
    name: 'hero',
    path: '/chara/hero.png',
    faces: {
      normal: '/chara/hero_normal.png',
      smile: '/chara/hero_smile.png',
      sad: '/chara/hero_sad.png'
    }
  }
]
```

```html
<!-- 通常の表情で表示 -->
<show name="hero" left="300" top="100" />

<!-- 笑顔に変更 -->
<show name="hero" path="faces/smile" />

<!-- 悲しい表情に変更 -->
<show name="hero" path="faces/sad" />
```

## 複数のキャラクターを表示

```html
<!-- 左側にキャラクターA -->
<show path="chara/characterA.png" name="charA" left="100" top="100" />

<!-- 右側にキャラクターB -->
<show path="chara/characterB.png" name="charB" left="600" top="100" />

<!-- 中央にキャラクターC -->
<show path="chara/characterC.png" name="charC" left="350" top="100" />
```

## 背景画像の表示

背景画像も `show` タグで表示できます：

```html
<show path="background/room.jpg" name="bg" />
```

または、`sceneConfig` で設定することもできます：

```javascript
const sceneConfig = {
  background: 'room.jpg'
}
```

## 条件付き表示

`if` 属性を使って、条件を満たす場合のみ表示できます：

```html
<show path="chara/friend.png" name="friend" if="hasMet" />
```

## フィルター効果（予定機能）

::: warning アルファ版の制限
以下のフィルター機能は、v0.3.0以降で実装予定です。
:::

将来的には、子要素でフィルターを指定できるようになります：

```html
<show path="chara/character.png" name="char">
  <filter type="sepia" value="0.5" />
  <filter type="opacity" value="0.8" />
</show>
```

## 戻り値

`show` タグは、表示した画像を操作するためのオブジェクトを返します。JavaScript側で直接操作する場合に使用できます：

```javascript
const heroImage = engine.show({
  path: 'chara/hero.png',
  name: 'hero',
  left: 300,
  top: 100
});

// 画像を操作
heroImage.setOpacity(0.5);  // 透明度を設定
heroImage.move(400, 100);    // 移動
```

## 関連タグ

- [hide](/api/tags/hide) - 画像を非表示にする
- [moveTo](/api/tags/moveto) - 画像を移動する
- [say](/api/tags/say) - キャラクターのセリフを表示（自動的にキャラクターも表示）

## 注意事項

- `path` または `name` のいずれかは必須です
- 両方を指定した場合、`path` が優先されますが、識別には `name` が使用されます
- 座標を指定しない場合は、デフォルト位置（画面中央など）に表示されます
- 同じ `name` で複数回 `show` を実行すると、画像が更新されます
