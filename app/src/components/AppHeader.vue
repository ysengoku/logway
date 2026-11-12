<script setup lang="ts">
import { useRouter } from 'vue-router';
import HeaderAccountMenu from './header/HeaderAccountMenu.vue';
import HeaderLocaleMenu from './header/HeaderLocaleMenu.vue';
import logoUrl from '@/assets/images/logo.svg';

const router = useRouter();
</script>

<template>
  <header class="app-header">
    <div class="app-header__logo" @click="router.push({ name: 'home' })">
      <img :src="logoUrl" alt="LogWay" class="app-header__logo-image" />
    </div>
    <div class="app-header__actions">
      <HeaderLocaleMenu />
      <HeaderAccountMenu />
    </div>
  </header>
</template>
