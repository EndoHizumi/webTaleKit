import { Drawer } from './drawer.ts'
import { ScenarioManager } from './scenarioManager.ts'
import { ImageObject } from '../resource/ImageObject'
import { ResourceManager } from './resourceManager.js'
import { SoundObject } from '../resource/soundObject'
import engineConfig from '../../engineConfig.json'
import { outputLog } from '../utils/logger.js'

export class Core {
  sceneFile = {}
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
  }

  constructor() {
    this.gameContainer = document.getElementById('gameContainer')
    // Drawerの初期化（canvasタグのサイズを設定する)
    this.drawer = new Drawer(this.gameContainer)
    // ScenarioManagerの初期化（変数の初期値設定）
    this.scenarioManager = new ScenarioManager()
    // ResourceManagerの初期化（引数にconfig.jsを渡して、リソース管理配列を作る）
    this.resourceManager = new ResourceManager(
      import(/* webpackIgnore: true */ './resource/config.js'),
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
      /* webpackChunkName: "scenario" */ `/test/js/${sceneFileName}.js`
    )
    // 画面を表示する
    await this.loadScreen(this.sceneFile)
    // シナリオを進行する
    await this.setScenario(this.sceneFile.scenario)
  }

  async loadScreen(screen) {
    outputLog('call', 'debug', screen)
    // this.sceneConfig.templateを読み込んで、HTMLを表示する
    const template = await fetch(screen.sceneConfig.template)
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
    this.scenarioManager.progress.currentScene = screen.sceneConfig.name
    const background = await new ImageObject().setImageAsync(
      screen.sceneConfig.background,
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
    const bgm = await new SoundObject().setAudioAsync(screen.sceneConfig.bgm)
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
    outputLog('call', 'debug', line)
    line.msg = line.msg.replace(/{{([^{}]+)}}/g, (match, p1, offset, string) => {
      const expr = match.slice(2, -2);
      return this.executeCode(expr, this.sceneFile)
    })
    await this.drawer.drawText(line)
    this.scenarioManager.setHistory(line.msg)
  }

  async sayHandler(line) {
    outputLog('call', 'debug', line)
    // say(name:string, pattern: string, voice: {playの引数},  ...text)
    if (line.voice) await this.soundHandler(line.voice)
    await this.drawer.drawText(line.text, line.name)
    this.scenarioManager.setHistory(line.msg)
  }

  async choiceHandler(line) {
    outputLog('', 'debug')
    const { selectId, onSelect: selectHandler } =
      await this.drawer.drawChoices(line)
    const pastIndex = this.index
    this.index = 0
    await this.setScenario(selectHandler)
    this.index = pastIndex
    this.scenarioManager.setHistory(line.prompt, selectId)
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
      pos: line.pos,
      size: line.size,
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
    const isTrue = this.sceneFile.executeCode(line.condition)
    outputLog(`${isTrue}`, 'debug')
    if (isTrue) {
      outputLog('', 'debug', line.then)
      const pastIndex = this.index
      this.index = 0
      await this.setScenario(line.then)
      this.index = pastIndex
    } else {
      outputLog('', 'debug', line.else)
      const pastIndex = this.index
      this.index = 0
      await this.setScenario(line.else)
      this.index = pastIndex
    }
  }

  // Sceneファイルに、ビルド時に実行処理を追加して、そこに処理をお願いしたほうがいいかも？
  callHandler(line) {
    outputLog('call', 'debug', line)
    this.sceneFile.executeCode(line.func)
  }
}
