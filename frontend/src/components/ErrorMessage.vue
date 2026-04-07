<script setup lang="ts">
import { getFaIcon } from '@/lib/faIcons';

const props = defineProps<{
  message: string;
}>();
</script>

<template>
  <div class="error-message">
    <FaIcon :icon="getFaIcon('circle-exclamation')" />
    {{ props.message }}
  </div>
</template>
