<script setup lang="ts">
import AppIcon from './AppIcon.vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

async function signOut() {
  await authStore.signOut();
  router.push({ name: 'auth' });
}
</script>

<template>
  <header class="app-header">
    <div class="app-header__logo" @click="router.push({ name: 'home' })">
      Lo<span class="app-header__logo-highlight">gWa</span>y
    </div>
    <button
      v-if="authStore.isAuthenticated"
      class="app-header__account-btn"
      title="Sign out"
      @click="signOut"
    >
      <AppIcon name="face" :size="32"  />
    </button>
  </header>
</template>
