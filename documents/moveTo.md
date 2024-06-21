# MoveToメソッド

## 引数

```javascript
moveTo(name: string, left: number, top: number)
```

## Scenarioオブジェクト

``` javascript
 {
    type: 'moveTo',
    name: 'zundamon',
    left: 10,
    top: 0,
    durning:1
  },
```

## WebTaleScript

```html
<moveTo name="zundamon", left="10", top="0" durning="1"/>
```

## 処理概要

　nameで指定した画像を今の表示位置から指定座標まで、アニメーションさせながら、移動する。

## 処理詳細

1. nameで指定されたKeyをもつImageObjectをdisplayedImagesから取得する。
2. leftとtopの値と取得したImageObjectのposの和を求める。(最終地点の算出)
3. leftとtopの商を（60*during）で出す。（１フレーム単位の移動量の算出）
4. 取得したImageObjectのposと3で求めた商で和を出す。（加算実行）
5. drawer.drawCanvasを呼びだす。引数は、取得したImageObjectと、4で求めた和（画像の移動実行）
6. 5を取得したImageObjectのposの値が、2で求めた値になるまで、繰り返す。

const target = this.displayedImages[name];
const dest = { left: target.pos.x + left, top: target.pos.y + top };
const move_per_frame_x = left / (60 * durning);
const move_per_frame_y = top / (60 * durning);
const move = () => {
  target.pos.x += move_per_frame_x;
  target.pos.y += move_per_frame_y;
  drawer.drawCanvas(target, { x: target.pos.x, y: target.pos.y });
  if (
    (left > 0 && target.pos.x <= dest.left) ||
    (left < 0 && target.pos.x >= dest.left) ||
    (top > 0 && target.pos.y <= dest.top) ||
    (top < 0 && target.pos.y >= dest.top)
  ) {
    requestAnimationFrame(move);
  }
};
requestAnimationFrame(move);

## 引数詳細

name: 移動対象のImageObject名（Pathで作成した場合は、ファイル名がnameに設定される）
left: 横軸の移動量、現在の座標をスタートとして、移動する。（正の数の場合、右に、負の数の場合は、左に移動する。）
top: 縦軸の移動量、現在の座標をスタートとして、移動する。（正の数の場合、上に、負の数の場合は、下に移動する。）
durning: アニメーションが完了するまでの時間。この時間内に、指定量の移動が完了するようにスケジュールされる。
