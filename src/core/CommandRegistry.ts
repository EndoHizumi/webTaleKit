import { EventBus } from '../utils/eventBus'
import { ScenarioManager } from './scenarioManager'
import { Drawer } from './drawer'
import { ImageObject } from '../resource/ImageObject'
import { SoundObject } from '../resource/soundObject'
import { Store } from '../utils/store'
import type { LoadScreenOptions } from './index'
import {
  DisplayedImage,
  DisplayedImageMap,
  EngineConfig,
  SceneConfig,
  SceneFile,
  ScenarioLine,
  UsedSoundMap,
} from './types'

/** パーサーが生成するシナリオオブジェクト1件。エンジンはこれを逐次実行する */
export type ScenarioCommand = ScenarioLine

/**
 * ハンドラから参照できるCoreの公開サーフェス。
 * expandVariable / executeCode / waitHandler 等の共通ユーティリティと、
 * StateManager導入までの暫定としてエンジン状態へのアクセスを提供する。
 */
export interface CoreFacade {
  // 共通ユーティリティ
  expandVariable<T>(text: T): T | string
  executeCode(code: string): unknown
  waitHandler(line: ScenarioLine): Promise<void>
  clickWait(): Promise<null>
  checkResourceExists(url: string | undefined): Promise<boolean>
  getImageObject(line: ScenarioLine): Promise<ImageObject>
  getSoundObject(line: ScenarioLine): Promise<SoundObject>
  // タグディスパッチ用の薄いラッパー（ハンドラ間の相互呼び出しに使用）
  textHandler(scenarioObject: string | ScenarioLine): Promise<void>
  soundHandler(line: ScenarioLine): Promise<void>
  newpageHandler(line?: ScenarioLine): Promise<void> | void
  // シーン読み込み
  loadScene(sceneFileName: string): Promise<void>
  loadScreen(sceneConfig: SceneConfig, options?: LoadScreenOptions): Promise<void>
  // エンジン状態（StateManager導入までの暫定アクセス）
  engineConfig: EngineConfig
  sceneFile: SceneFile
  sceneConfig: SceneConfig
  displayedImages: DisplayedImageMap
  tempImages: DisplayedImageMap
  usedSounds: UsedSoundMap
  bgm: SoundObject | null
  store: Store
  gameContainer: HTMLElement
  isAuto: boolean
  isNext: boolean
  isSkip: boolean
  onNextHandler: (() => void) | null
  setBackground(image: DisplayedImage): void
  getBackground(): ImageObject
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
