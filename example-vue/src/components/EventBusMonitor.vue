<template>
  <div class="ebm-panel" :class="{ collapsed }">
    <!-- ヘッダー（常時表示・クリック可能） -->
    <div class="ebm-header" @click="toggle">
      <span class="ebm-dot" :class="{ pulse: isPulsing, retained: isRetained }" />
      EventBus Monitor
      <span class="ebm-toggle">{{ collapsed ? '▸' : '▾' }}</span>
    </div>

    <!-- 折りたたみ可能な本体 -->
    <template v-if="!collapsed">
      <!-- フロー図: Core → EventBus → Vue -->
      <div class="ebm-flow">
        <div class="ebm-node" :class="{ active: pulsePhase >= 1 && pulsePhase <= 3, retained: isRetained }">
          <span class="ebm-icon">◈</span> Core
        </div>

        <div class="ebm-connector" :class="{ active: pulsePhase >= 2 && pulsePhase <= 3, retained: isRetained }">
          <span class="ebm-arrow-line" />
          <span class="ebm-emit-label" :class="{ visible: pulsePhase >= 1 || isRetained, retained: isRetained }">
            emit( <em>{{ currentEvent || '…' }}</em> )
          </span>
        </div>

        <div class="ebm-node accent" :class="{ active: pulsePhase >= 2 && pulsePhase <= 3, retained: isRetained }">
          <span class="ebm-icon">⚡</span> EventBus
        </div>

        <div class="ebm-connector" :class="{ active: pulsePhase >= 3 && pulsePhase <= 3, retained: isRetained }">
          <span class="ebm-arrow-line" />
          <span class="ebm-emit-label" :class="{ visible: pulsePhase >= 2 || isRetained, retained: isRetained }">
            receive
          </span>
        </div>

        <div class="ebm-node vue" :class="{ active: pulsePhase === 3, retained: isRetained }">
          <span class="ebm-icon">◆</span> Vue UI
        </div>
      </div>

      <!-- イベントログ -->
      <div class="ebm-log-header">recent events</div>
      <TransitionGroup name="log" tag="ul" class="ebm-log">
        <li v-for="ev in recentEvents" :key="ev.id" class="ebm-log-item">
          <span class="ebm-tag" :style="{ borderColor: ev.color, color: ev.color }">
            {{ ev.name }}
          </span>
          <span v-if="ev.summary" class="ebm-summary">{{ ev.summary }}</span>
        </li>
      </TransitionGroup>
    </template>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  pulsePhase:   { type: Number, default: 0 },
  currentEvent: { type: String, default: '' },
  recentEvents: { type: Array,  default: () => [] },
})

const emit = defineEmits(['clear'])

const collapsed = ref(false)
const isRetained = computed(() => props.pulsePhase === 4)
const isPulsing = computed(() => props.pulsePhase > 0 && props.pulsePhase < 4)

function toggle() {
  collapsed.value = !collapsed.value
  // 再表示時にログをクリアする
  if (!collapsed.value) {
    emit('clear')
  }
}
</script>

<style scoped>
/* ── パネル全体 ──────────────────────────────── */
.ebm-panel {
  position: absolute;
  top: 12px;
  left: 12px;
  width: 230px;
  background: rgba(6, 10, 28, 0.82);
  border: 1px solid rgba(100, 140, 255, 0.2);
  border-radius: 8px;
  padding: 10px 12px 8px;
  z-index: 90;
  font-family: 'Courier New', monospace;
  font-size: 11px;
  color: rgba(200, 210, 255, 0.75);
  backdrop-filter: blur(4px);
}

.ebm-panel.collapsed {
  padding-bottom: 10px;
}

/* ── ヘッダー ────────────────────────────────── */
.ebm-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  letter-spacing: 0.1em;
  color: rgba(150, 170, 255, 0.6);
  text-transform: uppercase;
  margin-bottom: 10px;
  cursor: pointer;
  user-select: none;
}

.ebm-panel.collapsed .ebm-header {
  margin-bottom: 0;
}

.ebm-header:hover {
  color: rgba(180, 200, 255, 0.9);
}

.ebm-toggle {
  margin-left: auto;
  font-size: 9px;
}

.ebm-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(100, 140, 255, 0.4);
  transition: background 0.2s ease, box-shadow 0.2s ease;
}
.ebm-dot.pulse {
  background: #7af;
  box-shadow: 0 0 6px #7af;
}
.ebm-dot.retained {
  background: rgba(122, 170, 255, 0.65);
  box-shadow: 0 0 3px rgba(122, 170, 255, 0.35);
}

/* ── フロー図 ────────────────────────────────── */
.ebm-flow {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0;
  margin-bottom: 10px;
}

.ebm-node {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 4px;
  border: 1px solid rgba(100, 140, 255, 0.2);
  background: rgba(20, 30, 70, 0.5);
  font-size: 11px;
  font-weight: bold;
  letter-spacing: 0.05em;
  color: rgba(180, 200, 255, 0.5);
  transition: color 0.15s ease, border-color 0.15s ease,
              background 0.15s ease, box-shadow 0.15s ease;
  width: 100%;
  box-sizing: border-box;
}
.ebm-node.active {
  color: #c8e6ff;
  border-color: rgba(120, 180, 255, 0.6);
  background: rgba(40, 70, 160, 0.5);
  box-shadow: 0 0 10px rgba(100, 160, 255, 0.3);
}
.ebm-node.retained {
  color: rgba(200, 230, 255, 0.78);
  border-color: rgba(120, 180, 255, 0.35);
  background: rgba(34, 52, 110, 0.3);
  box-shadow: 0 0 4px rgba(100, 160, 255, 0.14);
}
.ebm-node.accent.active {
  color: #ffe08a;
  border-color: rgba(250, 200, 80, 0.6);
  background: rgba(80, 60, 20, 0.5);
  box-shadow: 0 0 10px rgba(250, 200, 80, 0.3);
}
.ebm-node.accent.retained {
  color: rgba(255, 224, 138, 0.78);
  border-color: rgba(250, 200, 80, 0.35);
  background: rgba(80, 60, 20, 0.28);
  box-shadow: 0 0 4px rgba(250, 200, 80, 0.16);
}
.ebm-node.vue.active {
  color: #6ee7b7;
  border-color: rgba(52, 211, 153, 0.6);
  background: rgba(20, 70, 50, 0.5);
  box-shadow: 0 0 10px rgba(52, 211, 153, 0.3);
}
.ebm-node.vue.retained {
  color: rgba(110, 231, 183, 0.82);
  border-color: rgba(52, 211, 153, 0.35);
  background: rgba(20, 70, 50, 0.28);
  box-shadow: 0 0 4px rgba(52, 211, 153, 0.16);
}

.ebm-icon {
  font-size: 9px;
  opacity: 0.7;
}

/* ── コネクター（矢印 + ラベル） ──────────────── */
.ebm-connector {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 1px 0 1px 14px;
  min-height: 22px;
}

.ebm-arrow-line {
  display: block;
  width: 1px;
  height: 16px;
  background: rgba(100, 140, 255, 0.25);
  transition: background 0.15s ease;
  flex-shrink: 0;
}
.ebm-connector.active .ebm-arrow-line {
  background: rgba(120, 180, 255, 0.7);
  box-shadow: 0 0 4px rgba(120, 180, 255, 0.5);
}
.ebm-connector.retained .ebm-arrow-line {
  background: rgba(120, 180, 255, 0.42);
  box-shadow: 0 0 2px rgba(120, 180, 255, 0.22);
}

.ebm-emit-label {
  font-size: 9px;
  color: rgba(150, 170, 255, 0.0);
  transition: color 0.2s ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 160px;
}
.ebm-emit-label.visible {
  color: rgba(150, 170, 255, 0.7);
}
.ebm-emit-label.retained {
  color: rgba(150, 170, 255, 0.48);
}
.ebm-emit-label em {
  font-style: normal;
  color: #fde68a;
}

/* ── ログ ────────────────────────────────────── */
.ebm-log-header {
  font-size: 9px;
  letter-spacing: 0.1em;
  color: rgba(150, 170, 255, 0.4);
  text-transform: uppercase;
  margin-bottom: 4px;
  padding-top: 6px;
  border-top: 1px solid rgba(100, 140, 255, 0.1);
}

.ebm-log {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-height: 20px;
}

.ebm-log-item {
  display: flex;
  align-items: center;
  gap: 5px;
  overflow: hidden;
}

.ebm-tag {
  flex-shrink: 0;
  border: 1px solid;
  border-radius: 3px;
  padding: 0 4px;
  font-size: 9px;
  line-height: 1.6;
  letter-spacing: 0.04em;
}

.ebm-summary {
  font-size: 10px;
  color: rgba(200, 210, 255, 0.5);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* TransitionGroup アニメーション */
.log-enter-from {
  opacity: 0;
  transform: translateX(-10px);
}
.log-enter-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.log-leave-to {
  opacity: 0;
}
.log-leave-active {
  transition: opacity 0.25s ease;
  position: absolute;
}
</style>
