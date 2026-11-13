<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue';
import AppLoader from '@/components/AppLoader.vue';
import { useAuthStore } from './stores/auth';
import { useRouter } from 'vue-router';
import { onMounted, onUnmounted } from 'vue';
import { RouterView } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

onMounted(() => {
  document.addEventListener('visibilitychange', onVisibilitychange);
});

onUnmounted(() => {
  document.removeEventListener('visibilitychange', onVisibilitychange);
});

async function onVisibilitychange() {
  if (document.hidden || !authStore.isAuthenticated) {
    return;
  }
  const sessionResumed = await authStore.resumeSession();
  if (!sessionResumed) {
    router.push({ name: 'auth' });
  }
}
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
