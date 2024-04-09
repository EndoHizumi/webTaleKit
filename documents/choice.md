# Choiceメソッド

## 引数

`choice(id:number, prompt: String,src?: {default: string, hover?:string select?: string}, Items:{id:number, onSelect: function, label: String, color:String, src?: {default: string, hover?:string select?: string})`

## Scenarioオブジェクト

<!-- IDはWTSからオブジェクトに変換する際に設定する -->
``` javascript
 {
    type: 'choice',
    id: number,
    prompt: String,
    items: [
      {
        id: number,
        jump: number,
        label: String,
        color: {
          default: string | rgb,
          hover: string | rgb,
          select: string | rgb
        },
        src?: { // ファイルパスを値に設定する。
            default: String,
            hover?: String,
            select?: String,
        }
      },
    ],
    src: { // ファイルパスを値に設定する。
      default: String,
      hover?: String,
      select?: String,
    }
  },
```

## WebTaleScript

```html
<choice prompt='', default='', hover='', select=''>
	<item label='' default='', hover='', select=''>
    <show path="" name="" left="" top="" look="left" wait="0.5"/>
  </item>
</choice>
```

## 処理概要

　UI側に選択肢を描画する。

## 処理詳細

promptに設定した文言をメッセージウインドウに表示する。
画面中央にItemsで設定した選択肢を表示する。
文言はlabel,クリックされたら、該当するItemsの子要素にあるWSTを実行する
srcに値を設定されている場合、その画像を選択肢の画像として表示する。

## 引数詳細

id: 選択肢を識別するID自動で設定される。
prompt: 選択肢を表示する際の文言を設定できる。
default/hover/select: 省略可。選択肢の背景画像を独自のものに設定できる。choice直下の場合は、全ての選択肢に設定される。Itemsの場合は、個別に設定される。(defaultが未選択の時の画像・hoverがマウスを乗せた時、selectが選択をクリックしたとき。default以外は省略可能)
Items: 選択肢の内容を設定できるオブジェクト（最大で６つ設定できる）
    id: 選択された選択肢を識別するための値。自動で設定される。
    jump: ジャンプする行を指定する。
    label: 個別の選択肢の文言を設定できる。
    chara: 選択肢ボタンの文字色を設定できる。色の名前かRGBで指定ができる。
