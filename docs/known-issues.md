# 既知の不具合メモ

cafe-story（`C:\Users\endoh\Dropbox\Development\cafe-story`）の開発中に見つかった、
webtalekit本体の不具合をまとめる。

## 1. npm公開パッケージ `webtalekit@0.3.0` が壊れている

npm registry (`https://registry.npmjs.org/webtalekit`) から `webtalekit@0.3.0` を
実際にインストールして中身を検証したところ、ビルドが通らない状態だった。

検証方法:
```bash
mkdir tmp && cd tmp && npm init -y
npm install webtalekit@0.3.0
find node_modules/webtalekit -type f | sort
```

### 1-1. `src/core/domElementHandler.js` が同梱されていない

`src/core/index.js` は次のようにインポートしているが、
`domElementHandler.js`（`.ts`をコンパイルしたもの）が公開パッケージ内に存在しない。

```js
import { DomElementHandler } from './domElementHandler'
```

ローカルの開発リポジトリ（このリポジトリ）には `src/core/domElementHandler.ts` が
存在するので、`npm run build` でのコンパイル・コピー漏れ、もしくは
`domElementHandler.ts` 追加後にビルドし直さないままpublishした可能性が高い。

この状態だと `import { Core } from 'webtalekit/src/core/'` は
モジュール解決エラーで確実に失敗する（Node/webpackどちらでも）。

再現ログ（Node ESMローダーでの検証、`./drawer`など他の相対importも拡張子なしで
書かれているため実際にはそちらで先に落ちるが、原因は同種）:
```
Cannot find module '.../node_modules/webtalekit/src/core/drawer' imported from
'.../node_modules/webtalekit/src/core/index.js'
```

### 1-2. `src/index.js`（package.jsonの`main`）自体が存在しない

`package.json`:
```json
"main": "./src/index.js"
```
だが、公開パッケージに `src/index.js` が含まれていない。
パッケージのエントリーポイントが丸ごと欠落している。

### 1-3. パッケージ自身の中に `webtalekit-0.3.0.tgz` が同梱されている

`node_modules/webtalekit/webtalekit-0.3.0.tgz` というファイルが公開物に含まれていた。
`npm pack` の生成物を誤って次のpublishに含めてしまったと思われる。
中身を展開して確認したが、同じく `domElementHandler.js` などは入っておらず、
救済版にはなっていない。

### 1-4. テストファイルが混入している

`parser/checker.test.ts` が公開パッケージに含まれている。実害はないが、
`.npmignore` または `package.json` の `files` フィールドの設定漏れと思われる。

### 対応案・修正内容

根本原因は3つ重なっていた:

1. `tsconfig.json`の`include`に`src/core/domElementHandler.ts`と
   `src/core/nodeToDomConverter.ts`が含まれておらず、`tsc`が
   そもそもコンパイルしていなかった（1-1の直接原因）。→ `include`に追加。
2. `nodeToDomConverter.ts`は`../../parser/checker`（`src/`の外）を
   importしているため、上記2ファイルを`include`に足しただけだと
   `tsc`が共通rootDirを`src/`ではなくプロジェクトルートと誤推論し、
   出力が`dist/src/src/core/*.js`のように二重ネストしてしまい、
   `domElementHandler.js`だけでなく`drawer.js`など**既存のファイルも
   すべて**`index.js`から見て解決できない場所に出力される状態になっていた
   （上記の`Cannot find module '.../src/core/drawer'`の再現ログと一致）。
   → `tsconfig.json`の`outDir`を`./dist/src/`から`./dist/`に変更し、
   ルートディレクトリの推論結果と整合させた。
3. `package.json`の`"main": "./src/index.js"`は、ソースにもビルド後にも
   存在しないファイルを指していた（1-2）。実際のエントリーポイントは
   `src/core/index.js`のため`main`を修正。

あわせて:

- `.npmignore`に`*.tgz`を追加（1-3の再発防止）。
- `package.json`に`"files": ["src", "parser", "engineConfig.json"]`を追加し、
  publish時に含めるファイルをホワイトリスト化（`dist/`配下に紛れ込んだ
  `.tgz`などの余計なファイルが誤って公開物に入らないようにした）。
- ビルドスクリプトと`tsconfig.json`の`exclude`に`**/*.test.ts`を追加し、
  `dist/parser/checker.test.ts`や`dist/src/commands/TriggerHandler.test.ts`
  など、テストファイルが出力・publish対象に混入しないようにした（1-4）。

修正後、`npm run build`→`dist`で`npm pack --dry-run`を実行し、
`domElementHandler.js`等が正しい場所に出力されテストファイルが
含まれないこと、`main`のimportチェーンがすべて解決できることを確認済み。
`npm run test`（210 tests）もパスすることを確認した。

次回publish時は`0.3.1`などにバージョンを上げ、
`npm run build && cd dist && npm pack --dry-run`で内容を確認してから
publishする運用にすると、今回のような欠落・混入に再度気付きやすい。

---

## 2. HTTP通信タグ（`<text get=".."/>` 等）の不具合

`src/core/index.js` の `httpHandler` （0.2.14系・ローカル0.3.0系どちらも同一コード）。

### 2-1. GET/HEAD/DELETEでも常にリクエストボディを付けてしまう

```js
const response = await fetch(line.get || line.post || line.put || line.delete, {
  method: line.get ? 'GET' : line.post ? 'POST' : line.put ? 'PUT' : 'DELETE',
  headers: headers,
  body: JSON.stringify(body),
})
```

`method`に関わらず常に`body`を付与しているため、ブラウザの仕様上ボディを持てない
GET/HEADリクエストで `TypeError: Request with GET/HEAD method cannot have body` が
発生する。`get`属性を使った例はすべて失敗する。

**対応案**: `GET`/`HEAD`のときは`body`を渡さない（`method`が`GET`/`HEAD`のときのみ
`fetch`のオプションから`body`キー自体を除く）。

### 2-2. `<header>`/`<data>`を空タグにすると例外になる

```js
const headers = line.content
  .filter((content) => content.type === 'header')[0]
  .content.reduce(/* ... */)
```

`<header></header>`のように子要素が0個のタグを書くと、パーサーが
`content: undefined`（または存在しないプロパティ）を返し、`.content.reduce(...)`が
`TypeError: Cannot read properties of undefined (reading 'reduce')`で落ちる。
送るヘッダー・ボディが特にない場合でも、ダミーの子要素を最低1つ入れないと
使えない状態になっている。

**対応案**: `content.content` が配列でない場合は空オブジェクトとして扱う
（`(content.content || []).reduce(...)`など）。

### 2-3. （0.2.14では未修正・ローカル0.3.0では修正済み）失敗時レスポンスの`json`未定義参照

`webtalekit-alpha@0.2.14`（cafe-storyが現在使用しているバージョン）:
```js
} else {
  this.sceneFile.res = json  // ← elseブロック内では`json`が未定義（ReferenceError）
  line.error = line.content.filter((content) => content.type === 'error')[0].content
}
```
`json`は`if (response.ok)`ブロック内でのみ`const`宣言されているため、
リクエストが失敗した場合（`response.ok`が`false`）に到達する`else`ブロックで
`ReferenceError: json is not defined`になる。

ローカルの`webTaleKit`リポジトリ（0.3.0系ソース）では、`else`ブロック内でも
`const json = await response.json()`が追加されており、**この点はすでに修正済み**。
0.2.14系を使い続ける場合はこの修正が含まれていない点に注意。

---

## 動作確認環境

- cafe-story: `webtalekit-alpha@0.2.14`（npm公開版、正常動作）
- 上記npm検証: `webtalekit@0.3.0`（npm公開版、ビルド不可）
- HTTPタグの2-1/2-2は、ローカル`webTaleKit`リポジトリの`src/core/index.js`
  （0.3.0系ソース）でも再現するコードのまま残っている（2026年時点）。
