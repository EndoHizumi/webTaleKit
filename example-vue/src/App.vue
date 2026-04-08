<template>
  <!--
    Vue 3 Fragment: ルート要素なし。
    #gameContainer (template.html の静的 HTML) の中に直接レンダリングされる。
    Drawer が追加するキャンバスは position:static なので、
    position:absolute な各コンポーネントが自然に前面に来る。
  -->
  <MessageWindow
    :name="message.name"
    :content="message.content"
    :speed="message.speed"
    :expand-variable="message.expandVariable"
    :wait-fn="message.waitFn"
    @displayed="onTextDisplayed"
  />

  <ChoicePanel
    v-if="choices.visible"
    :items="choices.items"
    :prompt="choices.prompt"
    @select="onChoiceSelected"
  />

  <DialogPanel
    :visible="dialog.visible"
    :prompt="dialog.prompt"
    :actions="dialog.actions"
    @action="onDialogAction"
  />

  <WaitCursor :visible="waitCursor.visible" />

  <!-- EventBus フロービジュアライザー -->
  <EventBusMonitor
    :pulse-phase="pulsePhase"
    :current-event="currentEvent"
    :recent-events="recentEvents"
    @clear="clearEvents"
  />

  <!-- Vue State Inspector (DevTools 風) -->
  <VueStateInspector
    :message="message"
    :choices="choices"
    :dialog="dialog"
    :wait-cursor="waitCursor"
    :pulse-phase="pulsePhase"
    :current-event="currentEvent"
  />
</template>

<script setup>
import { onMounted } from 'vue'
import MessageWindow from './components/MessageWindow.vue'
import ChoicePanel from './components/ChoicePanel.vue'
import DialogPanel from './components/DialogPanel.vue'
import WaitCursor from './components/WaitCursor.vue'
import EventBusMonitor from './components/EventBusMonitor.vue'
import VueStateInspector from './components/VueStateInspector.vue'
import { useWebTaleKit } from './composables/useWebTaleKit.js'
import { useEventBusMonitor } from './composables/useEventBusMonitor.js'

const props = defineProps({
  game:         { type: Object, required: true },
  engineConfig: { type: Object, required: true },
})

const { pulsePhase, currentEvent, recentEvents, recordEvent, clearEvents } = useEventBusMonitor()

const {
  message,
  choices,
  dialog,
  waitCursor,
  onTextDisplayed,
  onChoiceSelected,
  onDialogAction,
  onNext,
  onSetSkip,
} = useWebTaleKit(props.game, props.engineConfig.resolution, { onEvent: recordEvent })

onMounted(() => {
  const container = document.getElementById('gameContainer')
  container.addEventListener('click', onNext)
  container.addEventListener('keydown', (e) => {
    if (e.key === 'Enter')   { e.preventDefault(); onNext() }
    if (e.key === 'Control') { onSetSkip(true, true) }
  })
  container.addEventListener('keyup', (e) => {
    if (e.key === 'Control') onSetSkip(true, false)
  })

  props.game.start('title')
})
</script>

<style>
/*
  グローバル: Drawer が動的追加するキャンバスのスタック順を固定
  ─ main canvas   z-index:0  (背景・キャラクター描画)
  ─ .fadeCanvas   z-index:1  (フェード効果: canvas の上、Vue UI の下)
  ─ Vue UI 各層   z-index:10+
*/
#gameContainer canvas:not(.fadeCanvas) {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 0;
}
#gameContainer .fadeCanvas {
  z-index: 1;
}
</style>
