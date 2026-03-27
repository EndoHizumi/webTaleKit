/**
 * useWebTaleKit
 *
 * WebTaleKit の EventBus を Vue のリアクティブ状態にブリッジするコンポーザブル。
 *
 * イベント駆動アーキテクチャのポイント:
 *   - Core はゲームロジックのみを担当し、UI の実装を知らない
 *   - EventBus を通じて「何を表示すべきか」だけを伝える
 *   - Vue コンポーネントは EventBus を購読し、自身のやり方で UI を実現する
 *   - Core ↔ Vue 間に直接的な依存関係は一切ない
 */
import { ref, reactive, readonly } from 'vue'

export function useWebTaleKit(game, resolution, { onEvent } = {}) {
  const { eventBus, drawer } = game

  // ── リアクティブ状態 ──────────────────────────────────────────────
  const message = reactive({
    name: '',
    content: [],   // string | TextObject の配列 (Core の text:show と同じ構造)
    speed: 25,
    expandVariable: null,
    waitFn: null,
    _resolve: null,
  })

  const choices = reactive({
    visible: false,
    items: [],
    prompt: '',
    _resolve: null,
  })

  const waitCursor = reactive({ visible: false })
  const inputHandlers = ref({ onNext: null, setSkip: null })

  // ── EventBus ハンドラ登録 ─────────────────────────────────────────

  // screen:load: Drawer のキャンバス初期化のみ実施（HTML 注入は Vue が担うため不要）
  let canvasInitialized = false
  eventBus.on('screen:load', async (data) => {
    onEvent?.('screen:load', data)
    if (!canvasInitialized) {
      const gameContainer = document.getElementById('gameContainer')
      // Drawer がキャンバスを gameContainer に追加し、画像描画の準備をする
      drawer.setScreen(gameContainer, resolution)
      canvasInitialized = true
    }
  })

  // text:clear: メッセージ表示領域をリセット
  eventBus.on('text:clear', (data) => {
    onEvent?.('text:clear', data)
    message.name = ''
    message.content = []
  })

  // text:show: Core から1行分のテキストデータが届く。
  //            Promise を返すことで、Vue 側の表示完了まで Core を待機させる。
  eventBus.on('text:show', (data) => {
    onEvent?.('text:show', data)
    return new Promise((resolve) => {
      message.name = data.name || ''
      message.content = data.content
      message.speed = data.speed ?? 25
      message.expandVariable = data.expandVariable
      message.waitFn = data.waitFn
      message._resolve = resolve
    })
  })

  // choice:show: ユーザーが選択するまで Core を待機させ、結果 { selectId, onSelect } を返す
  eventBus.on('choice:show', (data) => {
    onEvent?.('choice:show', data)
    return new Promise((resolve) => {
      choices.visible = true
      choices.items = data.content
      choices.prompt = data.prompt || ''
      choices._resolve = resolve
    })
  })

  // input:bind: キーボード・クリックのコールバックを受け取って保持する
  eventBus.on('input:bind', (data) => {
    onEvent?.('input:bind', data)
    inputHandlers.value = { onNext: data.onNext, setSkip: data.setSkip }
  })

  // ── Vue コンポーネントから呼ぶアクション ──────────────────────────

  /** MessageWindow がテキスト表示完了を通知する (クリック待ちカーソルを表示) */
  function onTextDisplayed() {
    waitCursor.visible = true
    if (message._resolve) {
      message._resolve()
      message._resolve = null
    }
  }

  /** ChoicePanel がユーザーの選択を通知する */
  function onChoiceSelected(selectId, onSelect) {
    choices.visible = false
    if (choices._resolve) {
      choices._resolve({ selectId, onSelect })
      choices._resolve = null
    }
  }

  /** クリック / Enter でゲームを進める */
  function onNext() {
    waitCursor.visible = false
    if (inputHandlers.value.onNext) inputHandlers.value.onNext()
  }

  /** Ctrl キーでスキップ */
  function onSetSkip(drawerSkip, coreNext) {
    if (inputHandlers.value.setSkip) inputHandlers.value.setSkip(drawerSkip, coreNext)
  }

  return {
    message: readonly(message),
    choices: readonly(choices),
    waitCursor: readonly(waitCursor),
    onTextDisplayed,
    onChoiceSelected,
    onNext,
    onSetSkip,
  }
}
