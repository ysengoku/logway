<script setup lang="ts">
import LogoAnimation from '@/components/LogoAnimation.vue';
import { useAuthStore } from '@/stores/auth';
import { useLoadingStore } from '@/stores/loading';

const authStore = useAuthStore();
const loadingStore = useLoadingStore();
</script>

<template>
  <div v-if="loadingStore.active" class="app-loader">
    <div class="loader"></div>
  </div>
  <Transition name="fade-boot-loader">
    <template v-if="!authStore.initialized">
      <div class="app-boot-loader">
        <div class="loader">
          <LogoAnimation />
        </div>
      </div>
    </template>
  </Transition>
</template>
