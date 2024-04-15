import { Drawer } from './drawer.ts'
import { ScenarioManager } from './scenarioManager.ts'
import { ImageObject } from '../resource/ImageObject'
import { ResourceManager } from './resourceManager.js'
import { SoundObject } from '../resource/soundObject'
import engineConfig from '../../engineConfig.json'

export class Core {
  commandList = {
    text: this.textHandler,
    choice: this.choiceHandler,
    show: this.showHandler,
    newpage: this.newpageHandler,
    hide: this.hideHandler,
    jump: this.jumpHandler,
    sound: this.soundHandler,
    say: this.sayHandler,
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
    // titleタグの内容を書き換える
    document.title = engineConfig.title
    const title = await import(/* webpackIgnore: true */ './js/title.js') //  webpackIgnoreでバンドルを無視する
    this.scenarioManager.progress.currentScene = title.sceneConfig.name
    const background = await new ImageObject().setImageAsync(
      title.sceneConfig.background,
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
    await this.setScenario(title.scenario)
    // 実行が終了したら、真っ黒の画面を表示する
    document.getElementById('gameContainer').innerHTML = ''
  }

  async setScenario(scenario) {
    // scenario配列をmapで処理して、ゲームを進行する。
    while (this.index < scenario.length) {
      const line = scenario[this.index]
      this.index++
      const boundFunction = this.commandList[line.type || 'text'].bind(this)
      await boundFunction(line)
    }
  }

  async textHandler(line) {
    await this.drawer.drawText(line)
    this.scenarioManager.setHistory(line.msg)
  }

  async sayHandler(line) {
    // say(name:string, pattern: string, voice: {playの引数},  ...text)
    await this.soundHandler(line.voice)
    await this.drawer.drawText(line.text, line.name)
    this.scenarioManager.setHistory(line.msg)
  }

  async choiceHandler(line) {
    const { selectId, onSelect: selectHandler } =
      await this.drawer.drawChoices(line)
    const pastIndex = this.index
    this.index = 0
    await this.setScenario(selectHandler)
    this.index = pastIndex
    this.scenarioManager.setHistory(line.prompt, selectId)
  }

  jumpHandler(line) {
    this.index = line.index
  }

  async showHandler(line) {
    // 表示する画像の情報を管理オブジェクトに追加
    const key = line.name || line.path.split('/').pop()
    this.displayedImages[key] = {
      image: await this.getImageObject(line),
      pos: line.pos,
      size: line.size,
      look: line.look,
      entry: line.entry,
    }
    this.drawer.show(this.displayedImages)
  }

  hideHandler(line) {
    const key = line.name
    delete this.displayedImages[key]
    this.drawer.show(this.displayedImages)
  }

  async getImageObject(line) {
    let image
    // 既にインスタンスがある場合は、それを使う
    if (line.name) {
      const targetImage = this.displayedImages[line.name]
      const imageObject = targetImage ? targetImage.image: new ImageObject()
      image = await imageObject.setImageAsync(line.path)
    } else {
      image = await new ImageObject().setImageAsync(line.path)
    }
    return image
  }

  async soundHandler(line) {
    // soundObjectを作成
    const soundObject = await this.getSoundObject(line)
    // playプロパティが存在する場合は、再生する
    if ("play" in line) {
      soundObject.play()
    } else if (line.stop) {
      soundObject.stop()
    } else if (line.pause) {
      soundObject.pause()
    }
    // soundObjectを管理オブジェクトに追加
    const key = line.name || line.path.split('/').pop()
    this.usedSounds[key] = {
      audio: soundObject
    }
  }

  async getSoundObject(line) {
    let resource
    if (line.name) {
      const targetResource = this.usedSounds[line.name]
      const soundObject = targetResource ? targetResource.audio : new SoundObject()
      resource = await soundObject.setAudioAsync(line.path)
    } else {
      resource = await new SoundObject().setAudioAsync(line.path)
    }
    return resource
  }

  newpageHandler() {
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
}
