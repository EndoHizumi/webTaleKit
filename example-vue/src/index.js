import { createApp } from 'vue'
import { Core } from 'webtalekit-alpha/src/core/'
import engineConfig from '../engineConfig.json'
import App from './App.vue'

/**
 * アーキテクチャの要点:
 *
 *   Core (WebTaleKit)
 *     ↓ EventBus.emit('text:show' | 'choice:show' | ...)
 *   useWebTaleKit (composable)
 *     ↓ Vue reactive state
 *   MessageWindow / ChoicePanel / WaitCursor (Vue components)
 *
 * Core は「何を表示すべきか」だけを EventBus に伝え、
 * UI の実装 (Vue) を一切知らない。
 * → ゲームロジックと UI の完全な分離
 */

// #gameContainer は template.html に静的定義済み → Core constructor が取得可能
const game = new Core({ customUI: true })
game.setConfig(engineConfig)

// Vue を #gameContainer にマウント。App.vue がオーバーレイ UI を描画する
createApp(App, { game, engineConfig }).mount('#gameContainer')
