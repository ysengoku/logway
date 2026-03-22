<script setup lang="ts">
import { ref } from 'vue';

withDefaults(defineProps<{
  open: boolean;
  title: string;
  overlayClass?: string;
  modalClass?: string;
  titleClass?: string;
}>(), {
  overlayClass: 'app-modal__overlay',
  modalClass: 'app-modal',
  titleClass: 'app-modal__title',
});

const emit = defineEmits<{
  close: [];
}>();

const overlayPressed = ref(false);

function onOverlayMouseDown() {
  overlayPressed.value = true;
}

function onOverlayMouseUp() {
  if (overlayPressed.value) {
    emit('close');
  }
  overlayPressed.value = false;
}

function onOverlayMouseLeave() {
  overlayPressed.value = false;
}
</script>

<template>
  <div
    v-if="open"
    :class="overlayClass"
    @mousedown.self="onOverlayMouseDown"
    @mouseup.self="onOverlayMouseUp"
    @mouseleave="onOverlayMouseLeave"
  >
    <div :class="modalClass">
      <div :class="titleClass">{{ title }}</div>
      <slot />
    </div>
  </div>
</template>
