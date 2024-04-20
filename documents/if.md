# ifメソッド

## 概要

入力した式で処理を分岐させることができる

## 引数詳細

if (exp: string, elseif: webTaleScript, else: webTaleScript, items: webTaleScript)

exp: 評価するJavaScript式
items: 式がtrueの場合、実行されるscenarioオブジェクト
elseif: ifの式がfalseでelseifの式がtrueの場合、実行されるscenarioオブジェクト
items: 式がtrueの場合、実行されるscenarioオブジェクト

## webTaleScript

```html
    <if exp="">
        <!-- trueの場合、処理したいWTSをここに書く -->
        <elseif exp="">
            <!-- falseの場合、処理したいWTSをここに書く -->
        </elseif>
        <else>
            <!-- falseの場合、処理したいWTSをここに書く -->
        </else>
    </if>

```

## scenarioオブジェクト

```json
{
    type: 'if',
    exp: '',
    items: [],
    elseif_{exp}: [], // expの式をもとにUUIDを生成して、{exp}の部分と置換する。
    else:[]
}
```

## 処理詳細

入力されたJavaScript式を評価して、それがtrueの場合、setScenarioにitemsの内容を渡す。
falseの場合、elseifの名前を持つプロパティを列挙して、elseifがあり、値があれば、それの式を評価する。それがtrueの場合、setScenarioにelseifのitemsの内容を渡す。
ifの式がfalse且つ elseifの式が、全て falseの場合、elseの子要素をsetScenarioにelseの内容を渡す。
