<script setup lang="ts">
defineProps<{
  open: boolean;
  title: string;
}>();

const emit = defineEmits<{
  close: [];
}>();
</script>

<template>
  <div v-if="open" class="new-trip-modal__overlay" @click.self="emit('close')">
    <div class="new-trip-modal">
      <div class="new-trip-modal__title">{{ title }}</div>
      <slot />
    </div>
  </div>
</template>
