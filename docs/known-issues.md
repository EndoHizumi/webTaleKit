# 既知の不具合メモ

cafe-story（`C:\Users\endoh\Dropbox\Development\cafe-story`）の開発中に見つかった、
webtalekit本体の不具合をまとめる。

## 3. `<add>`/`<remove>`タグがCommandRegistryに登録されておらず実行時エラーになる

### 症状

`.scene`ファイルで`<add>`/`<remove>`タグを使うと、パース自体は成功するが
シナリオ実行時に次の例外が発生する。

```
Error: Command type "add" is not defined
```

### 原因

- `parser/checker.js`には`add`/`remove`がトップレベルタグ・既知属性
  （`add`: `target`/`name`/`class`, `remove`: `name`）として登録されており、
  `.scene`ファイルのパースは問題なく通る。
- DOM要素の追加・削除ロジックも`src/core/domElementHandler.ts`の
  `addElement()`/`removeElement()`/`setVisibility()`として実装済みで、
  `Core`のコンストラクタでインスタンス化もされている。
- しかし、シナリオ実行時にこれらのメソッドを呼び出すコードが
  どこにも存在しなかった。`src/commands/index.ts`の
  `registerBuiltinCommands()`（タグ名→ハンドラの登録テーブル）に
  `add`/`remove`のハンドラが登録されていなかったため。

git blameで経緯を追うと:

1. `d180d1b`「add/removeタグを追加した」時点では、当時Core直書きだった
   `commandList`オブジェクトに`add`/`remove`ハンドラが登録されていた
   （`add: (args) => this.domElementHandler.addElement(args)` 等）。
2. `a6b3394`「CommandRegistry導入」で、`commandList`方式から
   `CommandRegistry`（`src/commands/*Handler.ts`を個別クラス化して
   `registerBuiltinCommands()`で登録する方式）へ全面リファクタされた際、
   「既存16タグのハンドラを個別クラスとして移植」の対象リストに
   `add`/`remove`が含まれておらず、移植から漏れた。

以降、`AddHandler`/`RemoveHandler`に相当するクラスが存在しない状態が
続いており、`domElementHandler.addElement`/`removeElement`を呼び出す
コードは`domElementHandler.ts`自身以外どこにもなかった。テストも
一切なかったため、CIでも検知されていなかった。

### 対応済み

- `src/commands/AddHandler.ts`/`RemoveHandler.ts`を新設し、既存の
  `HideHandler`等と同じパターンで`context.core.domElementHandler.addElement`/
  `removeElement`に委譲するようにした。
- `src/core/CommandRegistry.ts`の`CoreFacade`に`domElementHandler`を追加し、
  ハンドラから型安全にアクセスできるようにした。
- `src/commands/index.ts`の`registerBuiltinCommands()`に`add`/`remove`を登録。
- `src/core/CommandRegistry.test.ts`の登録タグ一覧テストに`add`/`remove`を追加。
- `src/commands/AddHandler.test.ts`を追加し、`AddHandler`/`RemoveHandler`が
  `domElementHandler`に正しく委譲することを確認。

なお、`CommandRegistry.ts`が`domElementHandler.ts`をimportするようになった
ことで、`tsc`のrootDir推論が`nodeToDomConverter.ts`経由で`parser/checker.js`
（`src/`の外）まで巻き込み、`npm run build`の出力が`dist/src/src/...`のように
二重ネストする不具合が本ブランチ単体でも再現したため、あわせて
`tsconfig.json`の`outDir`変更（`./dist/src/` → `./dist/`）と
`include`への`domElementHandler.ts`/`nodeToDomConverter.ts`追加、
テストファイル除外（`**/*.test.ts`）も行った（npm公開パッケージのビルド
不具合そのものについては別途調査済み。詳細は別ブランチ
`fix/npm-package-build`を参照）。

また、`jest.config.js`に`testPathIgnorePatterns: ['/node_modules/', '/dist/']`
を追加した。`dist/`配下のビルド成果物（`checker.test.ts`等）がJestの
テスト対象に含まれてしまっており、上記`outDir`変更と組み合わさることで
`ts-jest`が`outDir`計算に失敗してクラッシュする状態になっていたため。
