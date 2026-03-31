<template>
  <div class="vsi-panel">
    <!-- ヘッダー -->
    <div class="vsi-header">
      <span class="vsi-vue-icon">▲</span>
      Vue State Inspector
    </div>

    <div class="vsi-section-label">component tree</div>

    <!-- App -->
    <div class="vsi-tree-item root">
      <span class="vsi-caret">▾</span>
      <span class="vsi-comp-name">&lt;App&gt;</span>
    </div>

    <!-- ── MessageWindow ─────────────────────── -->
    <div class="vsi-tree-item child">
      <span class="vsi-caret">▾</span>
      <span class="vsi-comp-name">&lt;MessageWindow&gt;</span>
    </div>

    <PropRow label="name"    :flash="flashing.name">
      <ValString :value="message.name || ''" />
    </PropRow>

    <PropRow label="content" :flash="flashing.content">
      <ValArray
        :items="message.content ?? []"
        :expanded="expanded.content"
        @toggle="expanded.content = !expanded.content"
      >
        <template #item="{ item, index }">
          <div class="vsi-array-item">
            <span class="vsi-array-index">{{ index }}</span>
            <span v-if="typeof item === 'string'" class="vsi-val string">"{{ item }}"</span>
            <span v-else-if="item && item.type === 'color'" class="vsi-val obj-inline">
              {type: "color", color: <span :style="{ color: item.color }">{{ item.color }}</span>,
              content: [<span class="vsi-val string">"{{ item.content?.[0] ?? '' }}"</span>…]}
            </span>
            <span v-else class="vsi-val obj-inline">{{ JSON.stringify(item).slice(0, 30) }}…</span>
          </div>
        </template>
      </ValArray>
    </PropRow>

    <PropRow label="speed" :flash="flashing.speed">
      <span class="vsi-val number">{{ message.speed }}</span>
    </PropRow>

    <!-- ── ChoicePanel ───────────────────────── -->
    <div class="vsi-tree-item child">
      <span class="vsi-caret">▾</span>
      <span class="vsi-comp-name">&lt;ChoicePanel&gt;</span>
    </div>

    <PropRow label="visible" :flash="flashing.choicesVisible">
      <ValBool :value="choices.visible" />
    </PropRow>

    <PropRow label="prompt" :flash="flashing.choicesPrompt">
      <ValString :value="choices.prompt || ''" />
    </PropRow>

    <PropRow label="items" :flash="flashing.choicesItems">
      <ValArray
        :items="choices.items ?? []"
        :expanded="expanded.choiceItems"
        @toggle="expanded.choiceItems = !expanded.choiceItems"
      >
        <template #item="{ item, index }">
          <div class="vsi-array-item">
            <span class="vsi-array-index">{{ index }}</span>
            <span class="vsi-val obj-inline">
              {id: <span class="vsi-val number">{{ item.id }}</span>,
              label: <span class="vsi-val string">"{{ item.label }}"</span>}
            </span>
          </div>
        </template>
      </ValArray>
    </PropRow>

    <!-- ── WaitCursor ────────────────────────── -->
    <div class="vsi-tree-item child">
      <span class="vsi-caret">▾</span>
      <span class="vsi-comp-name">&lt;WaitCursor&gt;</span>
    </div>

    <PropRow label="visible" :flash="flashing.waitVisible">
      <ValBool :value="waitCursor.visible" />
    </PropRow>

    <!-- ── EventBusMonitor ───────────────────── -->
    <div class="vsi-tree-item child">
      <span class="vsi-caret">▾</span>
      <span class="vsi-comp-name">&lt;EventBusMonitor&gt;</span>
    </div>

    <PropRow label="pulsePhase" :flash="flashing.pulsePhase">
      <span class="vsi-val number">{{ pulsePhase }}</span>
    </PropRow>

    <PropRow label="currentEvent" :flash="flashing.currentEvent">
      <ValString :value="currentEvent" />
    </PropRow>
  </div>
</template>

<script setup>
import { watch, reactive } from 'vue'

// ── サブコンポーネント ────────────────────────────────────────────

// PropRow: ラベル + フラッシュアニメーション付き行
const PropRow = {
  props: { label: String, flash: Boolean },
  template: `
    <div class="vsi-prop-row" :class="{ flash }">
      <span class="vsi-key">{{ label }}</span>
      <slot />
    </div>
  `,
}

// ValString: 文字列値
const ValString = {
  props: { value: String },
  template: `<span class="vsi-val string">"{{ value }}"</span>`,
}

// ValBool: 真偽値
const ValBool = {
  props: { value: Boolean },
  template: `<span class="vsi-val" :class="value ? 'bool-true' : 'bool-false'">{{ value }}</span>`,
}

// ValArray: 展開可能な配列
const ValArray = {
  props: { items: Array, expanded: Boolean },
  emits: ['toggle'],
  template: `
    <span>
      <span class="vsi-val array clickable" @click="$emit('toggle')">
        {{ expanded ? '▾' : '▸' }} Array({{ items.length }})
      </span>
      <div v-if="expanded" class="vsi-array-body">
        <slot v-for="(item, index) in items" name="item" :item="item" :index="index" />
        <div v-if="items.length === 0" class="vsi-array-item empty">（空）</div>
      </div>
    </span>
  `,
}

// ── Props ────────────────────────────────────────────────────────
const props = defineProps({
  message:      { type: Object, required: true },
  choices:      { type: Object, required: true },
  waitCursor:   { type: Object, required: true },
  pulsePhase:   { type: Number, default: 0 },
  currentEvent: { type: String, default: '' },
})

// ── 展開状態 ─────────────────────────────────────────────────────
const expanded = reactive({ content: false, choiceItems: false })

// ── フラッシュ状態 ───────────────────────────────────────────────
const flashing = reactive({
  name: false, content: false, speed: false,
  choicesVisible: false, choicesPrompt: false, choicesItems: false,
  waitVisible: false, pulsePhase: false, currentEvent: false,
})

function flash(key) {
  flashing[key] = true
  setTimeout(() => { flashing[key] = false }, 400)
}

watch(() => props.message.name,       () => flash('name'))
watch(() => props.message.content,    () => { flash('content'); expanded.content = true })
watch(() => props.message.speed,      () => flash('speed'))
watch(() => props.choices.visible,    () => flash('choicesVisible'))
watch(() => props.choices.prompt,     () => flash('choicesPrompt'))
watch(() => props.choices.items,      () => { flash('choicesItems'); if (props.choices.items?.length) expanded.choiceItems = true })
watch(() => props.waitCursor.visible, () => flash('waitVisible'))
watch(() => props.pulsePhase,         () => flash('pulsePhase'))
watch(() => props.currentEvent,       () => flash('currentEvent'))
</script>

<style scoped>
/* ── パネル ──────────────────────────────────── */
.vsi-panel {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 230px;
  background: rgba(6, 10, 28, 0.88);
  border: 1px solid rgba(100, 140, 255, 0.2);
  border-radius: 8px;
  padding: 10px 10px 8px;
  pointer-events: auto;   /* クリックで配列展開できるよう有効化 */
  z-index: 90;
  font-family: 'Courier New', monospace;
  font-size: 11px;
  color: rgba(200, 210, 255, 0.75);
  backdrop-filter: blur(4px);
  user-select: none;
}

/* ── ヘッダー ─────────────────────────────────── */
.vsi-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  letter-spacing: 0.1em;
  color: rgba(150, 170, 255, 0.6);
  text-transform: uppercase;
  margin-bottom: 8px;
}
.vsi-vue-icon {
  color: #42b883;
  font-size: 9px;
}

/* ── セクションラベル ─────────────────────────── */
.vsi-section-label {
  font-size: 9px;
  letter-spacing: 0.1em;
  color: rgba(150, 170, 255, 0.4);
  text-transform: uppercase;
  margin-bottom: 6px;
  padding-bottom: 4px;
  border-bottom: 1px solid rgba(100, 140, 255, 0.1);
}

/* ── ツリーアイテム ───────────────────────────── */
.vsi-tree-item {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 2px 0;
  margin-top: 4px;
}
.vsi-tree-item.root { padding-left: 0; }
.vsi-tree-item.child { padding-left: 10px; }

.vsi-caret { font-size: 9px; color: rgba(150, 170, 255, 0.4); }
.vsi-comp-name { color: #7dd3fc; font-size: 11px; }

/* ── プロパティ行 ─────────────────────────────── */
.vsi-prop-row {
  display: flex;
  align-items: flex-start;
  gap: 4px;
  padding: 1px 4px 1px 24px;
  border-radius: 3px;
}
.vsi-prop-row.flash { animation: flashRow 0.4s ease; }
@keyframes flashRow {
  0%   { background: rgba(100, 220, 255, 0.35); }
  100% { background: rgba(100, 160, 255, 0.0); }
}

.vsi-key {
  color: rgba(148, 163, 184, 0.8);
  flex-shrink: 0;
  min-width: 78px;
}
.vsi-key::after { content: ':'; margin-right: 4px; }

/* ── 値 ───────────────────────────────────────── */
.vsi-val { font-size: 10px; word-break: break-all; }
.vsi-val.string    { color: #86efac; }
.vsi-val.number    { color: #fbbf24; }
.vsi-val.array     { color: #c084fc; }
.vsi-val.obj-inline { color: rgba(200, 210, 255, 0.55); font-size: 9px; }
.vsi-val.bool-true  { color: #34d399; }
.vsi-val.bool-false { color: #f87171; }

.vsi-val.clickable {
  cursor: pointer;
  text-decoration: underline dotted rgba(192, 132, 252, 0.5);
}
.vsi-val.clickable:hover { color: #e879f9; }

/* ── 配列展開ボディ ────────────────────────────── */
.vsi-array-body {
  margin-top: 2px;
  padding-left: 8px;
  border-left: 1px solid rgba(192, 132, 252, 0.2);
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.vsi-array-item {
  display: flex;
  align-items: baseline;
  gap: 5px;
  font-size: 10px;
}
.vsi-array-item.empty { color: rgba(150, 170, 255, 0.3); font-size: 9px; }

.vsi-array-index {
  color: rgba(148, 163, 184, 0.5);
  font-size: 9px;
  flex-shrink: 0;
  min-width: 14px;
  text-align: right;
}
.vsi-array-index::after { content: ':'; }
</style>
