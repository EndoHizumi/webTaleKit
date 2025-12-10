# タグリファレンス

webTaleKitで使用できる全てのタグの詳細なリファレンスです。

## タグの使い方

WebTaleScript (WTS) では、HTMLライクなタグを使ってシナリオを記述します。各タグには固有の機能と属性があります。

## タグ一覧

### テキスト・セリフ

- [text](/tags/text) - 地の文（ナレーション）を表示
- [say](/tags/say) - キャラクターのセリフを表示

### 画像操作

- [show](/tags/show) - 画像を表示
- [hide](/tags/hide) - 画像を非表示
- [moveTo](/tags/moveto) - 画像を移動

### 音声

- [sound](/tags/sound) - 音声を再生・停止

### 選択肢

- [choice](/tags/choice) - 選択肢を表示

### 制御構文

- [jump](/tags/jump) - シナリオの指定行にジャンプ
- [if](/tags/if) - 条件分岐
- [route](/tags/route) - 別のシーンに移動

## 共通属性

全てのタグで使用できる共通属性があります：

### if 属性

条件を満たす場合のみタグを実行します：

```html
<text if="hasKey">鍵を持っている。</text>
<show path="chara/friend.png" if="hasMet" />
```

詳細は [if タグ](/tags/if) を参照してください。

## 次のステップ

- [APIリファレンス](/api/overview) - 機能別の概要
- [シーンファイル](/guide/scene-files) - シナリオの書き方
