import { Drawer } from './drawer'
import { ScenarioManager } from './scenarioManager'
import { ImageObject } from '../resource/ImageObject'
import { ResourceManager } from './resourceManager'
import { SoundObject } from '../resource/soundObject'
import engineConfig from '../../engineConfig.json'
import { sleep } from '../utils/waitUtil'
import { generateStore, Store } from '../utils/store'
import { EventBus } from '../utils/eventBus'
import { DefaultUIHandler } from './defaultUIHandler'
import { DomElementHandler } from './domElementHandler'
import { logError } from '../utils/logger'
import { CommandHandler, CommandRegistry } from './CommandRegistry'
import { registerBuiltinCommands, TriggerHandler } from '../commands'
import {
  DisplayedImage,
  DisplayedImageMap,
  EngineConfig,
  Progress,
  SaveData,
  SceneConfig,
  SceneFile,
  ScenarioContent,
  ScenarioLine,
  UsedSound,
  UsedSoundMap,
} from './types'

export interface CoreOptions {
  // trueの場合、DefaultUIHandlerの登録をスキップして独自UIを使う
  customUI?: boolean
}

// loadScreenの動作オプション
export interface LoadScreenOptions {
  isDialog?: boolean
  fallbackTemplate?: (() => { htmlString: string; styleString: string }) | null
  skipBackground?: boolean
  skipBgm?: boolean
}

// シナリオのcontent要素がコマンドオブジェクトかどうかを判定する
const isLine = (content: ScenarioContent): content is ScenarioLine => typeof content !== 'string'

// ゲーム側リソース設定のパス。ルート絶対パスはTSのモジュール解決対象にできないため定数経由で渡す
const RESOURCE_CONFIG_PATH = '/src/resource/config.js'

export class Core {
  bgm: SoundObject | null
  isAuto: boolean
  isNext: boolean
  isSkip: boolean
  onNextHandler: (() => void) | null
  sceneFile: SceneFile
  sceneConfig: SceneConfig
  engineConfig: EngineConfig
  commandRegistry: CommandRegistry
  triggerHandler: TriggerHandler
  gameContainer: HTMLElement
  drawer: Drawer
  scenarioManager: ScenarioManager
  domElementHandler: DomElementHandler
  resourceManager: ResourceManager
  displayedImages: DisplayedImageMap
  tempImages: DisplayedImageMap
  usedSounds: UsedSoundMap
  store: Store
  eventBus: EventBus

  constructor(options: CoreOptions = {}) {
    // プロパティの初期化
    this.bgm = null
    this.isAuto = false
    this.isNext = false
    this.isSkip = false
    this.onNextHandler = null
    this.sceneFile = {}
    this.sceneConfig = {}
    this.engineConfig = engineConfig
    // CommandRegistryの初期化（タグ→ハンドラのマッピングを登録制で管理する）
    this.commandRegistry = new CommandRegistry()
    const builtinHandlers = registerBuiltinCommands(this.commandRegistry)
    // triggerハンドラはシーン遷移時の全解除のために参照を保持する
    this.triggerHandler = builtinHandlers.trigger as TriggerHandler
    // gameContainerの初期化（HTMLのgameContainerを取得する）
    this.gameContainer = document.getElementById('gameContainer') as HTMLElement
    // Drawerの初期化（canvasタグのサイズを設定する)
    this.drawer = new Drawer(this.gameContainer)
    // ScenarioManagerの初期化（変数の初期値設定）
    this.scenarioManager = new ScenarioManager()
    // DomElementHandlerの初期化
    this.domElementHandler = new DomElementHandler(this.gameContainer, (content) => this.scenarioManager.addScenario(content))
    // ResourceManagerの初期化（引数にconfigを渡して、リソース管理配列を作る）
    this.resourceManager = new ResourceManager(import(/* webpackIgnore: true */ RESOURCE_CONFIG_PATH)) //  webpackIgnoreでバンドルを無視する
    this.displayedImages = {}
    this.tempImages = {}
    this.usedSounds = {}
    // ストレージの初期化
    this.store = generateStore()
    // EventBusの初期化
    this.eventBus = new EventBus()
    // DefaultUIHandlerの登録（customUI: trueの場合はスキップ）
    if (!options.customUI) {
      DefaultUIHandler.register(this.eventBus, this.drawer, this.gameContainer, this.engineConfig.resolution)
    }
  }

  setConfig(config: EngineConfig): void {
    // ゲームの設定情報をセットする
    this.engineConfig = config
  }

  // ハンドラに渡す実行コンテキスト（依存注入）を生成する
  getExecutionContext() {
    return {
      eventBus: this.eventBus,
      scenarioManager: this.scenarioManager,
      drawer: this.drawer,
      core: this,
    }
  }

  // タグ名を指定してCommandRegistry経由でハンドラを実行する（内部ディスパッチ用）
  dispatch(type: string, line: ScenarioLine = {}): Promise<void> {
    return this.commandRegistry.execute({ ...line, type }, this.getExecutionContext())
  }

  // カスタムタグの公式登録API
  registerCommand(tagName: string, handler: CommandHandler): void {
    this.commandRegistry.register(tagName, handler)
  }

  // 全トリガーを解除する（<route>によるシーン遷移時に呼ばれる）
  clearAllTriggers(): void {
    if (this.triggerHandler) {
      this.triggerHandler.removeAll()
    }
  }

  async start(initScene?: string): Promise<void> {
    try {
      // TODO: ブラウザ用のビルドの場合は、最初にクリックしてもらう
      // titleタグの内容を書き換える
      document.title = this.engineConfig.title
      // sceneファイルを読み込む
      await this.loadScene(initScene || 'title')
      // 画面を表示する
      await this.loadScreen(this.sceneConfig)
      // 入力イベントを設定する（DefaultUIHandlerに委譲）
      await this.eventBus.emit('input:bind', {
        onNext: () => {
          if (this.onNextHandler) this.onNextHandler()
        },
        setSkip: (drawerSkip: boolean, coreNext: boolean) => {
          this.drawer.isSkip = drawerSkip
          this.isNext = coreNext
        },
        toggleAuto: () => {
          this.isAuto = !this.isAuto
        },
        toggleSkip: () => {
          this.isSkip = !this.isSkip
        },
      })

      await this.textHandler('タップでスタート')
      // BGMを再生する
      await this.soundHandler({
        mode: 'bgm',
        src: this.sceneConfig.bgm,
        loop: true,
        play: true,
      })
      // シナリオを実行する
      while (this.scenarioManager.hasNext()) {
        await this.runScenario()
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      // エラーをログに記録（スタックトレース付き）
      await logError(err, 'Error in runScenario')
      // エラーをアラートで表示
      alert(`システムエラーが発生しました。\n詳細はコンソールで確認してください。:\n${err.message}`)
      throw error
    }
  }

  async loadScene(sceneFileName: string): Promise<void> {
    // sceneファイルを読み込む
    // ESモジュールの名前空間オブジェクトは外部から書き込み不可なため、プレーンオブジェクトにコピーする
    const moduleNamespace = await import(/* webpackChunkName: "[request]" */ `/src/js/${sceneFileName}.js`)
    this.sceneFile = { ...moduleNamespace } as SceneFile
    // sceneファイルの初期化処理を実行
    if (this.sceneFile.init) {
      this.sceneFile.init(this.getAPIForScript())
    }
    // シナリオの進行状況を初期化
    this.scenarioManager.setScenario(this.sceneFile.scenario, sceneFileName)
    this.sceneConfig = { ...this.sceneConfig, ...this.sceneFile.sceneConfig }
  }

  // ファイルの存在確認を行う関数
  async checkResourceExists(url: string | undefined): Promise<boolean> {
    try {
      const response = await fetch(String(url), { method: 'HEAD' })
      return response.ok
    } catch (error) {
      return false
    }
  }

  async loadScreen(sceneConfig: SceneConfig, options: LoadScreenOptions = {}): Promise<void> {
    const {
      isDialog = false, // ダイアログモードかどうか
      fallbackTemplate = null, // フォールバック用テンプレート
      skipBackground = false, // 背景画像の読み込みをスキップ
    } = options

    // 画面名を設定する。
    this.scenarioManager.progress.currentScene = sceneConfig.name ?? ''
    this.scenarioManager.setSceneName(sceneConfig.name ?? '')
    // テンプレートの存在確認（ダイアログ以外のみ）
    if (!isDialog && !(await this.checkResourceExists(sceneConfig.template))) {
      console.error(`Template file not found: ${sceneConfig.template}`)
      throw new Error(`Template file not found: ${sceneConfig.template}`)
    }

    if (!this.gameContainer) {
      throw new Error('Game container not found.')
    }

    // screen:loadイベントを発行してHTMLの読み込み・パース・DOM注入をDefaultUIHandlerに委譲する
    // テンプレートURLとフォールバック関数を渡すことで、UIフレームワークが独自のfetch/描画処理を実装できる
    await this.eventBus.emit('screen:load', {
      template: sceneConfig.template,
      isDialog,
      fallbackTemplate,
    })

    if (!skipBackground) {
      // 背景画像の存在確認
      if (!(await this.checkResourceExists(sceneConfig.background))) {
        throw new Error(`Background image not found: ${sceneConfig.background}`)
      } else {
        // 背景画像を表示する
        const background = await new ImageObject().setImageAsync(sceneConfig.background)
        this.displayedImages['background'] = {
          image: background,
          size: {
            width: this.gameContainer.clientWidth,
            height: this.gameContainer.clientHeight,
          },
        }
      }
      this.drawer.show(this.displayedImages)
    }
  }

  async runScenario(): Promise<void> {
    let scenarioObject = this.scenarioManager.next()
    if (!scenarioObject) {
      return
    }
    // シナリオオブジェクトのtypeプロパティに応じて、対応するハンドラをCommandRegistryから実行する
    const commandType = (scenarioObject.type || 'text').toLowerCase()

    // コマンドが存在しない場合のエラーハンドリング
    if (!this.commandRegistry.has(commandType)) {
      const errorMessage = `Error: Command type "${commandType}" is not defined`
      throw new Error(errorMessage)
    }

    scenarioObject = await this.httpHandler(scenarioObject)

    // ifグローバル属性の処理
    if (scenarioObject.if !== undefined) {
      const condition = this.executeCode(`return ${scenarioObject.if}`)

      // 条件がfalseの場合、このタグの処理をスキップ
      if (!condition) {
        return
      }
    }

    await this.commandRegistry.execute(scenarioObject, this.getExecutionContext())
  }

  // 以下のxxxHandlerは、src/commands/ 配下の各CommandHandlerへ委譲する薄いラッパー。
  // getAPIForScript()やハンドラ間の相互呼び出しの互換性のために残している。
  async textHandler(scenarioObject: string | ScenarioLine): Promise<void> {
    // 文章だけの場合は、contentプロパティに配列として設定する
    const line: ScenarioLine = typeof scenarioObject === 'string' ? { content: [scenarioObject] } : scenarioObject
    return this.dispatch('text', line)
  }

  expandVariable<T>(text: T): T | string {
    if (typeof text !== 'string') return text
    return text.replace(/{{([^{}]+)}}/g, (match) => {
      const expr = match.slice(2, -2)
      const returnValue = this.executeCode(`return ${expr}`)
      return typeof returnValue == 'object' ? JSON.stringify(returnValue) : String(returnValue)
    })
  }

  async waitHandler(line: ScenarioLine): Promise<void> {
    // line.timeがある場合、line.waitに代入する
    if (line.time) line.wait = line.time
    //prettier-ignore
    this.onNextHandler = () => { this.isNext = true }

    // line.waitが数値に変換可能な文字列の場合、数値に変換
    if (typeof line.wait === 'string' && !isNaN(Number(line.wait))) {
      line.wait = Number(line.wait)
    }

    // スキップモードが有効な場合は全ての待機をスキップする
    if (this.isSkip) {
      return
    }

    if (typeof line.wait === 'number') {
      if (line.wait > 0 || this.isAuto) {
        const waitTime = line.wait || 1500
        // 指定された時間だけ待機
        await sleep(waitTime)
      }
    } else {
      if (this.isAuto) {
        // オートモードが有効な場合はデフォルト時間後に自動進行する
        await sleep(1500)
      } else {
        // 改行ごとに入力待ち
        await this.clickWait()
      }
    }
  }

  // クリック待ち処理
  async clickWait(): Promise<null> {
    this.drawer.setVisibility('#waitCircle', true)
    return new Promise((resolve) => {
      const intervalId = setInterval(() => {
        if (this.isNext || this.isAuto || this.isSkip) {
          this.drawer.setVisibility('#waitCircle', false)
          clearInterval(intervalId)
          this.isNext = false
          resolve(null)
        }
      }, 500)
    })
  }

  async sayHandler(line: ScenarioLine): Promise<void> {
    return this.dispatch('say', line)
  }

  async choiceHandler(line: ScenarioLine): Promise<void> {
    return this.dispatch('choice', line)
  }

  jumpHandler(line: ScenarioLine): Promise<void> {
    return this.dispatch('jump', line)
  }

  async showHandler(line: ScenarioLine): Promise<void> {
    return this.dispatch('show', line)
  }

  async hideHandler(line: ScenarioLine): Promise<void> {
    return this.dispatch('hide', line)
  }

  async moveToHandler(line: ScenarioLine): Promise<void> {
    return this.dispatch('moveto', line)
  }

  async getImageObject(line: ScenarioLine): Promise<ImageObject> {
    const name = line.name || line.src!.split('/').pop()!
    let image: ImageObject

    // ファイルの存在確認
    if (!(await this.checkResourceExists(line.src))) {
      throw new Error(`Image file not found: ${line.src}`)
    }

    // 既にインスタンスがある場合は、それを使う
    if (Object.hasOwn(this.displayedImages, name) && this.displayedImages[name].image) {
      image = this.displayedImages[name].image
    } else {
      image = await new ImageObject().setImageAsync(line.src)
    }
    return image
  }

  async soundHandler(line: ScenarioLine): Promise<void> {
    return this.dispatch('sound', line)
  }

  async getSoundObject(line: ScenarioLine): Promise<SoundObject> {
    const name = line.name || (line.src || line.voice)!.split('/').pop()!
    let resource: SoundObject
    const soundObjectPath = line.src || line.voice

    // ファイルの存在確認
    if (line.src  || line.voice) {
      if (!(await this.checkResourceExists(soundObjectPath))) {
        throw new Error(`Sound file not found: ${soundObjectPath}`)
      }
    }

    // 既にインスタンスがある場合は、それを使う
    if (Object.hasOwn(this.usedSounds, name)) {
      const targetResource = this.usedSounds[name]
      const soundObject = targetResource ? targetResource.audio : new SoundObject()
      resource = await soundObject.setAudioAsync(soundObjectPath)
    } else {
      resource = await new SoundObject().setAudioAsync(soundObjectPath)
    }
    return resource
  }

  newpageHandler(line: ScenarioLine = {}): Promise<void> {
    return this.dispatch('newpage', line)
  }

  async ifHandler(line: ScenarioLine): Promise<void> {
    return this.dispatch('if', line)
  }

  async routeHandler(line: ScenarioLine): Promise<void> {
    return this.dispatch('route', line)
  }

  async callHandler(line: ScenarioLine): Promise<void> {
    return this.dispatch('call', line)
  }

  async httpHandler(line: ScenarioLine): Promise<ScenarioLine> {
    if (!(line.get || line.post || line.put || line.delete)) {
      return line
    }
    const contents = (line.content ?? []).filter(isLine)
    // progress属性を処理する
    // prettier-ignore
    const progressText = contents.filter((content) => content.type === 'progress')[0]
    if (progressText) {
      await this.textHandler({ content: [progressText.content][0] as ScenarioContent[], wait: 0 })
    }
    // get,post,put,delete属性を処理する
    const headers = contents
      .filter((content) => content.type === 'header')[0]!
      .content!.filter(isLine)
      .reduce<Record<string, unknown>>(
        (acc, header) => ({
          ...acc,
          [String(header.type)]: header.content,
        }),
        {},
      )
    const body = contents
      .filter((content) => content.type === 'data')[0]!
      .content!.filter(isLine)
      .reduce<Record<string, unknown>>(
        (acc, header) => ({
          ...acc,
          [String(header.type)]: header.content,
        }),
        {},
      )
    const response = await fetch((line.get || line.post || line.put || line.delete)!, {
      method: line.get ? 'GET' : line.post ? 'POST' : line.put ? 'PUT' : 'DELETE',
      headers: headers as HeadersInit,
      body: JSON.stringify(body),
    })
    // レスポンスは成否に関わらずsceneFile.resへ格納する（JS版のエラー分岐は未定義変数を参照していた）
    const json: unknown = response.ok ? await response.json() : null
    this.sceneFile.res = json
    if (response.ok) {
      line.then = contents.filter((content) => content.type === 'then')[0]!.content
    } else {
      line.error = contents.filter((content) => content.type === 'error')[0]!.content
    }
    if (line.content) {
      line.content = line.content.filter(
        (content) =>
          !(
            isLine(content) &&
            content.type &&
            (content.type === 'header' ||
              content.type === 'data' ||
              content.type === 'then' ||
              content.type === 'error' ||
              content.type === 'progress')
          ),
      )
    }
    return line
  }

  async dialogHandler(scenarioObject: ScenarioLine): Promise<void> {
    return this.dispatch('dialog', scenarioObject)
  }

  setBackground(image: DisplayedImage): void {
    this.displayedImages['background'] = image
  }

  getBackground(): ImageObject {
    return this.displayedImages['background'].image
  }

  executeCode(code: string): unknown {
    try {
      const keys = Object.keys(this.sceneFile).filter((key) => /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key))
      const declarations = keys.map((key) => `let ${key} = _ctx[${JSON.stringify(key)}];`).join('\n')
      const writeBacks = keys.map((key) => `_ctx[${JSON.stringify(key)}] = ${key};`).join('\n')
      const wrappedCode = `${declarations}\nconst _result = (function() { ${code} })();\n${writeBacks}\nreturn _result;`
      const func = new Function('_ctx', wrappedCode)
      return func(this.sceneFile)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      throw new Error(`Error executing code: ${message}`)
    }
  }

  async executeScenario(scenarioObjects: ScenarioLine[]): Promise<{ success: boolean; error?: string }> {
    const snap = this.scenarioManager.snapshot()
    try {
      this.scenarioManager.setScenario(scenarioObjects)
      await this.runScenario()
      return { success: true }
    } catch (error) {
      console.error('scenario error:', error)
      return {
        success: false,
        error: (error instanceof Error && error.message) || 'Unknown error',
      }
    } finally {
      this.scenarioManager.restore(snap)
    }
  }

  // Scriptから安全にアクセスできるメソッドを定義
  getAPIForScript() {
    return {
      eventBus: this.eventBus,
      drawer: {
        drawName: this.drawer.drawName.bind(this.drawer),
        drawText: this.drawer.drawText.bind(this.drawer),
        drawChoices: this.drawer.drawChoices.bind(this.drawer),
        clearText: this.drawer.clearText.bind(this.drawer),
        show: this.drawer.show.bind(this.drawer),
        moveTo: this.drawer.moveTo.bind(this.drawer),
        fadeIn: this.drawer.fadeIn.bind(this.drawer),
        fadeOut: this.drawer.fadeOut.bind(this.drawer),
      },
      sound: {
        play: this.soundHandler.bind(this),
        stop: (name: string) => this.soundHandler({ name, stop: true }),
        pause: (name: string) => this.soundHandler({ name, pause: true }),
      },
      scenario: {
        jump: this.jumpHandler.bind(this),
        addScene: this.scenarioManager.addScenario.bind(this.scenarioManager),
        getProgress: () => this.scenarioManager.progress,
        setProgress: (progress: Progress) => (this.scenarioManager.progress = progress),
        getIndex: () => this.scenarioManager.getIndex(),
        setIndex: (index: number) => this.scenarioManager.setIndex(index),
        hasNext: () => this.scenarioManager.hasNext(),
        next: () => this.scenarioManager.next(),
        getHistory: () => this.scenarioManager.getHistory(),
        setHistory: (history: unknown) => this.scenarioManager.setHistory(history),
        setScenario: (scenario: ScenarioLine[]) => this.scenarioManager.setScenario(scenario),
        getScenario: () => this.scenarioManager.getScenario(),
        getSceneName: () => this.scenarioManager.progress.currentScene,
        setScreenName: (name: string) => (this.sceneConfig.name = name),
      },
      images: {
        get: this.getImageObject.bind(this),
        getAll: () => this.displayedImages,
        set: (name: string, image: DisplayedImage) => (this.displayedImages[name] = image),
        delete: (name: string) => delete this.displayedImages[name],
      },
      sounds: {
        get: (name: string) => this.usedSounds[name],
        getAll: () => this.usedSounds,
        set: (name: string, sound: UsedSound) => (this.usedSounds[name] = sound),
        delete: (name: string) => delete this.usedSounds[name],
        load: this.getSoundObject.bind(this),
      },
      background: {
        set: this.setBackground.bind(this),
        get: this.getBackground.bind(this),
      },
      wait: this.waitHandler.bind(this),
      clickWait: this.clickWait.bind(this),
      core: {
        text: this.textHandler.bind(this),
        choice: this.choiceHandler.bind(this),
        show: this.showHandler.bind(this),
        newpage: this.newpageHandler.bind(this),
        hide: this.hideHandler.bind(this),
        jump: this.jumpHandler.bind(this),
        sound: this.soundHandler.bind(this),
        say: this.sayHandler.bind(this),
        if: this.ifHandler.bind(this),
        moveto: this.moveToHandler.bind(this),
        route: this.routeHandler.bind(this),
        wait: this.waitHandler.bind(this),
        save: this.saveHandler.bind(this),
        load: this.loadHandler.bind(this),
      },
      save: {
        save: this.saveHandler.bind(this),
        load: this.loadHandler.bind(this),
        getSaveData: () => this.getSaveData(),
        setSaveData: (data: SaveData) => this.setSaveData(data),
        getSaveList: () => this.getSaveList(),
        deleteSave: (slot: string | number) => this.deleteSave(slot),
      },
      store: this.store,
      playback: {
        toggleAuto: () => {
          this.isAuto = !this.isAuto
        },
        setAuto: (value: boolean) => {
          this.isAuto = value
        },
        getAuto: () => this.isAuto,
        toggleSkip: () => {
          this.isSkip = !this.isSkip
        },
        setSkip: (value: boolean) => {
          this.isSkip = value
        },
        getSkip: () => this.isSkip,
      },
      sandbox: {
        execute: this.executeScenario.bind(this),
      },
    }
  }

  async saveHandler(line: ScenarioLine): Promise<void> {
    return this.dispatch('save', line)
  }

  async loadHandler(line: ScenarioLine): Promise<void> {
    return this.dispatch('load', line)
  }

  getSaveData(): SaveData[] {
    const saveKeys = Object.keys(this.store).filter((key) => key.startsWith('save_'))
    return saveKeys
      .map((key) => this.store[key] as SaveData)
      .sort((a, b) => {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      })
  }

  setSaveData(data: SaveData): void {
    this.store.set(`save_${data.slot}`, data)
  }

  getSaveList(): SaveData[] {
    return this.getSaveData()
  }

  deleteSave(slot: string | number): void {
    this.store.remove(`save_${slot}`)
  }
}

// .sceneファイルの<script>から利用できるAPIの型（getAPIForScriptの戻り値）
export type ScriptAPI = ReturnType<Core['getAPIForScript']>
