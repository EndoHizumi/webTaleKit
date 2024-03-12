import { Drawer } from './drawer.js'
import { ResourceManager } from './resourceManager.js'
import { ScenarioManager } from './scenarioManager.js'
import engineConfig from '../../engineConfig.json'

export class Core {
  constructor() {
    this.gameContainer = document.getElementById('gameContainer')
    // Drawerの初期化（canvasタグのサイズを設定する)
    this.drawer = new Drawer(this.gameContainer)
    // ScenarioManagerの初期化（変数の初期値設定）
    this.scenarioManager = new ScenarioManager()
    // ResourceManagerの初期化（引数にconfig.jsを渡して、リソース管理配列を作る）
    this.resourceManager = new ResourceManager(
      import(/* webpackIgnore: true */ './resource/config.js')
    ) //  webpackIgnoreでバンドルを無視する
    this.isNext = false
    this.index = 0
    this.displayedImages = []
  }

  async start() {
    // titleタグの内容を書き換える
    document.title = engineConfig.title
    const title = await import(/* webpackIgnore: true */ './js/title.js') //  webpackIgnoreでバンドルを無視する
    this.drawer.setConfig(title.sceneConfig)
    // scenario配列をmapで処理して、ゲームを進行する。
    while (this.index < title.scenario.length) {
      const line = title.scenario[this.index]
      if (line.type === 'text') {
        await this.drawer.drawText(line)
        this.scenarioManager.setHistory(line.msg)
      } else if (line.type === 'choice') {
        const result = await this.drawer.drawChoices(line)
        const {selectId, selectIndex: jumpIndex } = result
        this.scenarioManager.setHistory(line.prompt)
        console.log(selectId, jumpIndex)
        this.index = jumpIndex
        continue
      } else if (line.type === 'jump') {
        this.scenarioManager.jump(line.label)
      } else if (line.type == 'show') {
        let imagePath;
        if (line.name) {
          imagePath = this.resourceManager.getResourcePath(line.name);
        } else {
          imagePath = line.path;
        }
        const imageObject = this.drawer.show(imagePath, line.pos, line.size, line.look, line.entry);
        // 表示した画像の情報を管理
        const key = line.name || line.path;
        this.displayedImages[key] = { imageObject, pos: line.pos};
      }
      this.index++
    }
    document.getElementById('gameContainer').innerHTML = ''
  }
}
