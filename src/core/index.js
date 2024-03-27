import { Drawer } from './drawer.ts'
import { ResourceManager } from './resourceManager.js'
import { ScenarioManager } from './scenarioManager.js'
import { ImageObject } from '../resource/ImageObject.ts'
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
    this.scenarioManager.progress.currentScene = title.sceneConfig.name
    this.drawer.setConfig(title.sceneConfig)
    this.displayedImages['background'] = new ImageObject(title.sceneConfig.background);
    await this.setScenario(this.index, title.scenario)
    // 実行が終了したら、真っ黒の画面を表示する
    document.getElementById('gameContainer').innerHTML = ''
  }

 async setScenario(index, scenario) {
        // scenario配列をmapで処理して、ゲームを進行する。
        while (index < scenario.length) {
          const line = scenario[index]
          if (line.type === 'text') {
            await this.drawer.drawText(line)
            this.scenarioManager.setHistory(line.msg)
          } else if (line.type === 'choice') {
            const {selectId, onSelect: selectHandler} = await this.drawer.drawChoices(line)
            await this.setScenario(0, selectHandler)
            this.scenarioManager.setSelectedChoice(line.prompt, selectId)
            this.scenarioManager.setHistory(line.prompt)
          } else if (line.type === 'jump') {
            index = line.index
            continue
          } else if (line.type == 'show') {
            let image;
            if (line.name) {
              image = await new ImageObject().setImageAsync(this.resourceManager.getResourcePath(line.name));
            } else {
              image = await new ImageObject().setImageAsync(line.path);
            }
            this.drawer.show(image, line.pos, line.size, line.look, line.entry);
            // 表示した画像の情報を管理
            const key = line.name || line.path.split('/').pop();
            this.displayedImages[key] = { image, pos: line.pos};
          }
          index++
        }
  }
}
