<script setup lang="ts">
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
    <button class="app-header__account-btn" title="Sign out" @click="signOut">
      👤
    </button>
  </header>
</template>
