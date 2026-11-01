<script setup lang="ts">
import HeaderAccountMenu from './header/HeaderAccountMenu.vue';
import HeaderLocaleMenu from './header/HeaderLocaleMenu.vue';
import { useRouter } from 'vue-router';

const router = useRouter();
</script>

<template>
  <header class="app-header">
    <div class="app-header__logo" @click="router.push({ name: 'home' })">
      Lo<span class="app-header__logo-highlight">gWa</span>y
    </div>
    <div class="app-header__actions">
      <HeaderLocaleMenu />
      <HeaderAccountMenu />
    </div>
  </header>
</template>
