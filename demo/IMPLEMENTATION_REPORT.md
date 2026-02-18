# 「初音の調べ」サンプルゲーム 実装レポート

**作成日**: 2026-02-16
**プロジェクト**: WebTaleKit デモゲーム (`demo/`)

---

## 1. 作業概要

WebTaleKitエンジンの主要機能をストーリー仕立てで体験できるサンプルゲーム「初音の調べ」を `demo/` ディレクトリに新規作成した。プログラマーの主人公と案内人「ミューズ」が、エンジンの各機能を紹介しながら進行する全12シーン構成のビジュアルノベル。

---

## 2. 実装フェーズと作業内容

### Phase 1: プロジェクトセットアップ

| ファイル | 内容 |
|---|---|
| `demo/package.json` | npm設定。`example/`をベースに作成 |
| `demo/webpack.config.js` | webpack設定。`example/`と同一構造 |
| `demo/engineConfig.json` | エンジン設定（タイトル「初音の調べ」、解像度1280x720） |
| `demo/src/index.js` | エントリーポイント。URLクエリパラメータでシーン指定対応 |
| `demo/src/template.html` | 外枠HTML（`<div id="gameContainer">`） |
| `demo/.gitignore` | `node_modules/`, `dist/`, `src/js/*` を除外 |

### Phase 2: UIテンプレート作成

| ファイル | 内容 |
|---|---|
| `demo/src/screen/main.html` | VSCode風ダークテーマのゲームUI |

UIの特徴:

- 背景色 `#1e1e1e`（VSCodeのデフォルトダークテーマ）
- メッセージウィンドウ: 半透明ダーク背景 + `#007acc` の上部ボーダー
- ステータスバー: `#007acc`（VSCodeのステータスバー色）
- フォント: `Noto Sans JP` + `Consolas` のフォールバック
- 名前表示: `#569cd6`（VSCodeのキーワード色）
- 必須DOM要素: `#messageWindow`, `#messageView`, `#nameView`, `#interactiveView`, `#waitCircle`

### Phase 3: プレースホルダーアセット配置

`example/src/resource/` から全リソースを `demo/src/resource/` にコピー。

| カテゴリ | ファイル数 | 内容 |
|---|---|---|
| `background/` | 11枚 | beach, city, crossroad, forest, laboratory, library, living_room, music_room, stage, sunset, title_bg |
| `chara/` | 4体 | dancer, guest, guide, scientist |
| `bgm/` | 4曲 | calm_music, doorbell, nc366476_Virtual_Voyage, title_theme |
| `se/` | 1曲 | doorbell |
| `system/` | 1件+ | wait.gif, systemPicture/ |

### Phase 4: シナリオファイル作成（12ファイル）

| ファイル | ストーリー | デモする機能 |
|---|---|---|
| `title.scene` | タイトル画面 | ruby、choice（1択→route） |
| `prologue.scene` | 深夜のコーディング | say、text、speed、wait、sound(bgm)、show(キャラ)、ruby |
| `chapter1.scene` | テキスト演出の世界 | speed(10/150)、color、b/i、ruby、br、wait(inline) |
| `chapter2.scene` | キャラクター表示 | show(pos指定)、moveTo、show(複数キャラ/fade)、hide |
| `chapter3.scene` | 選択肢の分岐点 | choice（2択→route分岐） |
| `chapter3_choice.scene` | Route A: 選択肢詳細 | choice(4択)、call(変数設定) |
| `chapter3_variable.scene` | Route B: 変数と条件 | call(変数設定)、if属性、mustache展開`{{var}}` |
| `chapter3_merge.scene` | 合流地点 | if/then/else構文、call |
| `chapter4.scene` | サウンド制御 | sound(bgm)、sound(se+play)、BGM切替、loop、stop |
| `chapter5.scene` | ビジュアルエフェクト | show(sepia/mono/blur)、mode="cg"、moveTo(複数キャラ) |
| `epilogue.scene` | 完成への道 | choice(3択→エンディング分岐)、call(endingType設定) |
| `ending.scene` | エンディング | ネストif/then/else(3分岐)、ruby、choiceでタイトル戻り |

### Phase 5: 動作検証

- `npm install` → 成功（439パッケージ）
- `node ../parser/cli.js` → 12ファイル全てJS変換成功
- `npx webpack --mode development` → `compiled successfully`
- `dist/` 出力確認: bundle.js、12シーンチャンク、screen/、resource/ 全てコピー済み

---

## 3. 発生したエラーと対処

### エラー1: wtcパーサーのコマンドが見つからない

**現象**:

```
npx wtc ./src/scene/ ./src/js/
```

を実行したところ、パーサーがシーンファイルを処理せず、カレントディレクトリのファイル一覧を表示するだけだった。`src/js/` にJSファイルが生成されなかった。

**原因**:
`wtc` はwebTaleKitのルートプロジェクトで `npm link` 等によりグローバル登録される想定のCLIツール。`demo/` ディレクトリの `node_modules/.bin/` には存在しないため、`npx wtc` が期待通りに動作しなかった。

**対処**:
`parser/cli.js` をリポジトリルートからの相対パスで直接実行する方式に変更。

```diff
- "dev": "rimraf dist && npx wtc ./src/scene/ ./src/js/ && ..."
+ "dev": "rimraf dist && node ../parser/cli.js ./src/scene/ ./src/js/ && ..."
```

`package.json` の `play`, `dev`, `build` スクリプト全3箇所を修正。

---

### エラー2: webtalekit-alphaモジュールが見つからない

**現象**:

```
ERROR in ./src/index.js 1:0-49
Module not found: Error: Can't resolve 'webtalekit-alpha/src/core/'
in 'C:\Users\endoh\Dropbox\Development\webTaleKit\demo\src'
```

webpack ビルド時に `webtalekit-alpha` パッケージが解決できずエラー。

**原因**:
`webtalekit-alpha` はnpmレジストリに公開されたパッケージではなく、ローカルの `dist/` ディレクトリを参照するシンボリックリンク方式で解決される。`example/node_modules/webtalekit-alpha` を確認したところ、`/c/Users/endoh/Dropbox/Development/webTaleKit/dist/` へのシンボリックリンクだった。

**対処**:
`demo/node_modules/` 内に同様のシンボリックリンクを作成。

```bash
cd demo
ln -s ../dist/ node_modules/webtalekit-alpha
```

これにより webpack が `dist/src/core/` 配下のエンジンコードを正しく解決できるようになった。

> **注意**: `npm install` を再実行するとシンボリックリンクが消える可能性がある。恒久対策としては `package.json` に `"webtalekit-alpha": "file:../dist"` を追加する方法が考えられる。

---

### エラー3: xmldomの警告（パーサー実行時）

**現象**:
パーサー実行時に大量の xmldom warning が出力された。

```
[xmldom warning] attribute space is required"src"!!
[xmldom warning] unclosed xml attribute
[xmldom warning] attribute "play" missed value!! "play" instead!!
```

**原因**:
xmldomパーサーの厳密なXML検証による警告。`play`や`loop`、`stop`などの値なし属性（boolean属性）がXML仕様に厳密には適合しないため警告が出る。

**対処**:
**対処不要**。これらは警告（warning）であり、パーサーの出力結果には影響しない。12ファイル全てが正常にJS変換されたことを確認済み。`Output: ./src/js/xxx.js` のログで全ファイルの出力を確認。

---

## 4. 技術的な設計判断

### シーン間の変数共有について

当初の計画では `<call method="choiceFirst = true" />` で設定したフラグをシーン跨ぎで `<if condition="choiceFirst == true">` により判定する予定だった。しかし、エンジンの `executeCode()` は各シーンの `<script>` スコープで実行されるため、**シーンを跨いだ変数共有は機能しない可能性**がある。

**採用した方針**:

- `chapter3` の分岐: 各ルートファイル (`chapter3_choice`, `chapter3_variable`) にルート固有テキストを直接記述
- `chapter3_merge`: 同一シーン内で `call` → `if/then/else` を完結させる形でデモ
- `epilogue` → `ending`: `epilogue` の choice 内で `call method="endingType = '...'"` を設定し、`ending.scene` で `export let endingType` を宣言して `if` 判定。**同一フロー内での変数引き継ぎが動作するかはランタイム検証が必要**
- フォールバック: `ending.scene` の `endingType` 初期値を `'explorer'` に設定し、変数引き継ぎが失敗してもEnding Cが表示される安全設計

### アセット管理について

当初は `example/src/resource/` をパスで参照する案があったが、webpack devServer のパス解決が複雑になるため、リソースファイルを `demo/src/resource/` に直接コピーする方式を採用した。

---

## 5. ファイル一覧

```
demo/
├── .gitignore
├── package.json
├── webpack.config.js
├── engineConfig.json
├── src/
│   ├── index.js
│   ├── template.html
│   ├── scene/                      (12ファイル)
│   │   ├── title.scene
│   │   ├── prologue.scene
│   │   ├── chapter1.scene
│   │   ├── chapter2.scene
│   │   ├── chapter3.scene
│   │   ├── chapter3_choice.scene
│   │   ├── chapter3_variable.scene
│   │   ├── chapter3_merge.scene
│   │   ├── chapter4.scene
│   │   ├── chapter5.scene
│   │   ├── epilogue.scene
│   │   └── ending.scene
│   ├── js/                         (パーサー出力、gitignore対象)
│   ├── screen/
│   │   └── main.html
│   └── resource/
│       ├── background/             (11ファイル)
│       ├── chara/                  (4ファイル)
│       ├── bgm/                    (4ファイル)
│       ├── se/                     (1ファイル)
│       └── system/                 (wait.gif + systemPicture/)
└── node_modules/
    └── webtalekit-alpha -> ../dist/  (シンボリックリンク)
```

---

## 6. 起動手順

```bash
cd demo
npm install
ln -s ../dist/ node_modules/webtalekit-alpha   # 初回のみ
npm run dev
# ブラウザで http://localhost:8080 にアクセス
```

---

## 7. 今後の課題

- [ ] シーン跨ぎの変数共有（`epilogue` → `ending`）のランタイム検証
- [ ] `webtalekit-alpha` のシンボリックリンクを `package.json` の `file:` 参照に置き換え
- [ ] デモ専用のオリジナルアセット（背景・キャラ・BGM）の作成
- [ ] E2Eテストによる全シーン遷移の自動検証
