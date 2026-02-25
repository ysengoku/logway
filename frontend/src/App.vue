<script setup lang="ts">
import { onMounted } from 'vue';
import { RouterView } from 'vue-router';
import { useEventsStore } from '@/stores/events';

const eventsStore = useEventsStore();

onMounted(async () => {
  await eventsStore.fetchAll();
});
</script>

<template>
  <div id="app">
    <RouterView />
  </div>
</template>
