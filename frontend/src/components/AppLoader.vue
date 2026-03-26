<script setup lang="ts">
import { useLoadingStore } from '@/stores/loading';
const loadingStore = useLoadingStore();
</script>

<template>
  <div v-if="loadingStore.active" class="app-loader">
    <div class="loader"></div>
  </div>
</template>
