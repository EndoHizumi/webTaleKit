import { Core } from 'webtalekit-alpha/src/core/'
import engineConfig from '../engineConfig.json'

const game = new Core()

// URLからクエリパラメータを取得
const urlParams = new URLSearchParams(window.location.search)
const sceneParam = urlParams.get('scene')

// 指定されたシーンがある場合はそのシーンを、なければタイトルシーンを開始
const initialScene = sceneParam || 'title'
game.setConfig(engineConfig)
game.start(initialScene)
