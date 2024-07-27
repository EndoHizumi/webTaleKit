# ifメソッド

## 概要

入力した式で処理を分岐させることができる。
属性として、ほかのタグに記述したときは、式がtrueと評価されたときに、タグを実行する。

## 引数詳細

if (condition: string, then: webTaleScript, else: webTaleScript)

condition: 評価するJavaScript式
then: 式がtrueの場合、実行されるscenarioオブジェクト
else: 式がfalseの場合、実行されるscenarioオブジェクト

## webTaleScript(タグ)

```html
    <if condition="">
        <then>
            <!-- trueの場合、処理したいWTSをここに書く -->
        </then>
        <else>
            <!-- falseの場合、処理したいWTSをここに書く -->
        </else>
    </if>

```

## webTaleScript(属性)

```html
<!-- trueの場合、テキストが表示される -->
    <text if="hoge==1">
        hogeは、１だったよ！
    </text>

```

## scenarioオブジェクト(タグ)

```json
{
    type: 'if',
    condition: '',
    content: {
        type:'then',
        content: [],
    },
    content: {
        type:'else',
        content: [],
    }
}
```

## scenarioオブジェクト(属性)

```json
{
    type: 'text',
    if: '',
}
```

## 処理詳細

入力されたJavaScript式(condition)を評価して、それがtrueの場合、setScenarioにthenの内容を渡す。
falseの場合、setScenarioにthenの内容を渡す。
