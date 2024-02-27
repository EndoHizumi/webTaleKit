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
    this.resourceManager = new ResourceManager(import('./config.js'))
    this.isNext = false
  }

  async init () {
    // titleタグの内容を書き換える
    document.title = engineConfig.title
    const scenario = await import('./title.js')
    this.drawer.setConfig(scenario.sceneConfig)
    // scenario配列をmapで処理して、ゲームを進行する。
    scenario.forEach((scene) => {
      // type:textの場合, DrawerのdrawTextメソッドを実行する
      if (scene.type === 'text') {
        this.drawer.drawText(scene)
        this.scenarioManager.setHistory(scene.text)
        // waitがある場合、クリック待ちをする
        if (scene.wait) {
          window.addEventListener('keydown', (this.isNext = true))
          window.addEventListener('click', (this.isNext = true))
          while (true) {
            //  キーボード入力またはマウスがクリックされるまで無限ループ
            if (this.isNext) {
              window.removeEventListener('keydown')
              window.removeEventListener('click')
              break
            }
          }
        }
      }
    })
  }
}
