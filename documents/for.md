
# Forメソッド

for(itr: array, variableName: string, statement: object)

## 引数詳細

- itr: 配列など反復可能なオブジェクトを指定する。
- variableName: 取り出した値の名称。
- statement: 繰り返しの対象。itrの数だけ繰り返す。

## WebTaleScript

``` html
<FOR itr="[1,2,3]" variableName="hoge">
    反復するWTS
</FOR>
```

## Scenarioオブジェクト

```json
type: for,
variableName: 'hoge'
items: [{
    // statementで指定したScenarioオブジェクトがここに入る
        type: 'show',
        path: 'hoge', <- ここにitrの値が入る
        pos: {
          x: 1280 / 2 - 350 / 2,
          y: 0,
        },
        size: {
          width: 350,
          height: 700,
        },
      }]
```

## 処理概要

- 要素から、値を一つずつ取り出し、variableNameで指定された名称の変数を定義し、そこに値を保存する。
- 保存後、item内のScenarioオブジェクトを実行する。
- 要素の末尾までこれを行う。

## 処理詳細
