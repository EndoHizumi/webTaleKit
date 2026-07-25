import { Drawer } from './drawer'
import { ScenarioManager } from './scenarioManager'
import { ImageObject } from '../resource/ImageObject'
import { ResourceManager } from './resourceManager'
import { SoundObject } from '../resource/soundObject'
import engineConfig from '../../engineConfig.json'
import { sleep } from '../utils/waitUtil'
import { generateStore } from '../utils/store'
import { EventBus } from '../utils/eventBus'
import { DefaultUIHandler } from './defaultUIHandler'
import { logError } from '../utils/logger'
import { CommandRegistry } from './CommandRegistry'
import { registerBuiltinCommands } from '../commands'

export class Core {
  constructor(options = {}) {
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
    this.triggerHandler = builtinHandlers.trigger
    // gameContainerの初期化（HTMLのgameContainerを取得する）
    this.gameContainer = document.getElementById('gameContainer')
    // Drawerの初期化（canvasタグのサイズを設定する)
    this.drawer = new Drawer(this.gameContainer)
    // ScenarioManagerの初期化（変数の初期値設定）
    this.scenarioManager = new ScenarioManager()
    // ResourceManagerの初期化（引数にconfigを渡して、リソース管理配列を作る）
    this.resourceManager = new ResourceManager(import(/* webpackIgnore: true */ '/src/resource/config.js')) //  webpackIgnoreでバンドルを無視する
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

  setConfig(config) {
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
  dispatch(type, line = {}) {
    return this.commandRegistry.execute({ ...line, type }, this.getExecutionContext())
  }

  // カスタムタグの公式登録API
  registerCommand(tagName, handler) {
    this.commandRegistry.register(tagName, handler)
  }

  // 全トリガーを解除する（<route>によるシーン遷移時に呼ばれる）
  clearAllTriggers() {
    if (this.triggerHandler) {
      this.triggerHandler.removeAll()
    }
  }

  async start(initScene) {
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
      onNext: () => { if (this.onNextHandler) this.onNextHandler() },
      setSkip: (drawerSkip, coreNext) => {
        this.drawer.isSkip = drawerSkip
        this.isNext = coreNext
      },
      toggleAuto: () => { this.isAuto = !this.isAuto },
      toggleSkip: () => { this.isSkip = !this.isSkip },
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
      // エラーをログに記録（スタックトレース付き）
      await logError(error, 'Error in runScenario')
       // エラーをアラートで表示
      alert(`システムエラーが発生しました。\n詳細はコンソールで確認してください。:\n${error.message}`)
      throw error
    }
  }

  async loadScene(sceneFileName) {
    // sceneファイルを読み込む
    // ESモジュールの名前空間オブジェクトは外部から書き込み不可なため、プレーンオブジェクトにコピーする
    const moduleNamespace = await import(/* webpackChunkName: "[request]" */ `/src/js/${sceneFileName}.js`)
    this.sceneFile = { ...moduleNamespace }
    // sceneファイルの初期化処理を実行
    if (this.sceneFile.init) {
      this.sceneFile.init(this.getAPIForScript())
    }
    // シナリオの進行状況を初期化
    this.scenarioManager.setScenario(this.sceneFile.scenario, sceneFileName)
    this.sceneConfig = { ...this.sceneConfig, ...this.sceneFile.sceneConfig }
  }

  // ファイルの存在確認を行う関数
  async checkResourceExists(url) {
    try {
      const response = await fetch(url, { method: 'HEAD' })
      return response.ok
    } catch (error) {
      return false
    }
  }

  async loadScreen(sceneConfig, options = {}) {
    const {
      isDialog = false, // ダイアログモードかどうか
      fallbackTemplate = null, // フォールバック用テンプレート
      skipBackground = false, // 背景画像の読み込みをスキップ
    } = options

    // 画面名を設定する。
    this.scenarioManager.progress.currentScene = sceneConfig.name
    this.scenarioManager.setSceneName(sceneConfig.name)
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
      console.info(`background: ${await this.checkResourceExists(sceneConfig.background)}`)
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

  async runScenario() {

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
  async textHandler(scenarioObject) {
    // 文章だけの場合は、contentプロパティに配列として設定する
    if (typeof scenarioObject === 'string') scenarioObject = { content: [scenarioObject] }
    return this.dispatch('text', scenarioObject)
  }

  expandVariable(text) {
    if (typeof text !== 'string') return text
    return text.replace(/{{([^{}]+)}}/g, (match) => {
      const expr = match.slice(2, -2)
      const returnValue = this.executeCode(`return ${expr}`)
      return typeof returnValue == 'object' ? JSON.stringify(returnValue) : returnValue
    })
  }

  async waitHandler(line) {
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
  async clickWait() {
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

  async sayHandler(line) {
    return this.dispatch('say', line)
  }

  async choiceHandler(line) {
    return this.dispatch('choice', line)
  }

  jumpHandler(line) {
    return this.dispatch('jump', line)
  }

  async showHandler(line) {
    return this.dispatch('show', line)
  }

  async hideHandler(line) {
    return this.dispatch('hide', line)
  }

  async moveToHandler(line) {
    return this.dispatch('moveto', line)
  }

  async getImageObject(line) {
    const name = line.name || line.src.split('/').pop()
    let image

    // ファイルの存在確認
    if (!(await this.checkResourceExists(line.src))) {
      throw new Error(`Image file not found: ${line.src}`)
    }

    // 既にインスタンスがある場合は、それを使う
    if (Object.hasOwn(this.displayedImages, name)) {
      const targetImage = this.displayedImages[name]
      const imageObject = targetImage ? targetImage.image : new ImageObject()
      image = await imageObject.setImageAsync(line.src)
    } else {
      image = await new ImageObject().setImageAsync(line.src)
    }
    return image
  }

  async soundHandler(line) {
    return this.dispatch('sound', line)
  }

  async getSoundObject(line) {
    const name = line.name || line.src.split('/').pop()
    let resource

    // ファイルの存在確認
    if (line.src) {
      if (!(await this.checkResourceExists(line.src))) {
        throw new Error(`Sound file not found: ${line.src}`)
      }
    }

    // 既にインスタンスがある場合は、それを使う
    if (Object.hasOwn(this.usedSounds, name)) {
      const targetResource = this.usedSounds[name]
      const soundObject = targetResource ? targetResource.audio : new SoundObject()
      resource = await soundObject.setAudioAsync(line.src)
    } else {
      resource = await new SoundObject().setAudioAsync(line.src)
    }
    return resource
  }

  newpageHandler(line) {
    return this.dispatch('newpage', line)
  }

  async ifHandler(line) {
    return this.dispatch('if', line)
  }

  async routeHandler(line) {
    return this.dispatch('route', line)
  }

  async callHandler(line) {
    return this.dispatch('call', line)
  }

  async httpHandler(line) {
    if (!(line.get || line.post || line.put || line.delete)) {
      return line
    }
    // progress属性を処理する
    // prettier-ignore
    const progressText = line.content.filter((content) => content.type === 'progress')[0]
    if (progressText) {
      await this.textHandler({ content: [progressText.content][0], wait: 0 })
    }
    // get,post,put,delete属性を処理する
    const headers = line.content
      .filter((content) => content.type === 'header')[0]
      .content.reduce(
        (acc, header) => ({
          ...acc,
          [header.type]: header.content,
        }),
        {},
      )
    const body = line.content
      .filter((content) => content.type === 'data')[0]
      .content.reduce(
        (acc, header) => ({
          ...acc,
          [header.type]: header.content,
        }),
        {},
      )
    const response = await fetch(line.get || line.post || line.put || line.delete, {
      method: line.get ? 'GET' : line.post ? 'POST' : line.put ? 'PUT' : 'DELETE',
      headers: headers,
      body: JSON.stringify(body),
    })
    if (response.ok) {
      const json = await response.json()
      this.sceneFile.res = json
      line.then = line.content.filter((content) => content.type === 'then')[0].content
    } else {
      this.sceneFile.res = json
      line.error = line.content.filter((content) => content.type === 'error')[0].content
    }
    if (line.content) {
      line.content = line.content.filter(
        (content) =>
          !(
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

  async dialogHandler(scenarioObject) {
    return this.dispatch('dialog', scenarioObject)
  }

  setBackground(image) {
    this.displayedImages['background'] = image
  }

  getBackground() {
    return this.displayedImages['background'].image
  }

  executeCode(code) {
    try {
      const keys = Object.keys(this.sceneFile).filter((key) => /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key))
      const declarations = keys.map((key) => `let ${key} = _ctx[${JSON.stringify(key)}];`).join('\n')
      const writeBacks = keys.map((key) => `_ctx[${JSON.stringify(key)}] = ${key};`).join('\n')
      const wrappedCode = `${declarations}\nconst _result = (function() { ${code} })();\n${writeBacks}\nreturn _result;`
      const func = new Function('_ctx', wrappedCode)
      return func(this.sceneFile)
    } catch (error) {
      throw new Error(`Error executing code: ${error.message}`)
    }
  }

  async executeScenario(scenarioObjects) {
    const snap = this.scenarioManager.snapshot()
    try {
      this.scenarioManager.setScenario(scenarioObjects)
      await this.runScenario()
      return { success: true }
    } catch (error) {
      console.error('scenario error:', error)
      return {
        success: false,
        error: error.message || 'Unknown error',
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
        stop: (name) => this.soundHandler({ name, stop: true }),
        pause: (name) => this.soundHandler({ name, pause: true }),
      },
      scenario: {
        jump: this.jumpHandler.bind(this),
        addScene: this.scenarioManager.addScenario.bind(this.scenarioManager),
        getProgress: () => this.scenarioManager.progress,
        setProgress: (progress) => (this.scenarioManager.progress = progress),
        getIndex: () => this.scenarioManager.getIndex(),
        setIndex: (index) => this.scenarioManager.setIndex(index),
        hasNext: () => this.scenarioManager.hasNext(),
        next: () => this.scenarioManager.next(),
        getHistory: () => this.scenarioManager.getHistory(),
        setHistory: (history) => this.scenarioManager.setHistory(history),
        setScenario: (scenario) => this.scenarioManager.setScenario(scenario),
        getScenario: () => this.scenarioManager.getScenario(),
        getSceneName: () => this.scenarioManager.progress.currentScene,
        setScreenName: (name) => (this.sceneConfig.name = name),
      },
      images: {
        get: this.getImageObject.bind(this),
        getAll: () => this.displayedImages,
        set: (name, image) => (this.displayedImages[name] = image),
        delete: (name) => delete this.displayedImages[name],
      },
      sounds: {
        get: (name) => this.usedSounds[name],
        getAll: () => this.usedSounds,
        set: (name, sound) => (this.usedSounds[name] = sound),
        delete: (name) => delete this.usedSounds[name],
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
        setSaveData: (data) => this.setSaveData(data),
        getSaveList: () => this.getSaveList(),
        deleteSave: (slot) => this.deleteSave(slot),
      },
      store: this.store,
      playback: {
        toggleAuto: () => { this.isAuto = !this.isAuto },
        setAuto: (value) => { this.isAuto = value },
        getAuto: () => this.isAuto,
        toggleSkip: () => { this.isSkip = !this.isSkip },
        setSkip: (value) => { this.isSkip = value },
        getSkip: () => this.isSkip,
      },
      sandbox: {
        execute: this.executeScenario.bind(this),
      },
    }
  }

  async saveHandler(line) {
    return this.dispatch('save', line)
  }

  async loadHandler(line) {
    return this.dispatch('load', line)
  }

  getSaveData() {
    const saveKeys = Object.keys(this.store).filter((key) => key.startsWith('save_'))
    return saveKeys
      .map((key) => this.store[key])
      .sort((a, b) => {
        return new Date(b.timestamp) - new Date(a.timestamp)
      })
  }

  setSaveData(data) {
    this.store.set(`save_${data.slot}`, data)
  }

  getSaveList() {
    return this.getSaveData()
  }

  deleteSave(slot) {
    this.store.remove(`save_${slot}`)
  }
}
