# WebTaleKit 改善TODOリスト（最終版 v3.0）

**最終更新:** 2024年12月11日  
**Trelloボード:** https://trello.com/b/qYNGh7MY  
**現在のバージョン:** v0.2.x (Alpha)

> **⚠️ 重要な更新**:  
> プロジェクトナレッジの精査により、多くの機能が**既に実装済み**であることが判明しました。  
> 本TODOリストは最新の実態を正確に反映しています。

---

## 📋 目次

- [✅ 実装済み機能の確認](#実装済み機能の確認)
- [🔥 Phase 0: 緊急バグ修正（即時対応）](#phase-0-緊急バグ修正即時対応)
- [🔴 Phase 1: 基盤強化（v0.2.x「礎」）](#phase-1-基盤強化v02x礎)
- [🟡 Phase 2: 表現力向上（v0.3.x「舞踊」）](#phase-2-表現力向上v03x舞踊)
- [🟢 Phase 3: フレームワーク連携（v0.4.x「狭間」）](#phase-3-フレームワーク連携v04x狭間)
- [🔵 Phase 4以降（v0.5.x〜v1.0.0）](#phase-4以降v05xv100)
- [📊 優先度マトリクス](#優先度マトリクス)

---

## ✅ 実装済み機能の確認

### コア機能（完全実装済み）

#### シナリオ制御タグ
- ✅ `<text>` - テキスト表示
- ✅ `<say>` - キャラクターセリフ（voice属性対応）
- ✅ `<choice>` - 選択肢システム
- ✅ `<jump>` - シナリオ内ジャンプ
- ✅ `<route>` - シーン遷移
- ✅ `<wait>` - 待機処理
- ✅ `<newpage>` - 改ページ
- ✅ `<call>` - JavaScript実行

#### 画像・演出タグ
- ✅ `<show mode="bg|cutin|chara|cg|effect">` - 画像表示
- ✅ `<hide>` - 画像非表示
- ✅ `<moveTo>` - 画像移動アニメーション

#### 音声タグ
- ✅ `<sound mode="bgm|se|voice">` - 音声再生
  - play, loop, stop, pause属性対応
  - BGM・SE・ボイス分離

#### データ管理
- ✅ `<save slot="..." name="...">` - セーブ機能
  - スロット管理
  - オートセーブ
  - サイレントモード（message="false"）
  - タイムスタンプ記録
  - 画面・BGM・変数の完全保存
- ✅ `<load slot="...">` - ロード機能
  - シーン復元
  - 画像・BGM復元
  - 進行状況復元

#### HTTP通信
- ✅ `<get>`, `<post>`, `<put>`, `<delete>` - RESTful API連携
  - ヘッダー・ボディ指定
  - then/errorハンドリング
  - プログレス表示

#### 高度な機能
- ✅ `<dialog>` - ダイアログシステム
- ✅ `if="..."` グローバル属性 - 条件分岐
- ✅ `{{変数名}}` ムスタッシュ構文 - 変数展開
- ✅ ライフサイクルフック (`init()`, `cleanUp()`)
- ✅ JavaScript連携API (`getAPIForScript()`)
- ✅ シナリオ履歴管理
- ✅ リソースキャッシュ管理

### 開発環境（実装済み）
- ✅ WebTaleKit Compiler (`wtc`)
- ✅ Webpack開発サーバー
- ✅ TypeScript対応（ts-loader）
- ✅ ホットリロード対応

---

## 🔥 Phase 0: 緊急バグ修正（即時対応）

### A. 現在進行中の致命的バグ（Trello Doing）

**期限:** 即時〜1週間以内

- [ ] **callタグが機能しない** 🔴🔴🔴  
  📌 IF属性デモで値が変わらない  
  📌 原因: `executeCode()`の実行コンテキスト問題？  
  🔗 [Trello](https://trello.com/c/zxmRmJus)
  ```javascript
  // 調査ポイント
  callHandler(line) {
    this.executeCode(line.method)  // ← ここが動いていない
  }
  ```

- [ ] **選択肢の履歴が残る問題** 🔴🔴🔴  
  📌 routeタグで戻った後、再度選択すると前回の選択肢も実行される  
  📌 原因: `scenarioManager`のシナリオオブジェクト削除漏れ  
  🔗 [Trello](https://trello.com/c/KhQTjaAx)
  ```typescript
  // 修正箇所
  choiceHandler(line) {
    // 選択後のシナリオ追加前に、既存の選択肢シナリオをクリア
  }
  ```

- [ ] **Styleタグが増殖する** 🔴🔴  
  📌 シーン遷移のたびにstyleタグがheadに追加され続ける  
  🔗 [Trello](https://trello.com/c/J1KHS9hw)
  ```javascript
  // 修正箇所: loadScreen()
  // 既存のスタイルシート削除処理が不完全
  const styleTags = document.head.getElementsByTagName('style')
  // ← WebTaleKit関連のstyleのみ削除する識別子が必要
  ```

- [ ] **1283px以下でスクロールバーが出る** 🔴  
  📌 レイアウトのCSS問題  
  🔗 [Trello](https://trello.com/c/rkL3zTcY)

- [ ] **選択肢が6つ以上で画面をはみ出る** 🔴  
  📌 UIレイアウトの制約  
  🔗 [Trello](https://trello.com/c/mF0vii60)
  ```css
  /* 修正案: スクロール対応 */
  #interactiveView {
    max-height: 500px;
    overflow-y: auto;
  }
  ```

---

### B. 重大な問題（Trello Issues）

**期限:** 2週間以内

- [ ] **Configが反映されない** 🔴  
  📌 `engineConfig.json`の設定が適用されないケースがある  
  🔗 [Trello](https://trello.com/c/B3sYO6A5)

- [ ] **messageWindowをmain直下にしないとこける** 🔴  
  📌 DOM構造の依存性が強すぎる  
  📌 影響: Svelte連携の障壁になる  
  🔗 [Trello](https://trello.com/c/ER4SwlcS)
  ```javascript
  // 問題: ハードコードされたDOM参照
  document.querySelector('#messageWindow')
  // ↓ 改善: 柔軟なセレクタ対応
  document.querySelector(config.messageWindowSelector || '#messageWindow')
  ```

- [ ] **ルビがずれてる** 🔴  
  🔗 [Trello](https://trello.com/c/jSfa0z8W)

- [ ] **テキスト表示のパフォーマンスアップ** 🔴  
  📌 DOM更新のコストが高い（`innerHTML`の多用）  
  🔗 [Trello](https://trello.com/c/fqP82KBR)
  ```typescript
  // drawer.ts - 現在の問題
  async drawText(text: string, wait: number) {
    for (const char of text) {
      element.innerHTML += char;  // ❌ 毎回DOM再構築
      await sleep(wait);
    }
  }
  
  // 改善案
  async drawText(text: string, wait: number) {
    const textNode = document.createTextNode('');
    element.appendChild(textNode);
    for (const char of text) {
      textNode.textContent += char;  // ✅ テキストノードのみ更新
      await sleep(wait);
    }
  }
  ```

---

## 🔴 Phase 1: 基盤強化（v0.2.x「礎」ISHIZUE）

**目標:** 安定性・保守性・型安全性の確立

### A. 型安全性の向上（最優先）

**期限:** v0.2.13（3週間以内）

#### index.jsの完全TypeScript化

- [x] **index.js → index.ts への移行** 🔄  
  📌 Trelloで進行中（AIエージェント対応）  
  🔗 [Trello](https://trello.com/c/d4q7cTrb) | [PR#33](https://github.com/EndoHizumi/webTaleKit/pull/33/files)

- [ ] 全ハンドラーメソッドの型定義
  ```typescript
  async textHandler(scenarioObject: TextScenarioObject): Promise<void>
  async choiceHandler(line: ChoiceScenarioObject): Promise<void>
  async showHandler(line: ShowScenarioObject): Promise<void>
  // 全19タグ分
  ```

#### 型定義ファイルの作成

- [ ] `src/types/scenario.d.ts` - シナリオオブジェクト型
  ```typescript
  export interface BaseScenarioObject {
    type: string;
    if?: string; // グローバル属性
  }
  
  export interface TextScenarioObject extends BaseScenarioObject {
    type: 'text';
    content: string[];
    speed?: number;
  }
  
  export interface SayScenarioObject extends BaseScenarioObject {
    type: 'say';
    name: string;
    content: string[];
    voice?: string;
    speed?: number;
  }
  
  export interface SaveScenarioObject extends BaseScenarioObject {
    type: 'save';
    slot?: string;
    name?: string;
    message?: boolean;
  }
  
  // 全タグ分定義
  export type ScenarioObject = 
    | TextScenarioObject
    | SayScenarioObject
    | ChoiceScenarioObject
    | ShowScenarioObject
    | SaveScenarioObject
    | LoadScenarioObject
    // ...
  ```

- [ ] `src/types/api.d.ts` - 公開API型
  ```typescript
  export interface TaleKitAPI {
    drawer: DrawerAPI;
    sound: SoundAPI;
    scenario: ScenarioAPI;
    images: ImageAPI;
    save: SaveAPI;
    core: CoreAPI;
  }
  ```

- [ ] `src/types/config.d.ts` - 設定型
  ```typescript
  export interface EngineConfig {
    title: string;
    description: string;
    resolution: {
      width: number;
      height: number;
    };
    fullScreen: boolean | "false" | "true";
    url?: string;
  }
  
  export interface SceneConfig {
    name: string;
    background: string;
    bgm?: string;
    template: string;
  }
  ```

#### scenarioManager.tsの型修正

- [ ] `any`型の撲滅
  ```typescript
  // Before
  private backlist: any
  private saveDataList: any
  private progress: any
  
  // After
  private backlist: string[]
  private saveDataList: SaveData[]
  private progress: GameProgress
  
  interface GameProgress {
    currentBackground: string;
    currentScene: string;
    currentIndex: number;
    selected: Record<string, { prompt: string; id: number }>;
  }
  ```

---

### B. エラーハンドリング強化

**期限:** v0.2.14（1ヶ月以内）

#### カスタムエラークラスの作成

- [ ] `src/errors/ParseError.ts`
  ```typescript
  export class ParseError extends Error {
    constructor(
      message: string,
      public line: number,
      public column: number,
      public tag: string,
      public originalError?: Error
    ) {
      super(message);
      this.name = 'ParseError';
    }
    
    toString(): string {
      return `[ParseError] Line ${this.line}: ${this.message} (Tag: <${this.tag}>)`;
    }
  }
  ```

- [ ] `src/errors/ResourceError.ts`
  ```typescript
  export class ResourceError extends Error {
    constructor(
      message: string,
      public resourcePath: string,
      public resourceType: 'image' | 'audio' | 'video' | 'template'
    ) {
      super(message);
      this.name = 'ResourceError';
    }
  }
  ```

- [ ] `src/errors/ScenarioError.ts`

#### エラーハンドリングの統一

- [ ] グローバルエラーハンドラー実装
  ```typescript
  class Core {
    private errorHandler(error: Error): void {
      if (error instanceof ParseError) {
        this.showUserFriendlyError('シナリオの記述にエラーがあります', error);
      } else if (error instanceof ResourceError) {
        this.showUserFriendlyError('リソースの読み込みに失敗しました', error);
      } else {
        this.showUserFriendlyError('予期しないエラーが発生しました', error);
      }
      
      // 開発者向けログ
      if (this.config.debug) {
        console.error(error);
      }
    }
  }
  ```

#### Trelloからの関連タスク

- [ ] **エラーハンドリングの修正** 🔵  
  📌 index.jsで例外をキャッチ、alertで表示  
  🔗 [Trello](https://trello.com/c/gfNUnfuS)

- [ ] **エラー表示の追加** 🔵  
  📌 エラーログにスタックトレースを保存  
  📌 runScenario以外は例外をスロー  
  🔗 [Trello](https://trello.com/c/CYhKe2cZ)

---

### C. セーブ/ロード機能の改善

**期限:** v0.2.15（1ヶ月以内）

> **✅ 注意:** 基本機能は既に実装済み。ここでは改善・強化を行う。

#### セーブデータバージョン管理

- [ ] **セーブデータにバージョン情報追加** 🟡  
  📌 Trelloタスク: セーブデータのバージョンの追加と行差分の保存  
  🔗 [Trello](https://trello.com/c/ZYJGkHs3)
  ```typescript
  interface SaveData {
    version: string;  // 例: "0.2.13"
    engineVersion: string;  // 例: "0.2.x"
    timestamp: string;
    // ...既存フィールド
  }
  ```

- [ ] マイグレーション機能
  ```typescript
  class SaveDataMigrator {
    migrate(oldData: any, fromVersion: string, toVersion: string): SaveData {
      // バージョン間の変換ロジック
    }
  }
  ```

#### UI改善

- [ ] セーブ/ロード画面のリファクタリング
  - [ ] サムネイル表示
  - [ ] ソート機能（日時順、名前順）
  - [ ] セーブデータ削除確認ダイアログ

#### エラーハンドリング強化

- [ ] セーブデータ破損チェック
  ```typescript
  private validateSaveData(data: any): data is SaveData {
    return (
      typeof data.version === 'string' &&
      typeof data.timestamp === 'string' &&
      data.scenarioManager !== undefined
    );
  }
  ```

---

### D. アーキテクチャ改善

**期限:** v0.2.x 〜 v0.3.0（2ヶ月以内）

#### DOM操作の外部化（v0.4.0の準備）

- [ ] `Drawer`クラスのリファクタリング
  ```typescript
  // Before: エンジン内部でDOM操作
  class Drawer {
    show(images) {
      const container = document.querySelector('#main');
      container.appendChild(element);
    }
  }
  
  // After: DOM要素を外部から注入
  class Drawer {
    constructor(private container: HTMLElement) {}
    
    show(images) {
      this.container.appendChild(element);
    }
  }
  ```

#### イベント駆動アーキテクチャへの移行

- [ ] `EventEmitter`の実装
  ```typescript
  class Core extends EventEmitter {
    emit(event: string, data: any): void;
    on(event: string, callback: Function): void;
    off(event: string, callback: Function): void;
  }
  ```

- [ ] イベント定義
  ```typescript
  type TaleKitEvent =
    | 'scenario:next'
    | 'scenario:jump'
    | 'text:display:start'
    | 'text:display:end'
    | 'choice:show'
    | 'choice:selected'
    | 'resource:loaded'
    | 'resource:error'
    | 'scene:loaded'
    | 'scene:unloaded'
    | 'save:completed'
    | 'load:completed';
  ```

#### Trelloからの関連タスク

- [ ] **エンジンのイベント発行** 🔵  
  📌 文字を表示した・してる最中・終わったなど、外部から状態がわかるように  
  🔗 [Trello](https://trello.com/c/cbPJa816)

- [ ] **対象のDOMを引数で受け取る** 🔵  
  🔗 [Trello](https://trello.com/c/1dUmF3st)

---

### E. パフォーマンス最適化

**期限:** v0.3.0（2ヶ月以内）

#### 描画最適化（最優先）

- [ ] **drawer.tsのDOM操作改善**
  ```typescript
  // ✅ 改善済み候補
  async drawText(text: string, wait: number) {
    const fragment = document.createDocumentFragment();
    const textNode = document.createTextNode('');
    fragment.appendChild(textNode);
    element.appendChild(fragment);
    
    for (const char of text) {
      textNode.textContent += char;
      await sleep(wait);
    }
  }
  ```

#### Canvas描画最適化

- [ ] オフスクリーンキャンバス導入
- [ ] 差分描画実装
- [ ] レイヤーキャッシング

#### メモリ管理

- [ ] `WeakMap`を使ったキャッシュ
  ```typescript
  private imageCache = new WeakMap<string, ImageObject>();
  ```
- [ ] 使用済みリソースの自動解放
- [ ] メモリリークチェック（Chrome DevTools）

---

### F. ドキュメント整備

**期限:** v0.3.0（2ヶ月以内）

#### Trelloからの関連タスク

- [ ] **VitePressでドキュメント作成** 📘  
  🔗 [Trello](https://trello.com/c/IVNdO88d)

#### VitePress導入

- [ ] プロジェクトセットアップ
  ```bash
  npm install -D vitepress
  ```
- [ ] サイト構造設計
  ```
  docs/
  ├── .vitepress/
  │   └── config.ts
  ├── guide/
  │   ├── getting-started.md
  │   ├── installation.md
  │   └── first-scenario.md
  ├── reference/
  │   ├── tags/
  │   │   ├── text.md
  │   │   ├── say.md
  │   │   ├── choice.md
  │   │   ├── show.md
  │   │   ├── hide.md
  │   │   ├── sound.md
  │   │   ├── save.md
  │   │   ├── load.md
  │   │   └── ...（全19タグ）
  │   ├── api.md
  │   └── config.md
  ├── tutorials/
  │   ├── basic-scenario.md
  │   ├── choices-and-branching.md
  │   ├── images-and-animation.md
  │   ├── audio.md
  │   └── save-load.md
  └── troubleshooting.md
  ```

#### タグリファレンスの完成

**各タグページのテンプレート**:
```markdown
# <タグ名>

## 概要
簡潔な説明

## 構文
\`\`\`xml
<タグ名 属性="値">
  内容
</タグ名>
\`\`\`

## 属性

| 属性名 | 型 | 必須 | デフォルト | 説明 |
|--------|----|----|----------|------|
| src | string | ✅ | - | 画像パス |

## 使用例

### 基本例
\`\`\`xml
<text>こんにちは</text>
\`\`\`

### 応用例
\`\`\`xml
<text if="score > 100">高得点！</text>
\`\`\`

### 変数展開
\`\`\`xml
<text>あなたの名前は{{name}}です</text>
\`\`\`

## 注意事項
- xxx
- yyy

## 関連タグ
- [<say>](/reference/tags/say)
```

#### チュートリアルの作成

- [ ] 初心者向け（3本）
  - [ ] "5分で始めるWebTaleKit"
  - [ ] "初めてのシナリオ作成"（15分）
  - [ ] "選択肢と分岐"（30分）

- [ ] 中級者向け（3本）
  - [ ] "画像とアニメーション"（30分）
  - [ ] "BGMとSEの使い方"（20分）
  - [ ] "変数と条件分岐"（40分）

- [ ] 上級者向け（3本）
  - [ ] "JavaScript連携"（60分）
  - [ ] "REST API連携"（60分）
  - [ ] "カスタムUI作成"（90分）

---

## 🟡 Phase 2: 表現力向上（v0.3.x「舞踊」BUYO）

**目標:** アニメーション・演出面での強化

### A. アニメーション機能の実装

**期限:** v0.3.0（3ヶ月以内）

#### Trelloからの関連タスク

- [ ] **アニメーションの実装** 🔵  
  📌 6種類のアニメーションを実装  
  🔗 [Trello](https://trello.com/c/BhNHGuD1)

#### 新規アニメーションタグ

- [ ] **quakeタグ（画面揺らし）**
  ```xml
  <quake duration="500" intensity="10" />
  ```
  🔗 [Trello Checklist](https://trello.com/c/BhNHGuD1)

- [ ] **spinタグ・要素（回転）**
  ```xml
  <show src="character.png">
    <spin duration="1000" rotation="360" />
  </show>
  ```

- [ ] **zoomInタグ・要素（拡大）**
  ```xml
  <show src="character.png">
    <zoomIn from="0" to="1" duration="1000" />
  </show>
  ```

- [ ] **zoomOutタグ・要素（縮小）**
  ```xml
  <show src="character.png">
    <zoomOut from="1" to="0" duration="1000" />
  </show>
  ```

- [ ] **slideタグ・要素（movetoのエイリアス）**
  ```xml
  <show src="character.png">
    <slide direction="left" duration="1000" />
  </show>
  ```

- [ ] **bounceタグ・要素（バウンド）**
  ```xml
  <show src="character.png">
    <bounce height="50" duration="1000" />
  </show>
  ```

#### アニメーション機能拡張

- [ ] イージング関数の追加
  - easeIn, easeOut, easeInOut
  - cubic-bezier対応

- [ ] キーフレームアニメーション
  ```xml
  <show src="character.png">
    <animate>
      <keyframe at="0%" transform="scale(0) rotate(0)" />
      <keyframe at="50%" transform="scale(1.2) rotate(180)" />
      <keyframe at="100%" transform="scale(1) rotate(360)" />
    </animate>
  </show>
  ```

---

### B. テキスト表示の強化

**期限:** v0.3.0（3ヶ月以内）

#### 新規タグ・要素

- [ ] `<speed>` タグ
  ```xml
  <text>通常速度<speed value="10">速い</speed>通常に戻る</text>
  ```

- [ ] `<size>` タグ
  ```xml
  <text>通常サイズ<size value="32">大きい</size>通常に戻る</text>
  ```

- [ ] `<color>` タグ
  ```xml
  <text>黒<color value="#ff0000">赤色</color>黒</text>
  ```

#### Webフォント対応

- [ ] Google Fonts連携
  ```xml
  <scene>
    <font src="https://fonts.googleapis.com/css2?family=Noto+Sans+JP" />
  </scene>
  ```

#### Trelloからの関連タスク

- [ ] **フォント変更機能** 🔵  
  📌 ビットマップフォント対応  
  📌 フォント装飾機能  
  🔗 [Trello](https://trello.com/c/5YWvxaAH)

---

### C. 音声機能の拡張

**期限:** v0.3.0（3ヶ月以内）

#### soundタグ機能追加

- [ ] 音量調整
  ```xml
  <sound mode="bgm" src="theme.mp3" volume="0.5" />
  ```

- [ ] フェード機能
  ```xml
  <sound mode="bgm" src="theme.mp3" fadeIn="2000" />
  <sound mode="bgm" stop fadeOut="2000" />
  ```

- [ ] クロスフェード
  ```typescript
  async crossfade(from: SoundObject, to: SoundObject, duration: number) {
    // 同時にフェードアウトとフェードイン
  }
  ```

#### エイリアスの実装

- [ ] `<bgm>`, `<voice>`, `<se>` タグ
  ```xml
  <bgm src="theme.mp3" loop />
  <voice src="hello.mp3" />
  <se src="click.mp3" />
  ```

#### Trelloからの関連タスク

- [ ] **soundタグの改修** 🔵  
  🔗 [Trello](https://trello.com/c/rK6nFdJK)

- [ ] **VOICEVOX API対応** 🔵  
  🔗 [Trello](https://trello.com/c/LpFZqYlf)

---

### D. 動画再生機能

**期限:** v0.3.0（3ヶ月以内）

- [ ] **動画の再生に対応する** 🔵  
  📌 WebGLでの再生に挑戦  
  🔗 [Trello](https://trello.com/c/KhUfAt8m)

```xml
<video src="movie.mp4" width="1280" height="720" />
```

---

### E. リソース管理の強化（プリロード機能）

**期限:** v0.3.0（3ヶ月以内）

> **📌 最重要:** 他エンジンとの機能格差を埋める

#### ResourceManagerの完全リライト

- [ ] `ResourceManager`クラスの設計
  ```typescript
  interface ResourceDefinition {
    type: 'image' | 'audio' | 'video';
    path: string;
    priority: 'critical' | 'high' | 'low';
  }
  
  class ResourceManager {
    async preload(
      resources: ResourceDefinition[],
      onProgress?: (loaded: number, total: number) => void
    ): Promise<void>
    
    async load(path: string, type: string): Promise<any>
    
    private lruCache: LRUCache<string, any>
  }
  ```

#### ScenarioAnalyzerの実装

- [ ] シナリオからリソース抽出
  ```typescript
  class ScenarioAnalyzer {
    extractResources(scenario: any[]): ResourceDefinition[] {
      // <show>, <sound>タグからリソースパスを抽出
    }
  }
  ```

#### プリロード機能の統合

- [ ] Coreクラスへの統合
  ```typescript
  async loadScene(sceneFileName: string) {
    // 1. シーンファイル読み込み
    this.sceneFile = await import(`/src/js/${sceneFileName}.js`);
    
    // 2. リソース抽出
    const resources = analyzer.extractResources(this.sceneFile.scenario);
    
    // 3. プリロード実行（プログレス表示）
    await this.resourceManager.preload(resources, (loaded, total) => {
      this.showLoadingProgress(loaded / total * 100);
    });
    
    // 4. シナリオ開始
    this.scenarioManager.setScenario(this.sceneFile.scenario, sceneFileName);
  }
  ```

#### ローディング画面UI

- [ ] プログレスバー表示
- [ ] ロード中の背景画像
- [ ] スキップ機能

---

## 🟢 Phase 3: フレームワーク連携（v0.4.x「狭間」HAZAMA）

**目標:** Vue/React/Svelte連携の実現

### A. モノレポ化

**期限:** v0.4.0（4ヶ月以内）

#### プロジェクト構造の再編

- [ ] Lerna or Turborepo導入
  ```
  TaleKit/
  ├── packages/
  │   ├── core/          # @talekit/core（WebTaleKit本体）
  │   ├── vue/           # @talekit/vue
  │   ├── react/         # @talekit/react
  │   └── svelte/        # @talekit/svelte
  ├── examples/
  │   ├── vue-example/
  │   ├── react-example/
  │   └── svelte-example/
  └── docs/
  ```

#### Coreパッケージのリファクタリング

- [ ] フレームワーク依存コードの分離
- [ ] 公開APIの整理
- [ ] イベント駆動アーキテクチャへの完全移行

---

### B. Svelte連携パッケージ

**期限:** v0.4.0（4ヶ月以内）

#### Trelloからの関連タスク

- [ ] **UIフレームワークの連携** 🔵  
  🔗 [Trello](https://trello.com/c/KJtVvhHq)

#### Svelteコンポーネントの実装

- [ ] `<TaleKit>`コンポーネント
  ```svelte
  <script>
    import { TaleKit } from '@talekit/svelte';
    import { onMount } from 'svelte';
    
    let engine;
    
    onMount(() => {
      engine = new TaleKit({
        container: '#game',
        config: engineConfig
      });
    });
  </script>
  
  <TaleKit bind:engine>
    <say name="キャラクター">こんにちは</say>
    <choice>
      <item label="選択肢1">
        <text>内容1</text>
      </item>
    </choice>
  </TaleKit>
  ```

#### Svelte Storeの提供

- [ ] `scenarioStore`
- [ ] `progressStore`
- [ ] `variablesStore`

#### 課題への対応

**ナレッジから判明した課題**:
- テンプレートのDOM構造依存性
- 必須要素のバリデーション
- パフォーマンス最適化

- [ ] DOM構造バリデータ実装
  ```typescript
  class DOMValidator {
    validate(template: HTMLElement): ValidationResult {
      // messageWindow, interactiveView等の必須要素チェック
    }
  }
  ```

---

### C. React連携パッケージ

**期限:** v0.4.0（4ヶ月以内）

- [ ] `<TaleKit>`コンポーネント
- [ ] React Hooksの提供
  - `useScenario()`
  - `useProgress()`
  - `useVariables()`
- [ ] サンプルプロジェクト

---

### D. Vue連携パッケージ

**期限:** v0.4.0（4ヶ月以内）

- [ ] Composablesの提供
- [ ] Vueコンポーネント
- [ ] サンプルプロジェクト

---

## 🔵 Phase 4以降（v0.5.x〜v1.0.0）

### v0.5.0「操手（AYATSU）」- 操作性向上

#### ゲームパッド対応

- [ ] **ゲームパッドの十字キーで移動を可能にする** 🔵  
  🔗 [Trello](https://trello.com/c/yP42DKQj)

- [ ] **キーコンフィグの設定変更（キーボード・ゲームパッド）** 🔵  
  🔗 [Trello](https://trello.com/c/Vl7QA6w7)

#### VOICEVOX対応（再掲）

- [ ] VOICEVOX API連携
  🔗 [Trello](https://trello.com/c/LpFZqYlf)

---

### v0.6.0「絡繰（KARAKURI）」- 開発支援

#### VSCode拡張機能

- [ ] **LanguageServerに対応してない** 📘  
  🔗 [Trello](https://trello.com/c/zAYBY4Vi)

- [ ] シンタックスハイライト
- [ ] オートコンプリート
- [ ] タグ検証（Linter）

#### デバッグモード

- [ ] **WebTaleScriptデバッガーの実装** 🔧  
  🔗 [Trello](https://trello.com/c/m5KrDlw3)

- [ ] デバッグパネルUI
- [ ] 変数インスペクター
- [ ] リソースモニター

#### プラグインシステム

- [ ] **プラグイン機能の追加** 🔵  
  🔗 [Trello](https://trello.com/c/wB4SDtHB)

- [ ] **拡張機能の追加** 📦  
  📌 npmパッケージ化、プレフィックス「tale-ext」  
  🔗 [Trello](https://trello.com/c/Ecf3qSAk)

- [ ] **マクロタグの追加** 🔵  
  🔗 [Trello](https://trello.com/c/pmsr45Uo)

- [ ] **カスタムタグの追加** 🔵  
  🔗 [Trello](https://trello.com/c/B2xxsyAa)

#### テスト環境

- [ ] Jest導入
- [ ] Playwright導入
- [ ] CI/CD整備

#### 周辺ツール

- [ ] **チェッカーの実装** 🔧  
  📌 構文チェッカー  
  🔗 [Trello](https://trello.com/c/5vlGqqjj)

- [ ] **Webpack-dev-serverホットリロード対応** 🔧  
  🔗 [Trello](https://trello.com/c/vyVFifKE)

- [ ] **WebTaleKit MCPを作りたい** 🤖  
  🔗 [Trello](https://trello.com/c/2j0XxQXJ)

#### クロスプラットフォームビルド

- [ ] **マルチプラットフォームビルド(デスクトップ)** 💻  
  📌 Electron  
  🔗 [Trello](https://trello.com/c/PkJMt42h)

- [ ] **マルチプラットフォームビルド(スマートフォン)** 📱  
  📌 Capacitor  
  🔗 [Trello](https://trello.com/c/6kFJUqvQ)

---

### v0.7.0「綴り（TSUZURI）」- GUIエディタ

- [ ] **GUIエディタ** 🎨  
  🔗 [Trello](https://trello.com/c/2W0V8AXm)

- [ ] ビジュアルエディタ
- [ ] シナリオエディタ
- [ ] リソース管理UI
- [ ] フローチャート表示

---

### v0.8.0「迅雷（JINRAI）」- パフォーマンス最適化

- [ ] WebAssembly検討
- [ ] Worker対応
- [ ] バンドルサイズ削減

---

### v0.9.0「出島（DEJIMA）」- 互換性

- [ ] KAGコンバータ
- [ ] Markdown形式の実装
  🔗 [Trello](https://trello.com/c/EOFIlVen)

---

### v1.0.0「暁月（AKATSUKI）」- 正式版

- [ ] 完成度の最終確認
- [ ] パフォーマンスチューニング
- [ ] ドキュメント完成
- [ ] 正式リリース

---

## 📊 優先度マトリクス（更新版）

| カテゴリ | 優先度 | 期限 | 影響度 | 難易度 | 実装状況 |
|---------|--------|------|--------|--------|---------|
| バグ修正（Doing） | 🔴最高 | 即時 | 致命的 | 中 | 未着手 |
| 型安全性 | 🔴高 | v0.2.13 | 高 | 中 | 🔄進行中 |
| エラーハンドリング | 🔴高 | v0.2.14 | 高 | 低 | 未着手 |
| セーブ/ロード改善 | 🟡中 | v0.2.15 | 中 | 低 | ✅基本完了 |
| アーキテクチャ改善 | 🟡中 | v0.3.0 | 高 | 高 | 未着手 |
| パフォーマンス最適化 | 🟡中 | v0.3.0 | 中 | 高 | 未着手 |
| アニメーション | 🟡中 | v0.3.0 | 中 | 中 | 未着手 |
| プリロード機能 | 🟡中 | v0.3.0 | 高 | 中 | 未着手 |
| ドキュメント整備 | 🟡中 | v0.3.0 | 高 | 低 | 未着手 |
| UIフレームワーク連携 | 🟢低 | v0.4.0 | 低 | 高 | 計画中 |
| GUIエディタ | 🟢低 | v0.7.0 | 低 | 高 | 計画中 |

---

## 🎯 マイルストーン

### v0.2.13 (緊急リリース - 2週間以内)

**完了条件:**
- ✅ Doing リストの全バグ修正完了
- ✅ index.tsへの移行完了
- ✅ 基本的なエラーメッセージ表示

---

### v0.2.15 (基盤強化 - 1.5ヶ月以内)

**完了条件:**
- ✅ 型定義完全化
- ✅ エラーハンドリング強化
- ✅ セーブ/ロードバージョン管理

---

### v0.3.0「舞踊（BUYO）」(表現力向上 - 3ヶ月以内)

**完了条件:**
- ✅ 6種類のアニメーション実装
- ✅ プリロード機能実装
- ✅ パフォーマンス最適化
- ✅ ドキュメント第一版完成

---

### v0.4.0「狭間（HAZAMA）」(フレームワーク連携 - 5ヶ月以内)

**完了条件:**
- ✅ React/Vue/Svelte連携パッケージ公開
- ✅ イベント駆動アーキテクチャ完成
- ✅ テストカバレッジ80%以上

---

## 🔗 参考リンク

- **GitHub Repository:** https://github.com/EndoHizumi/webTaleKit
- **公式ドキュメント:** https://endohizumi.github.io/webTaleKit/
- **Trelloボード:** https://trello.com/b/qYNGh7MY
- **Twitter:** [@endo_hizumi](https://x.com/endo_hizumi)

---

## 📌 重要な注意事項

1. **✅ セーブ/ロード機能は実装済み**  
   以前のTODOで「最優先実装」としていましたが、既に完全実装されています。  
   今後は改善・強化にフォーカスします。

2. **🔄 Trelloとの同期**  
   このTODOリストとTrelloボードは常に同期してください。

3. **📊 実装状況の更新**  
   機能を実装したら、必ず`[x]`をつけて進捗を可視化しましょう。

4. **🎯 バージョン戦略の遵守**  
   各バージョンのコンセプト（礎、舞踊、狭間...）を意識して開発を進めてください。

5. **🤝 コミュニティフィードバック**  
   開発の各段階でコミュニティからのフィードバックを積極的に取り入れましょう。

---

**最終更新者:** Claude  
**バージョン:** 3.0.0（プロジェクトナレッジ完全反映版）  
**ライセンス:** MIT
