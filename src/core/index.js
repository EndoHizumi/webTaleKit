import { Drawer } from './drawer'
import { ScenarioManager } from './scenarioManager'
import { ImageObject } from '../resource/ImageObject'
import { ResourceManager } from './resourceManager'
import { SoundObject } from '../resource/soundObject'
import engineConfig from '../../engineConfig.json'
import { outputLog } from '../utils/logger'
import { sleep } from '../utils/waitUtil'

export class Core {
  bgm = null
  isAuto = false
  isNext = false
  isSkip = false
  onNextHandler = null
  sceneFile = {}
  sceneConfig = {}
  commandList = {
    text: this.textHandler,
    choice: this.choiceHandler,
    show: this.showHandler,
    newpage: this.newpageHandler,
    hide: this.hideHandler,
    jump: this.jumpHandler,
    sound: this.soundHandler,
    say: this.sayHandler,
    if: this.ifHandler,
    call: this.callHandler,
    moveto: this.moveToHandler,
    route: this.routeHandler,
    wait: this.waitHandler,
  }

  constructor() {
    this.gameContainer = document.getElementById('gameContainer')
    // Drawerの初期化（canvasタグのサイズを設定する)
    this.drawer = new Drawer(this.gameContainer)
    // ScenarioManagerの初期化（変数の初期値設定）
    this.scenarioManager = new ScenarioManager()
    // ResourceManagerの初期化（引数にconfigを渡して、リソース管理配列を作る）
    this.resourceManager = new ResourceManager(import(/* webpackIgnore: true */ '/src/resource/config.js')) //  webpackIgnoreでバンドルを無視する
    this.displayedImages = {}
    this.usedSounds = {}
  }

  async start(initScene) {
    outputLog('call', 'debug', initScene)
    // TODO: ブラウザ用のビルドの場合は、最初にクリックしてもらう
    // titleタグの内容を書き換える
    document.title = engineConfig.title
    // sceneファイルを読み込む
    await this.loadScene(initScene || 'title')
    // 画面を表示する
    await this.loadScreen(this.sceneConfig)
    // 入力イベントを設定する
    document.querySelector('#gameContainer').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.onNextHandler()
      } else if (e.key === 'Control') {
        this.drawer.isSkip = true
        this.isNext = true
      }
    })
    document.querySelector('#gameContainer').addEventListener('keyup', (e) => {
      if (e.key === 'Control') {
        this.drawer.isSkip = true
        this.isNext = false
      }
    })
    document.querySelector('#gameContainer').addEventListener('click', (e) => {
      this.onNextHandler()
    })

    await this.textHandler('タップでスタート')
    // BGMを再生する
    this.bgm.play(true)
    // シナリオを実行する
    while (this.scenarioManager.hasNext()) {
      await this.runScenario()
    }
  }

  async loadScene(sceneFileName) {
    outputLog('call', 'debug', sceneFileName)
    // sceneファイルを読み込む
    this.sceneFile = await import(/* webpackChunkName: "[request]" */ `/src/js/${sceneFileName}.js`)
    // sceneファイルの初期化処理を実行
    if (this.sceneFile.init) {
      this.sceneFile.init(this.getAPIForScript())
    }
    // シナリオの進行状況を初期化
    this.scenarioManager.setScenario(this.sceneFile.scenario, sceneFileName)
    this.sceneConfig = { ...this.sceneConfig, ...this.sceneFile.sceneConfig }
    outputLog('sceneFile', 'debug', this.sceneFile)
  }

  async loadScreen(sceneConfig) {
    outputLog('call', 'debug', sceneConfig)
    // sceneConfig.templateを読み込んで、HTMLを表示する
    const htmlString = await (await fetch(sceneConfig.template)).text()
    // 読み込んだhtmlからIDにmainを持つdivタグとStyleタグ以下を取り出して、gameContainerに表示する
    var parser = new DOMParser()
    var doc = parser.parseFromString(htmlString, 'text/html')
    this.gameContainer.innerHTML = doc.getElementById('main').innerHTML
    // 既に読み込んだスタイルシートがあったら削除する
    const styleTags = document.head.getElementsByTagName('style')
    for (const styleTag of styleTags) {
      document.head.removeChild(styleTag)
    }

    // Styleタグを取り出して、headタグに追加する
    const styleElement = doc.head.getElementsByTagName('style')[0]
    document.head.appendChild(styleElement)
    // ゲーム進行用に必要な情報をセットする
    this.drawer.setScreen(this.gameContainer, engineConfig.resolution)
    // シナリオの進行状況を保存
    this.scenarioManager.progress.currentScene = sceneConfig.name
    // 背景画像を表示する
    const background = await new ImageObject().setImageAsync(sceneConfig.background)
    this.displayedImages['background'] = {
      image: background,
      size: {
        width: this.gameContainer.clientWidth,
        height: this.gameContainer.clientHeight,
      },
    }
    this.drawer.show(this.displayedImages)
    this.bgm = await new SoundObject().setAudioAsync(sceneConfig.bgm)
  }

  async runScenario() {
    outputLog('call index:', 'debug', this.scenarioManager.getIndex())
    let scenarioObject = this.scenarioManager.next()
    if (!scenarioObject) {
      return
    }
    outputLog('scenarioObject', 'debug', scenarioObject)
    // シナリオオブジェクトのtypeプロパティに応じて、対応する関数を実行する
    const boundFunction = this.commandList[scenarioObject.type || 'text'].bind(this)
    outputLog(`boundFunction:${boundFunction.name.split(' ')[1]}`, 'debug', scenarioObject)
    scenarioObject = await this.httpHandler(scenarioObject)
    await boundFunction(scenarioObject)
  }

  async textHandler(scenarioObject) {
    outputLog('textHandler:line', 'debug', scenarioObject)
    // 文章だけの場合は、contentプロパティに配列として設定する
    if (typeof scenarioObject === 'string') scenarioObject = { content: [scenarioObject] }
    // httpレスポンスがある場合は、list.contentに追加して、表示対象に加える
    if (scenarioObject.then || scenarioObject.error) {
      scenarioObject.content = scenarioObject.content.concat(scenarioObject.then || scenarioObject.error)
    }
    outputLog('call', 'debug', scenarioObject)

    // 名前が設定されている場合は、名前を表示する
    if (scenarioObject.name) {
      this.drawer.drawName(scenarioObject.name)
    } else {
      this.drawer.drawName('')
    }

    //prettier-ignore
    this.onNextHandler = () => { this.drawer.isSkip = true }
    this.drawer.clearText() // テキスト表示領域をクリア
    // 表示する文章を1行ずつ表示する
    for (const text of scenarioObject.content) {
      outputLog('textSpeed', 'debug', text)
      if (typeof text === 'string') {
        await this.drawer.drawText(this.expandVariable(text), scenarioObject.speed || 25)
      } else {
        if (text.type === 'br' || text.type === 'wait') {
          outputLog('text', 'debug', text)
          if (text.type === 'br') this.drawer.drawLineBreak()
          if (!text.nw) {
            await this.waitHandler({ wait: text.time })
          }
        } else {
          const container = this.drawer.createDecoratedElement(text)
          await this.drawer.drawText(this.expandVariable(text.content[0]), text.speed || 25, container)
        }
      }
    }
    await this.waitHandler({ wait: scenarioObject.time })
    this.drawer.isSkip = false
    this.scenarioManager.setHistory(scenarioObject.content)
  }

  expandVariable(text) {
    outputLog('call', 'debug', text)
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
    outputLog('call', 'debug', line)
    //prettier-ignore
    this.onNextHandler = () => { this.isNext = true }
    outputLog('wait type', 'debug', typeof line.wait)

    // line.waitが数値に変換可能な文字列の場合、数値に変換
    if (typeof line.wait === 'string' && !isNaN(Number(line.wait))) {
      line.wait = Number(line.wait)
    }
    if (typeof line.wait === 'number') {
      outputLog('wait number', 'debug', line.wait)
      if (line.wait > 0 || this.isAuto) {
        const waitTime = line.wait || 1500
        // 指定された時間だけ待機
        await sleep(waitTime)
      }
    } else {
      // 改行ごとに入力待ち
      await this.clickWait()
    }
  }

  // クリック待ち処理
  async clickWait() {
    outputLog('call', 'debug')
    this.drawer.setVisibility('#waitCircle', true)
    return new Promise((resolve) => {
      const intervalId = setInterval(() => {
        if (this.isNext) {
          this.drawer.setVisibility('#waitCircle', false)
          clearInterval(intervalId)
          this.isNext = false
          resolve(null)
        }
      }, 500)
    })
  }

  async sayHandler(line) {
    outputLog('call', 'debug', line)
    // say(name:string, pattern: string, voice: {playの引数},  ...text)
    if (line.voice) await this.soundHandler({ path: line.voice, play: undefined })
    await this.textHandler({ content: line.content, name: line.name, speed: line.speed || 25 })
    this.scenarioManager.setHistory(line)
  }

  async choiceHandler(line) {
    outputLog('call', 'debug', line)
    document.querySelector('#interactiveView').style.visibility = 'visible'
    if (line.prompt) this.textHandler(line.prompt)
    // ムスタッシュ構文があるときは、変数の展開
    line.content.forEach((choice) => {
      choice.label = this.expandVariable(choice.label)
    })
    const { selectId, onSelect: selectHandler } = await this.drawer.drawChoices(line)
    if (selectHandler !== undefined) {
      this.scenarioManager.addScenario(selectHandler)
    }
    this.scenarioManager.setHistory({ line, ...selectId })
    document.querySelector('#interactiveView').style.visibility = 'hidden'
  }

  jumpHandler(line) {
    outputLog('call:', 'debug', line.index)
    // ジャンプ先が現在の行より小さいときは、今の行とジャンプ先の行の間で、sub=falseの行を抽出して、scenarioManagerに追加する
    if (line.index < this.scenarioManager.getIndex()) {
      // scenarioManagerからシナリオを取得
      const scenario = this.scenarioManager.getScenario()
      // 結合用に、ジャンプ先までのインデックスを取得
      const noEditScenarioList = {
        before: scenario.slice(0, line.index),
        after: scenario.slice(this.scenarioManager.getIndex()),
      }
      outputLog('noEditScenarioList', 'debug', noEditScenarioList)
      // ジャンプ先のインデックスまでのシナリオを取得
      const scenarioList = scenario.slice(line.index, this.scenarioManager.getIndex())
      outputLog('scenarioList', 'debug', scenarioList)
      // sub=falseの行だけを取得
      const subFalseScenario = scenarioList.filter((line) => !line.sub)
      outputLog('subFalseScenario', 'debug', subFalseScenario)
      // scenarioManagerに追加
      this.scenarioManager.setScenario([...noEditScenarioList.before, ...subFalseScenario, ...noEditScenarioList.after])
      outputLog('scenarioManager', 'debug', this.scenarioManager.getScenario())
    }
    this.newpageHandler()
    this.scenarioManager.setIndex(Number(line.index))
  }

  async showHandler(line) {
    outputLog('line', 'debug', line)
    // ムスタッシュ構文があるときは、変数の展開
    Object.keys(line).forEach((item) => {
      line[item] = this.expandVariable(line[item])
    })
    // 表示する画像の情報を管理オブジェクトに追加
    const modeList = { bg: 'background', cutin: '', chara: '', cg: 'background', effect: 'effect' }
    const key = Object.keys(modeList).includes(line.mode) ? modeList[line.mode] : line.name || line.src.split('/').pop()
    const baseLine = engineConfig.resolution.height / 2
    const centerPoint = {
      left: { x: engineConfig.resolution.width * 0.25, y: baseLine },
      center: { x: engineConfig.resolution.width * 0.5, y: baseLine },
      right: { x: engineConfig.resolution.width * 0.75, y: baseLine },
    }
    line.src = this.expandVariable(line.src) || line.name

    const image = await this.getImageObject(line)
    // 画像の表示位置を設定
    let position = { x: line.x || 0, y: line.y || 0 }
    // prettier-ignore
    let size = line.width && line.height ? { width: line.width, height: line.height } : { width: image.getSize().width, height: image.getSize().height }

    // line.modeが'cutin'の場合、center:middleのエイリアスを強制する
    if (line.mode === 'cutin') {
      line.pos = 'center:middle'
    }

    if (line.mode === 'cg') {
      this.tempImages = { ...this.displayedImages }
      this.displayedImages = { background: line.src }
      size = { width: engineConfig.resolution.width, height: engineConfig.resolution.height }
    }

    if (line.pos) {
      const pos = line.pos.split(':')
      const baseLines = {
        top: 0 + size.height,
        middle: engineConfig.resolution.height / 2,
        bottom: engineConfig.resolution.height - size.height,
      }
      // エイリアスが設定されている場合、画像の中心点を求めて、画像の表示位置を設定する
      position.x = centerPoint[pos[0]].x - size.width / 2
      if (pos[1] === 'middle') {
        position.y = baseLines[pos[1]] - size.width / 2
      } else if (pos[1]) {
        position.y = baseLines[pos[1]]
      } else {
        position.y = baseLine / 2
      }
    }
    this.displayedImages[key] = {
      image,
      pos: position,
      size: size,
      look: line.look,
      entry: line.entry,
    }

    outputLog('displayedImages', 'debug', this.displayedImages[key])
    if (line.sepia) this.displayedImages[key].image.setSepia(line.sepia)
    if (line.mono) this.displayedImages[key].image.setMonochrome(line.mono)
    if (line.blur) this.displayedImages[key].image.setBlur(line.blur)
    if (line.opacity) this.displayedImages[key].image.setOpacity(line.opacity)

    if (line.transition === 'fade') {
      // フェードイン効果で表示
      await this.drawer.fadeIn(line.duration || 2000, await this.getImageObject(line), {
        pos: position,
        size,
        look: line.look,
        entry: line.entry,
      })
      this.drawer.show(this.displayedImages)
    } else {
      // 通常の表示処理
      this.drawer.show(this.displayedImages)
    }
    outputLog('this.displayedImages', 'debug', this.displayedImages)
  }

  async hideHandler(line) {
    outputLog('call', 'debug', line)
    const targetImage = this.displayedImages[line.name]
    if (line.mode === 'cg') {
      this.displayedImages = { ...this.tempImages }
      this.tempImages = {}
    } else {
      delete this.displayedImages[line.name]
    }
    this.drawer.show(this.displayedImages)
    if (line.transition === 'fade') {
      // フェードアウト効果で非表示
      await this.drawer.fadeOut(line.duration || 1000, targetImage.image, {
        pos: targetImage.pos,
        size: targetImage.size,
        look: targetImage.look,
      })
    }
  }

  async moveToHandler(line) {
    outputLog('moveToHandler:line', 'debug', line)
    const key = line.name
    outputLog('moveToHandler:displayedImages', 'debug', this.displayedImages)
    await this.drawer.moveTo(key, this.displayedImages, { x: line.x, y: line.y }, line.duration | 1)
  }

  async getImageObject(line) {
    outputLog('call', 'debug', line)
    const name = line.name || line.src.split('/').pop()
    let image
    // 既にインスタンスがある場合は、それを使う
    if (Object.hasOwn(this.displayedImages, name)) {
      const targetImage = this.displayedImages[name]
      const imageObject = targetImage ? targetImage.image : new ImageObject()
      image = await imageObject.setImageAsync(line.src)
    } else {
      outputLog('new ImageObject', 'debug')
      image = await new ImageObject().setImageAsync(line.src)
    }
    return image
  }

  async soundHandler(line) {
    outputLog('call', 'debug', line)
    let soundObject = null
    if (line.mode === 'bgm') {
      if (this.bgm.isPlaying) {
        this.bgm.stop()
      }
      soundObject = await this.getSoundObject(line)
      this.bgm = soundObject
    } else {
      // soundObjectを作成
      soundObject = await this.getSoundObject(line)
      // playプロパティが存在する場合は、再生する
    }
    if ('play' in line) {
      'loop' in line ? soundObject.play(true) : soundObject.play()
    } else if ('stop' in line) {
      soundObject.stop()
    } else if ('pause' in line) {
      soundObject.pause()
    }
    // soundObjectを管理オブジェクトに追加
    const key = line.name || line.src.split('/').pop()
    this.usedSounds[key] = {
      audio: soundObject,
    }
  }

  async getSoundObject(line) {
    outputLog('call', 'debug', line)
    const name = line.name || line.src.split('/').pop()
    let resource
    if (Object.hasOwn(this.usedSounds, name)) {
      const targetResource = this.usedSounds[name]
      const soundObject = targetResource ? targetResource.audio : new SoundObject()
      resource = await soundObject.setAudioAsync(line.src)
    } else {
      resource = await new SoundObject().setAudioAsync(line.src)
    }
    return resource
  }

  newpageHandler() {
    outputLog('call', 'debug')
    this.displayedImages = {
      background: {
        image: this.getBackground(),
        size: {
          width: this.gameContainer.clientWidth,
          height: this.gameContainer.clientHeight,
        },
      },
    }
    this.drawer.clear()
    this.drawer.show(this.displayedImages)
  }

  async ifHandler(line) {
    outputLog('call', 'debug', line)
    const isTrue = this.executeCode(`return ${line.condition}`)
    outputLog(`${isTrue}`, 'debug')
    const appendScenario = isTrue ? line.content[0].content : line.content[1].content
    outputLog('', 'debug', appendScenario)
    this.scenarioManager.addScenario(appendScenario)
  }

  async routeHandler(line) {
    outputLog('call', 'debug', line)
    if (this.bgm.isPlaying) {
      this.bgm.stop()
      this.bgm = null
    }
    this.newpageHandler()
    if (this.sceneFile.cleanUp) {
      // 終了処理を実行する
      this.sceneFile.cleanUp()
    }
    // sceneファイルを読み込む
    await this.loadScene(line.to)
    // 画面を表示する
    await this.loadScreen(this.sceneConfig)
    // BGMを再生する
    this.bgm.play(true)
  }

  // Sceneファイルに、ビルド時に実行処理を追加して、そこに処理をお願いしたほうがいいかも？
  callHandler(line) {
    outputLog('call', 'debug', line)
    this.executeCode(line.method)
  }

  async httpHandler(line) {
    if (!(line.get || line.post || line.put || line.delete)) {
      return line
    }
    outputLog('call', 'debug', line)
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
    outputLog('headers', 'debug', headers)
    outputLog('body', 'debug', body)
    const response = await fetch(line.get || line.post || line.put || line.delete, {
      method: line.get ? 'GET' : line.post ? 'POST' : line.put ? 'PUT' : 'DELETE',
      headers: headers,
      body: JSON.stringify(body),
    })
    if (response.ok) {
      const json = await response.json()
      this.sceneFile.res = json
      outputLog('res', 'debug', json)
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

  setBackground(image) {
    this.displayedImages['background'] = image
  }

  getBackground() {
    return this.displayedImages['background'].image
  }

  executeCode(code) {
    outputLog('call', 'debug', code)
    try {
      const context = { ...this.sceneFile }
      const func = new Function(...Object.keys(context), code)
      return func.apply(null, Object.values(context))
    } catch (error) {
      console.error('Error executing code:', error)
    }
  }

  // Scriptから安全にアクセスできるメソッドを定義
  getAPIForScript() {
    return {
      drawer: {
        drawName: this.drawer.drawName.bind(this.drawer),
        drawText: this.drawer.drawText.bind(this.drawer),
        drawChoices: this.drawer.drawChoices.bind(this.drawer),
        clearText: this.drawer.clearText.bind(this.drawer),
        show: this.drawer.show.bind(this.drawer),
        moveTo: this.drawer.moveTo.bind(this.drawer),
        fadeIn: this.drawer.fadeIn.bind(this.drawer),
        fadeOut: this.drawer.fadeOut.bind(this.drawer),
        rotateCanvas: this.drawer.rotateCanvas.bind(this.drawer),
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
      },
    }
  }
}
