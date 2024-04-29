# ifメソッド

## 概要

入力した式で処理を分岐させることができる

## 引数詳細

if (condition: string, then: webTaleScript, else: webTaleScript)

condition: 評価するJavaScript式
then: 式がtrueの場合、実行されるscenarioオブジェクト
else: 式がfalseの場合、実行されるscenarioオブジェクト

## webTaleScript

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

## scenarioオブジェクト

```json
{
    type: 'if',
    condition: '',
    then: [],
    else:[]
}
```

## 処理詳細

入力されたJavaScript式(condition)を評価して、それがtrueの場合、setScenarioにthenの内容を渡す。
falseの場合、setScenarioにthenの内容を渡す。
