# Showメソッド

## 引数

`show(path: string, name?: string, pos: {x: number, y: number}, look: ['right' | 'left'] ､ entry: {time: number, wait: boolean} ) -> Object`

## WebTaleScript

```html
<show path="" name="" left="" top="" look="left" wait="0.5"/>
```

## 処理概要

　ゲーム画面(canvas)側に指定した画像を表示する。

## 処理詳細

pathかnameで指定する。
pathの場合は、画像を直接読み込みに行く。
nameの場合は、ResourceManagerが管理するリソースマッパーオブジェクトから、画像を読み込む。
表示した画像と表示座標は、pathかnameをキーにしてリソース管理オブジェクトに追加する。（pathとnameが両方が設定されている場合、画像には、keyにnameの値をvalueにpathを設定する。座標管理にはnameをkeyに。valueに表示座標を設定する）

## 引数詳細

path: 表示する画像のファイルパスを指定する。
name: リソース定義オブジェクトのnameの値
ファイル名の前にスラッシュで区切ってリソース種類を指定する(記述例: chara/hogehoge)
表示済み画像を変更する場合、同じnameを指定する。
pos: 画像を表示する座標を指定する。
look: 表示画像の向きを指定できる。デフォルト値は、"Left"
entry: 表示を開始するまでの時間と表示待ちの設定を指定できる。WTSの場合は、本属性を指定した時点で、表示待ちが有効になり、値が遅延時間と認識される。値の指定がない場合は、１秒に設定される。

## メモ

showが返すObjectには操作用のメソッドが実装されている

 - 位置変更
 - アニメーションの設定
 - 透明度の設定
 - セピア化
 - モノクロ化
 - ぼかし
 - フィルターの設定・解除(表示・非表示時の特殊効果）
使えるフィルターはcanvasに準拠する
