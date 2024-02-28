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

  async start () {
    // titleタグの内容を書き換える
    document.title = engineConfig.title
    const title = await import(/* webpackIgnore: true */ './title.js')//  webpackIgnoreでバンドルを無視する
    this.drawer.setConfig(title.sceneConfig)
    // scenario配列をmapで処理して、ゲームを進行する。
    console.log(title.scenario)
    for (let i = 0; i < title.scenario.length; i++) {
      if (!title.scenario[i].wait || !('wait' in title.scenario[i])) {
        await new Promise((resolve) => {
          this.isNext = false
          this.drawer.drawText(title.scenario[i])
          this.scenarioManager.setHistory(title.scenario[i].text)
          // クリック待ち
          // const waitCircle = document.querySelector('#messageWindow')
          // const img = document.createElement('img')
          // img.src = './wait.gif' // 画像のパスを設定
          // waitCircle.appendChild(img)
          document.getElementById('gameContainer').addEventListener('click', () => {
            this.isNext = true
          })
          setInterval(() => {
            if (this.isNext) {
              document.getElementById('gameContainer').removeEventListener('click', () => {})
              // waitCircle.removeChild(img)
              resolve()
            }
          }, 100)
        })
        console.log('next')
      }
    }
  }
}
