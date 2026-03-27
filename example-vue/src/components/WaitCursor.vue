<template>
  <div class="wait-cursor" :class="{ visible }" aria-hidden="true">▼</div>
</template>

<script setup>
defineProps({
  visible: { type: Boolean, default: false },
})
</script>

<style scoped>
.wait-cursor {
  position: absolute;
  right: 48px;
  bottom: 38px;
  color: #9bf;
  font-size: 13px;
  opacity: 0;
  transition: opacity 0.3s ease;
  animation: bounce 1s ease-in-out infinite;
  pointer-events: none;
  z-index: 15;
}

.wait-cursor.visible {
  opacity: 1;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(4px); }
}
</style>
