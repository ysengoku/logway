<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue';
import AppLoader from '@/components/AppLoader.vue';
import { RouterView } from 'vue-router';
</script>

<template>
  <div id="app">
    <AppHeader />
    <AppLoader />
    <div class="router-view-wrapper">
      <RouterView />
    </div>
  </div>
</template>
