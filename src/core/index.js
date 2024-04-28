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
    for: this.forHandler
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
    // TODO: ブラウザ用のビルドの場合は、最初にクリックしてもらう
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

  forHandler(line) {
    console.log('forHandler: line: ', line, ': 72')
    // とても分かりづらいが、再帰関数を使って、ハンドラの中の変数を置換している。returnはない。（やると訳が分からなくなるため）
    const replacer = (handler, item) => {
     console.log('replacer: ', handler, ': 72')
     Object.keys(handler).map(key => {
        if (handler[key] instanceof Object) { replacer(handler[key], item) }
        if (handler[key] === line.variableName) {
          handler[key] = item
        }
      })
    }
     line.itr.forEach(async (itr) => {
      console.log(`forHandler: ${itr}: 80`)
      line.items.forEach(async handler => {
        // handlerをコピーして、中身を置換する。（そうじゃないと２回目以降の処理で、前回の値が残ってしまう）
        const replaceHandler = structuredClone(handler)
        replacer(replaceHandler, itr)
        console.log('forHandler: replaceHandler: ', replaceHandler, ': 84')
        const boundFunction = this.commandList[replaceHandler.type || 'text'].bind(this)
        await boundFunction(replaceHandler)
      })
    })
  }

  async textHandler(line) {
    console.log('textHandler: ', line, ': 90')
    await this.drawer.drawText(line)
    this.scenarioManager.setHistory(line.msg)
  }

  async sayHandler(line) {
    // say(name:string, pattern: string, voice: {playの引数},  ...text)
    console.log('sayHandler: ', line, ': 96')
    await this.soundHandler(line.voice)
    await this.drawer.drawText(line.text, line.name)
    this.scenarioManager.setHistory(line.msg)
  }

  async choiceHandler(line) {
    console.log('choiceHandler: ', line, ': 104')
    const { selectId, onSelect: selectHandler } =
      await this.drawer.drawChoices(line)
    const pastIndex = this.index
    this.index = 0
    await this.setScenario(selectHandler)
    this.index = pastIndex
    this.scenarioManager.setHistory(line.prompt, selectId)
  }

  jumpHandler(line) {
    console.log('jumpHandler: ', line, ': 115')
    this.index = line.index
  }

  async showHandler(line) {
    console.log('showHandler: ', line, ': 120')
    // 表示する画像の情報を管理オブジェクトに追加
    const key = line.name || line.path.split('/').pop()
      const image = {
        image: await this.getImageObject(line),
        pos: line.pos,
        size: line.size,
        look: line.look,
        entry: line.entry,
      }
      this.displayedImages[key] = image
      console.log('displayedImages:', this.displayedImages, 'showHandler: 126')
      console.dir(this.displayedImages)
      this.drawer.show(this.displayedImages)
  }

  hideHandler(line) {
    console.log('hideHandler: ', line, ': 137')
    const key = line.name
    delete this.displayedImages[key]
    this.drawer.show(this.displayedImages)
  }

  async getImageObject(line) {
    console.log('getImageObject: ', line, ': 144')
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
    console.log('soundHandler: ', line, ': 158')
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
      audio: soundObject
    }
  }

  async getSoundObject(line) {
    console.log('getSoundObject: ', line, ': 177')
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
    console.log('newpageHandler: ', ': 190')
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
