import { Core } from 'webtalekit/src/core/'

const game = new Core()

// URLからクエリパラメータを取得
const urlParams = new URLSearchParams(window.location.search)
const sceneParam = urlParams.get('scene')

// 指定されたシーンがある場合はそのシーンを、なければタイトルシーンを開始
const initialScene = sceneParam || 'title'

game.start(initialScene)
