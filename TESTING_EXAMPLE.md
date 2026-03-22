# Example ifテストの動作確認方法

## 問題
exampleのif_testを実行しても変数の値が変わらない問題を修正しました。

## 原因
- `example/src/index.js`が`webtalekit-alpha/src/core/`をインポートしていましたが、パッケージには`dist`ディレクトリのビルド済みファイルのみが含まれています
- exampleは親ディレクトリのwebtalekit-alphaパッケージを正しく参照できていませんでした

## 修正内容
1. インポートパスを`webtalekit-alpha/dist/src/core/`に変更
2. webtalekit-alphaをローカルパッケージとしてインストール
3. webpack設定の正規表現エスケープを修正

## 動作確認手順

### ステップ1: パッケージのビルド
```bash
cd /home/runner/work/webTaleKit/webTaleKit
npm install
npm run build
npm pack
```

### ステップ2: Exampleへのインストール
```bash
cd example
npm install
npm install ../webtalekit-alpha-0.2.12.tgz
```

### ステップ3: 開発サーバーの起動
```bash
npm run dev
```

### ステップ4: ブラウザで確認
ブラウザで以下のURLを開きます：
```
http://localhost:8080?scene=if_test
```

## 期待される動作

if_testシーンを開くと、以下のような動作が確認できます：

1. **初期状態**
   - 変数hogeの初期値: 2
   - 変数countの初期値: 0

2. **テスト1: 値の代入**
   - `<call method="hoge = 1" />`実行後
   - hogeの値が1に変更される
   - ✓ hoge==1の条件で文章が表示される

3. **テスト2: 値の変更**
   - `<call method="hoge = 2" />`実行後
   - hogeの値が2に変更される
   - ✓ hoge==2の条件で文章が表示される

4. **テスト3: 計算式**
   - `<call method="count = count + 1" />`を2回実行
   - countが0→1→2と増加する
   - 各段階で正しい条件分岐が機能する

5. **テスト4: 複雑な式**
   - `<call method="result = hoge * count" />`実行
   - result = 2 × 2 = 4が計算される
   - ✓ result==4の条件で文章が表示される

## トラブルシューティング

### webpack compilation failed
- `npm install`が正しく実行されているか確認
- `node_modules/webtalekit-alpha`が存在するか確認

### 変数値が変わらない
- ブラウザのキャッシュをクリア（Ctrl+Shift+R または Cmd+Shift+R）
- `npm run dev`で開発サーバーを再起動

### Cannot find module 'webtalekit-alpha/dist/src/core/'
- 親ディレクトリで`npm pack`を実行
- exampleディレクトリで`npm install ../webtalekit-alpha-0.2.12.tgz`を再実行

## 備考
- この修正により、callタグによる変数代入がProxyを使って正しくsceneFileのプロパティを更新するようになりました
- if属性や{{変数}}展開も正常に動作します
