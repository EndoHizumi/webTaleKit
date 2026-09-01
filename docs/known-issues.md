# 既知の不具合メモ

cafe-story の開発中に見つかった、
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

### 対応案

- ローカルの `webTaleKit` リポジトリで `npm run build` を実行し、
  `dist/` に `src/index.js` と `src/core/domElementHandler.js` が
  正しく出力されることを確認してからpublishし直す（`0.3.1`など）。
- publish前に `npm pack --dry-run` で実際に含まれるファイル一覧を確認する運用にすると、
  今回のような欠落・混入に気付きやすい。

---

## 2. HTTP通信タグ（`<text get=".."/>` 等）の不具合

`src/core/index.js` の `httpHandler` （0.2.14系・ローカル0.3.0系どちらも同一コード）。

### 2-1. GET/HEADでも常にリクエストボディを付けてしまう

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

**対応済み**: `src/core/index.js`の`httpHandler`で、`method`が`GET`/`HEAD`の
場合のみ`fetchOptions`に`body`キーを含めないよう修正した。

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

**対応済み**: `<header>`/`<data>`タグ自体が存在しない場合も含めて
`(line.content.filter(...)[0]?.content || []).reduce(...)`という形に修正し、
空タグ・タグ省略のどちらでも例外にならないようにした。

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
  （0.3.0系ソース）で修正済み（2026-09-01対応）。
