<template>
  <!--
    DialogPanel
    EventBus の dialog:show イベントデータを受け取り、
    モーダルダイアログを表示するコンポーネント。

    Core は選択結果が返るまで await して待機する。
    ユーザーがアクションボタンを押したら $emit('action', action) で親に通知し、
    親 (App.vue) が onDialogAction() を介して Core を再開させる。
  -->
  <Teleport to="body">
    <div v-if="visible" class="dialog-overlay">
      <div class="dialog-container">
        <p v-if="prompt" class="dialog-prompt">{{ prompt }}</p>
        <div class="dialog-buttons">
          <button
            v-for="action in actions"
            :key="action.id"
            class="dialog-button"
            @click.stop="select(action)"
          >
            {{ action.label }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
const props = defineProps({
  visible: { type: Boolean, default: false },
  prompt:  { type: String,  default: '' },
  actions: { type: Array,   default: () => [] },
})

const emit = defineEmits(['action'])

function select(action) {
  emit('action', action)
}
</script>

<style scoped>
.dialog-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.6);
  z-index: 100;
}

.dialog-container {
  background: rgba(10, 15, 50, 0.95);
  border: 1px solid rgba(100, 160, 255, 0.4);
  border-radius: 8px;
  padding: 28px 36px 24px;
  min-width: 320px;
  max-width: 500px;
  backdrop-filter: blur(6px);
  animation: dialogIn 0.2s ease;
}

@keyframes dialogIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(8px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.dialog-prompt {
  color: #dde;
  font-size: 16px;
  line-height: 1.7;
  margin: 0 0 20px;
  text-align: center;
  white-space: pre-wrap;
}

.dialog-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.dialog-button {
  width: 100%;
  padding: 12px 24px;
  background: rgba(20, 30, 90, 0.8);
  border: 1px solid rgba(100, 160, 255, 0.4);
  border-radius: 4px;
  color: #ddf;
  font-size: 15px;
  font-family: inherit;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease;
}

.dialog-button:hover {
  background: rgba(40, 60, 160, 0.9);
  border-color: rgba(150, 200, 255, 0.7);
}

.dialog-button:active {
  background: rgba(60, 90, 200, 0.9);
}
</style>
