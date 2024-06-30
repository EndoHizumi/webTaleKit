import { Drawer } from './drawer'
import { ScenarioManager } from './scenarioManager'
import { ImageObject } from '../resource/ImageObject'
import { ResourceManager } from './resourceManager'
import { SoundObject } from '../resource/soundObject'
import engineConfig from '../../engineConfig.json'
import { outputLog } from '../utils/logger'

export class Core {
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
    moveTo: this.moveToHandler,
    route: this.routeHandler,
  }

  constructor() {
    this.gameContainer = document.getElementById('gameContainer')
    // Drawerの初期化（canvasタグのサイズを設定する)
    this.drawer = new Drawer(this.gameContainer)
    // ScenarioManagerの初期化（変数の初期値設定）
    this.scenarioManager = new ScenarioManager()
    // ResourceManagerの初期化（引数にconfigを渡して、リソース管理配列を作る）
    this.resourceManager = new ResourceManager(
      import(/* webpackIgnore: true */ '/src/resource/config.js'),
    ) //  webpackIgnoreでバンドルを無視する
    this.isNext = false
    this.index = 0
    this.displayedImages = {}
    this.usedSounds = {}
  }

  async start() {
    outputLog('call', 'debug')
    // TODO: ブラウザ用のビルドの場合は、最初にクリックしてもらう
    // titleタグの内容を書き換える
    document.title = engineConfig.title
    this.loadScene('title')
    // 実行が終了したら、真っ黒の画面を表示する
    document.getElementById('gameContainer').innerHTML = ''
  }

  async loadScene(sceneFileName) {
    outputLog('call', 'debug', sceneFileName)
    // sceneファイルを読み込む
    this.sceneFile = await import(
      /* webpackIgnore: true */ `./src/js/${sceneFileName}.js`
    )
    this.sceneConfig = { ...this.sceneConfig, ...this.sceneFile.sceneConfig }
    outputLog('loadScene:sceneFile', 'debug', this.sceneConfig)
    // 画面を表示する
    await this.loadScreen(this.sceneConfig)
    // シナリオを進行する
    await this.setScenario(this.sceneFile.scenario)
  }

  async loadScreen(sceneConfig) {
    outputLog('call', 'debug', sceneConfig)
    // sceneConfig.templateを読み込んで、HTMLを表示する
    const template = await fetch(sceneConfig.template)
    const htmlString = await template.text()
    // 読み込んだhtmlからIDにmainを持つdivタグとStyleタグ以下を取り出して、gameContainerに表示する
    var parser = new DOMParser()
    var doc = parser.parseFromString(htmlString, 'text/html')
    this.gameContainer.innerHTML = doc.getElementById('main').innerHTML
    // Styleタグを取り出して、headタグに追加する
    const styleElement = doc.head.getElementsByTagName('style')[0]
    document.head.appendChild(styleElement)
    // ゲーム進行用に必要な情報をセットする
    this.drawer.setScreen(this.gameContainer)
    // シナリオの進行状況を保存
    this.scenarioManager.progress.currentScene = sceneConfig.name
    const background = await new ImageObject().setImageAsync(
      sceneConfig.background,
    )
    this.displayedImages['background'] = {
      image: background,
      size: {
        width: this.gameContainer.clientWidth,
        height: this.gameContainer.clientHeight,
      },
    }
    this.drawer.show(this.displayedImages)
    this.scenarioManager.setBackground(background)
    // BGMを再生する
    const bgm = await new SoundObject().setAudioAsync(sceneConfig.bgm)
    bgm.play(true)
  }

  async setScenario(scenario) {
    outputLog('setScenario:scenario', 'debug', scenario)
    // scenario配列をmapで処理して、ゲームを進行する。
    while (this.index < scenario.length) {
      outputLog('this.index', 'debug', this.index)
      const line = scenario[this.index]
      outputLog('setScenario:line', 'debug', line)
      this.index++
      const boundFunction = this.commandList[line.type || 'text'].bind(this)
      outputLog(
        `boundFunction:${boundFunction.name.split(' ')[1]}`,
        'debug',
        line,
      )
      await boundFunction(line)
    }
  }

  async textHandler(line) {
    outputLog('textHandler:line', 'debug', line)
    // 文章だけの場合は、contentプロパティに配列として設定する
    if (typeof line === 'string') line = { content: [line] }
    outputLog('call', 'debug', line)
    // {{}}が含まれている場合は、変換処理を行う
    line.content = line.content.map((text) =>
      text.replace(/{{([^{}]+)}}/g, (match, p1, offset, string) => {
        const expr = match.slice(2, -2)
        const returnValue = this.executeCode(`return ${expr}`)
        return typeof returnValue == 'object'
          ? JSON.stringify(returnValue)
          : returnValue
      }),
    )
    await this.drawer.drawText(line)
    this.scenarioManager.setHistory(line)
  }

  async sayHandler(line) {
    outputLog('call', 'debug', line)
    // say(name:string, pattern: string, voice: {playの引数},  ...text)
    if (line.voice)
      await this.soundHandler({ path: line.voice, play: undefined })
    await this.textHandler({ content: line.content, name: line.name })
    this.scenarioManager.setHistory(line)
  }

  async choiceHandler(line) {
    outputLog('', 'debug')
    this.textHandler(line.prompt)
    const { selectId, onSelect: selectHandler } =
      await this.drawer.drawChoices(line)
    if (selectHandler !== undefined) {
      const pastIndex = this.index
      this.index = 0
      await this.setScenario(selectHandler)
      this.index = pastIndex
    }
    this.scenarioManager.setHistory({ line, ...selectId })
  }

  jumpHandler(line) {
    outputLog('', 'debug')
    this.index = line.index
  }

  async showHandler(line) {
    outputLog('showHandler:line', 'debug', line)
    // 表示する画像の情報を管理オブジェクトに追加
    const key = line.name || line.path.split('/').pop()
    this.displayedImages[key] = {
      image: await this.getImageObject(line),
      pos: { x: line.x, y: line.y },
      size: { width: line.width, height: line.height },
      look: line.look,
      entry: line.entry,
    }
    outputLog('showHandler:displayedImages', 'debug', this.displayedImages[key])
    if (line.sepia) this.displayedImages[key].image.setSepia(line.sepia)
    if (line.mono) this.displayedImages[key].image.setMonochrome(line.mono)
    if (line.blur) this.displayedImages[key].image.setBlur(line.blur)
    if (line.opacity) this.displayedImages[key].image.setOpacity(line.opacity)
    this.drawer.show(this.displayedImages)
    outputLog('showHandler:this.displayedImages', 'debug', this.displayedImages)
  }

  hideHandler(line) {
    outputLog('call', 'debug', line)
    const key = line.name
    delete this.displayedImages[key]
    this.drawer.show(this.displayedImages)
  }

  async moveToHandler(line) {
    outputLog('moveToHandler:line', 'debug', line)
    const key = line.name
    outputLog('moveToHandler:displayedImages', 'debug', this.displayedImages)
    await this.drawer.moveTo(
      key,
      this.displayedImages,
      { x: line.x, y: line.y },
      line.duration | 1,
    )
  }

  async getImageObject(line) {
    outputLog('call', 'debug', line)
    let image
    // 既にインスタンスがある場合は、それを使う
    if (line.name) {
      const targetImage = this.displayedImages[line.name]
      const imageObject = targetImage ? targetImage.image : new ImageObject()
      image = await imageObject.setImageAsync(line.path)
    } else {
      image = await new ImageObject().setImageAsync(line.path)
    }
    return image
  }

  async soundHandler(line) {
    outputLog('call', 'debug', line)
    // soundObjectを作成
    const soundObject = await this.getSoundObject(line)
    // playプロパティが存在する場合は、再生する
    if ('play' in line) {
      'loop' in line ? soundObject.play(true) : soundObject.play()
    } else if ('stop' in line) {
      soundObject.stop()
    } else if ('pause' in line) {
      soundObject.pause()
    }
    // soundObjectを管理オブジェクトに追加
    const key = line.name || line.path.split('/').pop()
    this.usedSounds[key] = {
      audio: soundObject,
    }
  }

  async getSoundObject(line) {
    outputLog('call', 'debug', line)
    let resource
    if (line.name) {
      const targetResource = this.usedSounds[line.name]
      const soundObject = targetResource
        ? targetResource.audio
        : new SoundObject()
      resource = await soundObject.setAudioAsync(line.path)
    } else {
      resource = await new SoundObject().setAudioAsync(line.path)
    }
    return resource
  }

  newpageHandler() {
    outputLog('call', 'debug')
    this.displayedImages = {
      background: {
        image: this.scenarioManager.getBackground(),
        size: {
          width: this.gameContainer.clientWidth,
          height: this.gameContainer.clientHeight,
        },
      },
    }
    this.drawer.clear()
    this.drawer.show(this.displayedImages)
  }

  // Sceneファイルに、ビルド時に判断処理を追加して、そこに処理をお願いしたほうがいいかも？
  async ifHandler(line) {
    outputLog('call', 'debug', line)
    const isTrue = this.executeCode(`return ${line.condition}`)
    outputLog(`${isTrue}`, 'debug')
    if (isTrue) {
      outputLog('', 'debug', line.content[0].content)
      const pastIndex = this.index
      this.index = 0
      await this.setScenario(line.content[0].content)
      this.index = pastIndex
    } else {
      outputLog('', 'debug', line.content[1].content)
      const pastIndex = this.index
      this.index = 0
      await this.setScenario(line.content[1].content)
      this.index = pastIndex
    }
  }

  async routeHandler(line) {
    outputLog('call', 'debug', line)
    this.index = 0
    this.displayedImages = {}
    this.usedSounds = {}
    await this.loadScene(line.to)
  }

  // Sceneファイルに、ビルド時に実行処理を追加して、そこに処理をお願いしたほうがいいかも？
  callHandler(line) {
    outputLog('call', 'debug', line)
    this.executeCode(line.func)
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
