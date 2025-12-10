# hide タグ

画像やキャラクターを非表示にします。

## 基本的な使い方

```html
<show path="chara/protagonist.png" name="hero" left="300" top="100" />
<text>主人公が立ち去った。</text>
<hide name="hero" />
```

## 属性

| 属性 | 型 | 必須 | デフォルト | 説明 |
|------|------|------|----------|------|
| name | string | ✓ | - | 非表示にする画像の識別子（showタグで指定したもの） |
| mode | 'cg' | × | - | 'cg'を指定すると、以前非表示にした背景を復元 |
| transition | 'fade' | × | - | フェードアウト効果を適用 |
| duration | number | × | 1000 | フェード効果の時間（ミリ秒） |
| if | string | × | - | 条件式（trueの場合のみ実行） |

## 使用例

### 基本的な非表示

```html
<show path="chara/friend.png" name="friend" left="400" top="100" />
<say name="友人">「また明日」</say>
<hide name="friend" />
```

### フェードアウト効果

```html
<hide name="friend" transition="fade" duration="2000" />
```

2秒かけてゆっくりとフェードアウトします。

### CGモードでの非表示

```html
<!-- 背景の上にCG画像を表示 -->
<show path="cg/event1.png" name="cg_event" mode="cg" />

<!-- CG画像を消して元の背景に戻す -->
<hide name="cg_event" mode="cg" />
```

### 条件付き非表示

```html
<hide name="character" if="shouldLeave" />
```

## 実用例

### キャラクターの退場

```html
<say name="友人">「じゃあ、また明日ね」</say>
<text>友人は手を振って去っていった。</text>
<hide name="friend" transition="fade" duration="1500" />
```

### 全てのキャラクターを消す

```html
<hide name="character1" />
<hide name="character2" />
<hide name="character3" />
<text>誰もいなくなった。</text>
```

### イベントCGの表示と非表示

```html
<!-- 通常シーン -->
<show path="background/room.jpg" name="bg" />
<show path="chara/heroine.png" name="heroine" left="300" top="100" />

<text>そのとき、特別な瞬間が訪れた。</text>

<!-- イベントCGを表示（背景とキャラクターは一時的に隠れる） -->
<show path="cg/special_moment.png" name="cg_special" mode="cg" />

<text>忘れられない思い出となった。</text>

<!-- 元のシーンに戻る -->
<hide name="cg_special" mode="cg" />

<say name="ヒロイン">「ありがとう」</say>
```

## 注意事項

### nameは必須

`show`タグで指定した`name`属性と同じ値を使用する必要があります：

```html
<!-- ❌ 間違い：nameが指定されていない -->
<show path="chara/hero.png" left="300" top="100" />
<hide name="hero" />  <!-- エラー：heroという名前は存在しない -->

<!-- ✅ 正しい -->
<show path="chara/hero.png" name="hero" left="300" top="100" />
<hide name="hero" />
```

### transitionとduration

`transition="fade"`を指定しない場合、`duration`は無視されます：

```html
<!-- durationは効果なし（transitionが指定されていない） -->
<hide name="character" duration="2000" />

<!-- フェード効果が適用される -->
<hide name="character" transition="fade" duration="2000" />
```

### CGモードの動作

`mode="cg"`は、背景の上に一時的にCG画像を表示する場合に使用します。hideでCGを消すと、元の背景とキャラクターが自動的に復元されます。

## 関連タグ

- [show](/tags/show) - 画像を表示
- [moveTo](/tags/moveto) - 画像を移動
- [text](/tags/text) - テキストを表示

## 次のステップ

- [画像表示](/api/image) - 画像操作の概要
- [showタグ](/tags/show) - 画像の表示方法
