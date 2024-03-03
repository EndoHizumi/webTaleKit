# Choiceメソッド

## 引数

`choice(id:number, prompt: String,src?: {default: string, hover?:string select?: string}, Items:{id:number, onSelect: function, label: String, src?: {default: string, hover?:string select?: string})`

## WebTaleScript

```html
<choice id='' prompt=''>
	<item onSelect='' src=''>label</item>
</choice>
```

## 処理概要

　UI側に選択肢を描画する。

## 処理詳細

promptに設定した文言をメッセージウインドウに表示する。
画面中央にItemsで設定した選択肢を表示する。
文言はlabel,クリックされたら、該当するItemsの要素にあるonSelectのfunctionを実行する。
srcに値を設定されている場合、その画像を選択肢の画像として表示する。

## 引数詳細

id: 選択肢を識別するID自動で設定される。
prompt: 選択肢を表示する際の文言を設定できる。
src: 省略可。選択肢の背景画像を独自のものに設定できる。choice直下の場合は、全ての選択肢に設定される。Itemsの場合は、個別に設定される。(defaultが未選択の時の画像・hoverがマウスを乗せた時、selectが選択をクリックしたとき。default以外は省略可能)
Items: 選択肢の内容を設定できるオブジェクト（最大で６つ設定できる）
    id: 選択された選択肢を識別するための値。自動で設定される。
    onSelect: 選択肢が選択された時に設定された関数を実行する。
    label: 個別の選択肢の文言を設定できる。
