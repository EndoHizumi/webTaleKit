import { Drawer } from './drawer.ts'
import { ResourceManager } from './resourceManager.js'
import { ScenarioManager } from './scenarioManager.ts'
import { ImageObject } from '../resource/ImageObject.ts'
import engineConfig from '../../engineConfig.json'

export class Core {
  commandList = {
    text: this.textHandler,
    choice: this.choiceHandler,
    show: this.showHandler,
    newpage: this.newpageHandler,
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
    await this.setScenario(this.index, title.scenario)
    // 実行が終了したら、真っ黒の画面を表示する
    document.getElementById('gameContainer').innerHTML = ''
  }

  async setScenario(index, scenario) {
    // scenario配列をmapで処理して、ゲームを進行する。
    while (index < scenario.length) {
      const line = scenario[index]
      this.commandList[line.type](line)
      index++
    }
  }

  textHandler = async (line) => {
    await this.drawer.drawText(line)
    this.scenarioManager.setHistory(line.msg)
  }

  choiceHandler = async (line) => {
    const { selectId, onSelect: selectHandler } =
      await this.drawer.drawChoices(line)
    await this.setScenario(0, selectHandler)
    this.scenarioManager.setHistory(line.prompt, selectId)
  }

  jumpHandler = (line) => {
    this.index = line.index
  }

  showHandler = async (line) => {
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

  async getImageObject(line) {
    let image
    // 既にインスタンスがある場合は、それを使う
    if (line.name) {
      const targetImage = this.displayedImages[line.name]
      const imageObject = targetImage
        ? targetImage.image
        : await new ImageObject()
      image = imageObject.image.setImageAsync(line.path)
    } else {
      image = await new ImageObject().setImageAsync(line.path)
    }
    return image
  }

  newpageHandler = () => {
    this.displayedImages = {
      background: {
        image: this.scenarioManager.getBackground(),
        size: {
          width: this.gameContainer.clientWidth,
          height: this.gameContainer.clientHeight,
        },
      },
    }
    this.drawer.newPage()
    this.drawer.show(this.displayedImages)
  }
}
