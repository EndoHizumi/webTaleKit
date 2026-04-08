/**
 * useEventBusMonitor
 *
 * EventBus を流れるイベントをリアルタイムで記録し、
 * Core → EventBus → Vue のパルスアニメーション状態を管理する。
 *
 * useWebTaleKit から onEvent コールバックとして呼ばれるだけで、
 * EventBus 購読の知識を持たない（関心の分離）。
 */
import { ref, readonly } from 'vue'

// イベント別の色とサマリー生成
const EVENT_META = {
  'screen:load':  { color: '#60a5fa', label: 'screen:load' },
  'text:clear':   { color: '#94a3b8', label: 'text:clear' },
  'text:show':    { color: '#34d399', label: 'text:show' },
  'choice:show':  { color: '#f59e0b', label: 'choice:show' },
  'dialog:show':  { color: '#f472b6', label: 'dialog:show' },
  'input:bind':   { color: '#a78bfa', label: 'input:bind' },
}

function makeSummary(eventName, data) {
  if (!data) return ''
  switch (eventName) {
    case 'text:show': {
      const prefix = data.name ? `${data.name}: ` : ''
      const first = data.content?.[0]
      const text = typeof first === 'string' ? first : first?.content?.[0] ?? ''
      return (prefix + text).slice(0, 20) + (text.length > 18 ? '…' : '')
    }
    case 'choice:show':
      return `選択肢 ×${data.content?.length ?? 0} 件`
    case 'dialog:show': {
      const prompt = data.content?.find((c) => c.type === 'prompt')
      const text = prompt?.content?.[0] ?? ''
      return (typeof text === 'string' ? text : '').slice(0, 20) + (text.length > 18 ? '...' : '')
    }
    case 'screen:load':
      return data.isDialog ? 'dialog' : 'main'
    default:
      return ''
  }
}

let _uid = 0

export function useEventBusMonitor() {
  // ── フロー図パルス状態 ──────────────────────────────────────────
  // 0=idle, 1=Core ハイライト, 2=EventBus ハイライト, 3=Vue ハイライト, 4=薄く保持
  const pulsePhase = ref(0)
  const currentEvent = ref('')   // パルス中のイベント名（フロー図に表示）

  // ── ログ ───────────────────────────────────────────────────────
  const recentEvents = ref([])   // 最新 6 件

  // ── パルスタイマー管理 ─────────────────────────────────────────
  let phaseTimer = null

  function startPulse(eventName) {
    // 実行中のタイマーをキャンセルして先頭からやり直す（debounce）
    if (phaseTimer !== null) {
      clearTimeout(phaseTimer)
      phaseTimer = null
    }

    currentEvent.value = eventName
    pulsePhase.value = 1  // Core 光る

    phaseTimer = setTimeout(() => {
      pulsePhase.value = 2  // EventBus 光る
      phaseTimer = setTimeout(() => {
        pulsePhase.value = 3  // Vue 光る
        phaseTimer = setTimeout(() => {
          pulsePhase.value = 4  // 次のイベントが来るまで薄く残す
          phaseTimer = null
        }, 400)
      }, 150)
    }, 150)
  }

  // ── 外部から呼ばれる hook ──────────────────────────────────────
  function recordEvent(eventName, data) {
    const meta = EVENT_META[eventName] ?? { color: '#e2e8f0', label: eventName }
    const entry = {
      id: ++_uid,
      name: meta.label,
      color: meta.color,
      summary: makeSummary(eventName, data),
    }

    // 先頭に追加し 6 件を超えたら末尾を削除
    recentEvents.value = [entry, ...recentEvents.value].slice(0, 6)

    startPulse(eventName)
  }

  function clearEvents() {
    recentEvents.value = []
    pulsePhase.value = 0
    currentEvent.value = ''
    if (phaseTimer !== null) {
      clearTimeout(phaseTimer)
      phaseTimer = null
    }
  }

  return {
    pulsePhase: readonly(pulsePhase),
    currentEvent: readonly(currentEvent),
    recentEvents: readonly(recentEvents),
    recordEvent,
    clearEvents,
  }
}
