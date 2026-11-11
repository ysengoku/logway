<script setup lang="ts">
import LogoAnimation from '@/components/LogoAnimation.vue';
</script>

<template>
  <main class="maintenance">
    <h1 class="maintenance__logo" aria-label="LogWay">
      <LogoAnimation />
    </h1>
    <p class="maintenance__message">
      {{ $t('common.maintenance.rebuilding') }}<br />
      {{ $t('common.maintenance.availableSoon') }}
    </p>
  </main>
</template>
