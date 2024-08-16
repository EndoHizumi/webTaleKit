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

  async start() {
    outputLog('call', 'debug')
    // TODO: ブラウザ用のビルドの場合は、最初にクリックしてもらう
    // titleタグの内容を書き換える
    document.title = engineConfig.title
    // sceneファイルを読み込む
    await this.loadScene('title')
    // 画面を表示する
    await this.loadScreen(this.sceneConfig)
    // 入力イベントを設定する
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.onNextHandler()
      } else if (e.key === 'Control') {
        this.drawer.isSkip = true
        this.isNext = true
      }
    })
    document.addEventListener('keyup', (e) => {
      if (e.key === 'Control') {
        this.drawer.isSkip = true
        this.isNext = false
      }
    })
    document.addEventListener('click', (e) => {
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
    // prettier-ignore
    const boundFunction = this.commandList[scenarioObject.type || 'text'].bind(this)
    // prettier-ignore
    outputLog(`boundFunction:${boundFunction.name.split(' ')[1]}`,'debug',scenarioObject)
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
    // {{}}が含まれている場合は、変換処理を行う
    scenarioObject.content = scenarioObject.content.map((text) =>
      text.replace(/{{([^{}]+)}}/g, (match) => {
        const expr = match.slice(2, -2)
        const returnValue = this.executeCode(`return ${expr}`)
        return typeof returnValue == 'object' ? JSON.stringify(returnValue) : returnValue
      }),
    )
    // 名前が設定されている場合は、名前を表示する
    if (scenarioObject.name) {
      this.drawer.drawName(scenarioObject.name)
    } else {
      this.drawer.drawName('')
    }

    //prettier-ignore
    this.onNextHandler = () => { this.drawer.isSkip = true }
    // 表示する文章を1行ずつ表示する
    for (const line of scenarioObject.content) {
      this.drawer.clearText(); // テキスト表示領域をクリア
      await this.drawer.drawText(line, line.speed || 50)
      //prettier-ignore
      this.onNextHandler = () => { this.isNext = true }
      if (typeof line.wait === 'number') {
        if (line.wait > 0 || this.isAuto) {
          const waitTime = line.wait || 1500
          // 指定された時間だけ待機
          await sleep(line.wait)
        }
      } else {
        // 改行ごとに入力待ち
        await this.clickWait()
      }
    }
    this.drawer.isSkip = false
    this.scenarioManager.setHistory(scenarioObject.content)
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
    await this.textHandler({ content: line.content, name: line.name })
    this.scenarioManager.setHistory(line)
  }

  async choiceHandler(line) {
    outputLog('call', 'debug', line)
    if (line.prompt) this.textHandler(line.prompt) // promptがある場合は、表示する
    const { selectId, onSelect: selectHandler } = await this.drawer.drawChoices(line)
    if (selectHandler !== undefined) {
      this.scenarioManager.addScenario(selectHandler)
    }
    this.scenarioManager.setHistory({ line, ...selectId })
  }

  jumpHandler(line) {
    outputLog('call:', 'debug', line.index)
    this.newpageHandler()
    this.scenarioManager.setIndex(Number(line.index))
  }

  async showHandler(line) {
    outputLog('line', 'debug', line)
    // 表示する画像の情報を管理オブジェクトに追加
    const modeList = { 'bg': 'background', 'cutin': '', 'chara': '', 'cg': 'background', 'effect': 'effect' }
    const key = Object.keys(modeList).includes(line.mode) ? modeList[line.mode] : line.name || line.src.split('/').pop()
    const baseLine = engineConfig.resolution.height / 2
    const centerPoint = {
      left: { x: engineConfig.resolution.width * 0.25, y: baseLine },
      center: { x: engineConfig.resolution.width * 0.5, y: baseLine },
      right: { x: engineConfig.resolution.width * 0.75, y: baseLine },
    }

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
        top: 0,
        middle: engineConfig.resolution.height / 2,
        bottom: engineConfig.resolution.height,
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
    this.drawer.show(this.displayedImages)
    outputLog('this.displayedImages', 'debug', this.displayedImages)
  }

  hideHandler(line) {
    outputLog('call', 'debug', line)
    if(line.mode === 'cg') {
      this.displayedImages = { ...this.tempImages }
      this.tempImages = {}
    } else {
      delete this.displayedImages[line.name]
    }
    this.drawer.show(this.displayedImages)
  }

  async moveToHandler(line) {
    outputLog('moveToHandler:line', 'debug', line)
    const key = line.name
    outputLog('moveToHandler:displayedImages', 'debug', this.displayedImages)
    await this.drawer.moveTo(key, this.displayedImages, { x: line.x, y: line.y }, line.duration | 1)
  }

  async getImageObject(line) {
    outputLog('call', 'debug', line)
    let image
    // 既にインスタンスがある場合は、それを使う
    if (line.name) {
      const targetImage = this.displayedImages[line.name]
      const imageObject = targetImage ? targetImage.image : new ImageObject()
      image = await imageObject.setImageAsync(line.src)
    } else {
      image = await new ImageObject().setImageAsync(line.src)
    }
    return image
  }

  async soundHandler(line) {
    outputLog('call', 'debug', line)
    let soundObject = null
    if(line.mode === 'bgm') {
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
    let resource
    if (line.name) {
      const targetResource = this.usedSounds[line.name]
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
    if (isTrue) {
      outputLog('', 'debug', line.content[0].content)
      this.scenarioManager.addScenario(line.content[0].content)
    } else {
      outputLog('', 'debug', line.content[1].content)
      this.scenarioManager.addScenario(line.content[1].content)
    }
  }

  async routeHandler(line) {
    outputLog('call', 'debug', line)
    if (this.bgm.isPlaying) {
      this.bgm.stop()
      this.bgm = null
    }
    this.newpageHandler()
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
    this.executeCode(line.func)
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
    this.displayedImages["background"] = image
  }

  getBackground() {
    return this.displayedImages["background"].image
  }

  executeCode(code) {
    try {
      const context = { ...this.sceneFile }
      const func = new Function(...Object.keys(context), code)
      return func.apply(null, Object.values(context))
    } catch (error) {
      console.error('Error executing code:', error)
    }
  }
}
