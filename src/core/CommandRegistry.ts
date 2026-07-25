import { EventBus } from '../utils/eventBus'
import { ScenarioManager } from './scenarioManager'
import { Drawer } from './drawer'

/** パーサーが生成するシナリオオブジェクト1件。エンジンはこれを逐次実行する */
export interface ScenarioCommand {
  type?: string // タグ名（省略時は 'text' 扱い）
  content?: (string | ScenarioCommand)[] // 子要素・テキスト
  [attr: string]: any // タグの属性（src, name, if 等）
}

/**
 * ハンドラから参照できるCoreの公開サーフェス。
 * expandVariable / executeCode / waitHandler 等の共通ユーティリティと、
 * StateManager導入までの暫定としてエンジン状態へのアクセスを提供する。
 */
export interface CoreFacade {
  // 共通ユーティリティ
  expandVariable(text: any): any
  executeCode(code: string): any
  waitHandler(line: any): Promise<void>
  clickWait(): Promise<void>
  checkResourceExists(url: string): Promise<boolean>
  getImageObject(line: any): Promise<any>
  getSoundObject(line: any): Promise<any>
  // タグディスパッチ用の薄いラッパー（ハンドラ間の相互呼び出しに使用）
  textHandler(scenarioObject: any): Promise<void>
  soundHandler(line: any): Promise<void>
  newpageHandler(line?: any): Promise<void> | void
  // シーン読み込み
  loadScene(sceneFileName: string): Promise<void>
  loadScreen(sceneConfig: any, options?: any): Promise<void>
  // エンジン状態（StateManager導入までの暫定アクセス）
  engineConfig: any
  sceneFile: any
  sceneConfig: any
  displayedImages: Record<string, any>
  tempImages: Record<string, any>
  usedSounds: Record<string, any>
  bgm: any
  store: any
  gameContainer: HTMLElement
  isAuto: boolean
  isNext: boolean
  isSkip: boolean
  onNextHandler: (() => void) | null
  setBackground(image: any): void
  getBackground(): any
  clearAllTriggers(): void
}

/** ハンドラに渡す実行コンテキスト（依存注入） */
export interface ExecutionContext {
  eventBus: EventBus // UI/描画への通知
  scenarioManager: ScenarioManager // 進行状況・履歴・jump/call
  stateManager?: unknown // ゲーム状態（StateManager導入までは core 経由でアクセス）
  drawer: Drawer // Canvas層（IRenderBackend抽象化までの暫定）
  core: CoreFacade // 共通ユーティリティ
}

/** タグハンドラが実装すべきインターフェース */
export interface CommandHandler {
  execute(command: ScenarioCommand, context: ExecutionContext): Promise<void> | void
}

/**
 * タグ名→ハンドラのマッピングを管理する純粋なディスパッチャ。
 * httpHandler解決・ifグローバル属性の評価・シナリオ進行は呼び出し側の責務。
 */
export class CommandRegistry {
  private handlers = new Map<string, CommandHandler>()

  /** ハンドラ登録。既存タグへの登録は上書きとなり、警告を出す */
  register(tagName: string, handler: CommandHandler): void {
    // WTSタグは大文字小文字非区別のため小文字に正規化する
    const normalized = tagName.toLowerCase()
    if (this.handlers.has(normalized)) {
      console.warn(`[CommandRegistry] Overriding existing handler for tag: "${normalized}"`)
    }
    this.handlers.set(normalized, handler)
  }

  /** 複数まとめて登録（組み込みタグのバルク登録用） */
  registerAll(handlers: Record<string, CommandHandler>): void {
    Object.keys(handlers).forEach((tagName) => {
      this.register(tagName, handlers[tagName])
    })
  }

  /** 登録解除。組み込みタグも解除可能（自己責任） */
  unregister(tagName: string): boolean {
    return this.handlers.delete(tagName.toLowerCase())
  }

  /** ディスパッチ実行 */
  async execute(command: ScenarioCommand, context: ExecutionContext): Promise<void> {
    const tagName = (command.type || 'text').toLowerCase()
    const handler = this.handlers.get(tagName)
    if (!handler) {
      throw new Error(`Error: Command type "${tagName}" is not defined`)
    }
    await handler.execute(command, context)
  }

  /** 登録確認（validateScenario / Linter用） */
  has(tagName: string): boolean {
    return this.handlers.has(tagName.toLowerCase())
  }

  /** 登録済みタグ一覧（Linter / VSCode拡張用） */
  getRegisteredTags(): string[] {
    return Array.from(this.handlers.keys())
  }
}
