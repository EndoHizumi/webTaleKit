# callタグ機能デモ

このHTMLファイルは、callタグの修正が正しく動作していることを確認するためのスタンドアロンデモです。

## 使用方法

### オプション1: ファイルを直接開く
1. `demo_call_tag_fix.html` をブラウザで直接開いてください（ダブルクリック）
2. デモが自動的に実行され、結果が表示されます

### オプション2: ローカルサーバーで開く
```bash
# リポジトリのルートディレクトリで実行
python3 -m http.server 8080

# ブラウザで以下のURLを開く
# http://localhost:8080/demo_call_tag_fix.html
```

### オプション3: GitHub Pagesで公開
このファイルをGitHub Pagesにデプロイすることで、オンラインでデモを確認できます。

## デモ内容

このデモは以下の4つのテストセクションで構成されています：

### ■テスト1: 値の代入
- `hoge = 1` の実行
- 変数値の表示と条件分岐の確認

### ■テスト2: 値の変更
- `hoge = 2` の実行
- 変数値の更新確認

### ■テスト3: 計算式
- `count = count + 1` の実行（2回）
- インクリメント操作の確認

### ■テスト4: 複雑な式
- `result = hoge * count` の実行
- 複数の変数を使った計算の確認

## 修正内容

**修正前:**
```javascript
const context = { ...this.sceneFile }
const func = new Function(...Object.keys(context), code)
return func.apply(null, Object.values(context))
```

**修正後:**
```javascript
const context = new Proxy(this.sceneFile, {
  get: (target, key) => target[key],
  set: (target, key, value) => {
    target[key] = value
    return true
  }
})
const func = new Function('context', `with(context) { ${code} }`)
return func.call(null, context)
```

この修正により、callタグで変数に代入した値が正しくsceneFileのプロパティを更新するようになり、if属性や{{変数}}展開が正しく動作するようになりました。

## 期待される結果

すべてのテストで緑色の「✓」マークが表示されれば、修正が正しく動作しています。
赤色の「✗」マークは表示されないはずです。
