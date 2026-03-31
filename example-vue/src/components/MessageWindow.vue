<template>
  <div class="message-window" :class="{ visible: hasContent }">
    <!-- キャラクター名プレート -->
    <div v-if="name" class="name-plate">{{ name }}</div>

    <!-- テキスト表示エリア: Core から届く content 配列を1文字ずつアニメーション表示 -->
    <div class="message-body">
      <span
        v-for="(segment, i) in renderedSegments"
        :key="i"
        :style="segment.style"
        :class="segment.class"
      >{{ segment.text }}</span>
    </div>
  </div>
</template>

<script setup>
/**
 * MessageWindow
 *
 * EventBus の text:show イベントデータを受け取り、
 * 1文字ずつタイプライター表示するコンポーネント。
 *
 * Core (WebTaleKit) は「何を表示するか」だけを知っており、
 * 「どう表示するか」はこの Vue コンポーネントが決定する。
 * — イベント駆動アーキテクチャによる関心の分離 —
 */
import { ref, watch, computed } from 'vue'

const props = defineProps({
  name: { type: String, default: '' },
  content: { type: Array, default: () => [] },
  speed: { type: Number, default: 25 },
  expandVariable: { type: Function, default: null },
  waitFn: { type: Function, default: null },
})

const emit = defineEmits(['displayed'])

// 現在画面に表示しているテキストセグメント
const renderedSegments = ref([])
const hasContent = computed(() => renderedSegments.value.length > 0 || props.name)

// content が更新されたら1文字ずつアニメーション表示を開始
watch(
  () => props.content,
  async (content) => {
    if (!content || content.length === 0) {
      renderedSegments.value = []
      return
    }
    renderedSegments.value = []
    await animateContent(content)
    emit('displayed')  // Core に表示完了を通知 → Core が clickWait に進む
  },
  { deep: true },
)

async function animateContent(content) {
  for (const item of content) {
    if (typeof item === 'string') {
      await typeText(item, props.speed, {})
    } else if (item.type === 'br') {
      renderedSegments.value.push({ text: '\n', style: {}, class: '' })
    } else if (item.type === 'wait') {
      if (!item.nw && props.waitFn) await props.waitFn({ wait: item.time })
    } else {
      // 装飾テキスト: color / bold / italic / ruby
      const style = getDecoratedStyle(item)
      const text = props.expandVariable ? props.expandVariable(item.content[0]) : item.content[0]
      await typeText(text, item.speed || props.speed, style)
    }
  }
}

async function typeText(rawText, speed, style) {
  const text = props.expandVariable ? props.expandVariable(rawText) : rawText
  const segment = { text: '', style, class: '' }
  renderedSegments.value.push(segment)
  for (const char of text) {
    segment.text += char
    // リアクティビティのため配列を再代入
    renderedSegments.value = [...renderedSegments.value]
    await sleep(speed)
  }
}

function getDecoratedStyle(item) {
  switch (item.type) {
    case 'color': return { color: item.value }
    case 'b':     return { fontWeight: 'bold' }
    case 'i':     return { fontStyle: 'italic' }
    default:      return {}
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}
</script>

<style scoped>
.message-window {
  position: absolute;
  bottom: 30px;
  left: 0;
  width: 100%;
  min-height: 160px;
  background: rgba(10, 15, 60, 0.82);
  backdrop-filter: blur(4px);
  border-top: 1px solid rgba(100, 140, 255, 0.3);
  color: #eef;
  padding: 20px 40px 16px;
  box-sizing: border-box;
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 0.25s ease, transform 0.25s ease;
  pointer-events: none;
  z-index: 10;
}

.message-window.visible {
  opacity: 1;
  transform: translateY(0);
}

.name-plate {
  position: absolute;
  top: -32px;
  left: 32px;
  background: rgba(10, 15, 60, 0.9);
  border: 1px solid rgba(100, 140, 255, 0.4);
  border-bottom: none;
  padding: 4px 18px;
  font-size: 15px;
  font-weight: bold;
  color: #9bf;
  letter-spacing: 0.08em;
}

.message-body {
  font-size: 17px;
  line-height: 1.8;
  letter-spacing: 0.05em;
  white-space: pre-wrap;
}
</style>
