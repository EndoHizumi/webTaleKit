<template>
  <!--
    ChoicePanel
    EventBus の choice:show イベントデータを受け取り、
    選択肢ボタンを表示するコンポーネント。

    Core は選択結果 { selectId, onSelect } が返るまで await して待機する。
    ユーザーが選択したら $emit('select', id, content) で親に通知し、
    親 (App.vue) が onChoiceSelected() を介して Core を再開させる。
  -->
  <div class="choice-overlay">
    <p v-if="prompt" class="choice-prompt">{{ prompt }}</p>
    <div class="choice-list">
      <button
        v-for="item in items"
        :key="item.id"
        class="choice-btn"
        @click.stop="select(item)"
      >
        {{ item.label }}
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  items:  { type: Array,  default: () => [] },
  prompt: { type: String, default: '' },
})

const emit = defineEmits(['select'])

function select(item) {
  // item.content が Core に addScenario される選択肢シナリオ
  emit('select', item.id, item.content)
}
</script>

<style scoped>
.choice-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 16px;
  background: rgba(0, 0, 0, 0.45);
  z-index: 20;
}

.choice-prompt {
  color: #cde;
  font-size: 16px;
  margin-bottom: 8px;
  text-shadow: 0 1px 4px #000;
}

.choice-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 400px;
}

.choice-btn {
  width: 100%;
  padding: 14px 32px;
  background: rgba(20, 30, 90, 0.85);
  border: 1px solid rgba(100, 160, 255, 0.5);
  border-radius: 4px;
  color: #ddf;
  font-size: 16px;
  font-family: inherit;
  letter-spacing: 0.06em;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease, transform 0.1s ease;
}

.choice-btn:hover {
  background: rgba(40, 60, 160, 0.9);
  border-color: rgba(150, 200, 255, 0.8);
  transform: translateX(4px);
}

.choice-btn:active {
  background: rgba(60, 90, 200, 0.9);
  transform: translateX(2px);
}
</style>
