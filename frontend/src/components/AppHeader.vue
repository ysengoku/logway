<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();
</script>

<template>
  <header class="app-header">
    <h1 class="app-header__logo" @click="router.push({ name: 'home' })">
      Lo<span class="app-header__logo-highlight">gWa</span>y
    </h1>
    <button class="app-header__account-btn" title="Account">
      👤
    </button>
  </header>
</template>
