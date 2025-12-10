# 画像表示

画像表示と操作に関連する機能の概要とタグリファレンスです。

## 概要

webTaleKitでは、以下のような画像操作が可能です：

- **show タグ** - 画像やキャラクターを表示
- **hide タグ** - 画像やキャラクターを非表示
- **moveTo タグ** - 画像を移動（アニメーション）

## 主なタグ

### show タグ

画像やキャラクターを画面に表示します。

```html
<show path="chara/protagonist.png" left="300" top="100" />
```

識別名を付けて後で操作できます：

```html
<show path="chara/protagonist.png" name="hero" left="300" top="100" />
```

[show タグの詳細 →](/tags/show)

### hide タグ

画像やキャラクターを非表示にします。

```html
<hide name="hero" />
```

### moveTo タグ

画像を移動させます。

```html
<moveTo name="hero" left="500" top="100" duration="1.0" />
```

## 基本的な画像操作

### キャラクターの表示

```html
<show path="chara/protagonist.png" name="hero" left="300" top="100" />
```

### 複数のキャラクターを表示

```html
<!-- 左側にキャラクターA -->
<show path="chara/characterA.png" name="charA" left="100" top="100" />

<!-- 右側にキャラクターB -->
<show path="chara/characterB.png" name="charB" left="600" top="100" />
```

### キャラクターの表情変更

```html
<!-- 通常の表情で表示 -->
<show path="chara/hero_normal.png" name="hero" left="300" top="100" />

<!-- 笑顔に変更 -->
<show path="chara/hero_smile.png" name="hero" />
```

### キャラクターの移動

```html
<!-- 画面右に移動 -->
<moveTo name="hero" left="600" top="100" duration="1.0" />
```

### キャラクターを非表示

```html
<hide name="hero" />
```

## 背景画像

### 背景の表示

```html
<show path="background/room.jpg" name="bg" />
```

または、sceneConfigで設定：

```javascript
const sceneConfig = {
  background: 'room.jpg'
}
```

### 背景の変更

```html
<show path="background/school.jpg" name="bg" />
```

## 画像の向き

### 左向き（デフォルト）

```html
<show path="chara/character.png" look="left" />
```

### 右向き

```html
<show path="chara/character.png" look="right" />
```

## リソース定義を使用

`config.js` でリソースを定義している場合、名前で参照できます：

```javascript
// src/resource/config.js
export const chara = [
  {
    name: 'hero',
    path: '/chara/protagonist.png',
    faces: {
      normal: '/chara/protagonist_normal.png',
      smile: '/chara/protagonist_smile.png',
      sad: '/chara/protagonist_sad.png'
    }
  }
]
```

```html
<!-- pathの代わりにnameを使用 -->
<show name="hero" left="300" top="100" />

<!-- 表情を変更 -->
<show name="hero" path="faces/smile" />
```

## 画像フィルター（予定機能）

::: warning アルファ版の制限
以下のフィルター機能は、v0.3.0以降で実装予定です。
:::

将来的には、以下のフィルター効果が使えるようになります：

```html
<show path="chara/character.png" name="char">
  <filter type="sepia" value="0.5" />
  <filter type="opacity" value="0.8" />
</show>
```

## 条件付き表示

`if` 属性を使って、条件を満たす場合のみ表示できます：

```html
<show path="chara/friend.png" name="friend" if="hasMet" />
```

## 実用例

### キャラクター登場シーン

```html
<text>ドアが開き、彼女が入ってきた。</text>

<show path="chara/heroine.png" name="heroine" left="300" top="100" wait="0.5" />

<say name="ヒロイン">「お待たせしました」</say>
```

### キャラクターの移動

```html
<text>彼は近づいてきた。</text>

<moveTo name="friend" left="400" top="100" duration="2.0" />

<say name="友人">「久しぶりだな」</say>
```

### 複数キャラクターの会話

```html
<show name="protagonist" left="200" top="100" />
<show name="friend" left="600" top="100" />

<say name="主人公" pattern="normal">「おはよう」</say>
<say name="友人" pattern="smile">「おはよう！」</say>

<!-- 友人が退場 -->
<hide name="friend" />
```

### 背景の切り替え

```html
<text>場面が変わり、教室に移動した。</text>

<show path="background/classroom.jpg" name="bg" />

<text>そこには彼女がいた。</text>
<show path="chara/heroine.png" name="heroine" left="300" top="100" />
```

## 画像の配置

### 標準的な配置

```
画面幅: 1280px
画面高さ: 720px

左端のキャラクター: left="100"
中央のキャラクター: left="450"
右端のキャラクター: left="800"

標準の高さ: top="100"
```

### 3人配置の例

```html
<show name="charA" left="100" top="100" />
<show name="charB" left="450" top="100" />
<show name="charC" left="800" top="100" />
```

## 関連タグ

- [show](/tags/show) - 画像を表示
- [hide](/tags/hide) - 画像を非表示
- [moveTo](/tags/moveto) - 画像を移動
- [say](/tags/say) - キャラクターのセリフを表示（自動表示予定）

## 次のステップ

- [テキスト表示](/api/text) - テキスト関連の機能
- [音声](/api/sound) - 音声再生の機能
- [制御構文](/api/control) - 条件分岐とジャンプ
