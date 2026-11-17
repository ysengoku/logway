<script setup lang="ts">
import { useToastStore } from '@/stores/toast';

const toastStore = useToastStore();
</script>

<template>
  <TransitionGroup name="app-toast" tag="div" class="app-toast__container" aria-live="polite">
    <div
      v-for="toast in toastStore.queue"
      :key="toast.id"
      class="app-toast__message"
      :class="`app-toast__${toast.type}`"
    >
      {{ toast.message }}
    </div>
  </TransitionGroup>
</template>
