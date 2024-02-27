import { Drawer } from './drawer.js'
import { ResourceManager } from './resourceManager.js'
import { ScenarioManager } from './scenarioManager.js'
import engineConfig from '../../engineConfig.json'

export class Core {
  constructor () {
    // Drawerの初期化（canvasタグのサイズを設定する)
    this.drawer = new Drawer()
    // ScenarioManagerの初期化（変数の初期値設定）
    this.scenarioManager = new ScenarioManager()
    // ResourceManagerの初期化（引数にconfig.jsを渡して、リソース管理配列を作る）
    this.resourceManager = new ResourceManager(import(/* webpackIgnore: true */ './config.js')) //  webpackIgnoreでバンドルを無視する
    this.isNext = false
  }

  async init () {
    // titleタグの内容を書き換える
    document.title = engineConfig.title
    this.drawer.drawUI()
    const title = await import(/* webpackIgnore: true */ './title.js')//  webpackIgnoreでバンドルを無視する
    this.drawer.setConfig(title.sceneConfig)
    // scenario配列をmapで処理して、ゲームを進行する。
    title.scenario.forEach((scene) => {
      // type:textの場合, DrawerのdrawTextメソッドを実行する
      console.log(scene)
      if (scene.type === 'text') {
        this.drawer.drawText(scene)
        this.scenarioManager.setHistory(scene.text)
        // waitがある場合、クリック待ちをする
        if (scene.wait) {
          this.isNext = false
          this.drawer.messageText.addEventListener('click', () => {
            this.isNext = true
            // うまくいってない。クリック待ちをSetTimeoutで実装する？
          })
        }
      }
    })
  }
}
