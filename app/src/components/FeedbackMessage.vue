<script setup lang="ts">
import { getFaIcon } from '@/lib/faIcons';

const props = defineProps<{
  type: 'info' | 'success' | 'error';
  message: string;
}>();

const iconName = {
  info: 'circle-info',
  success: 'check-circle',
  error: 'circle-xmark',
};
</script>

<template>
  <div :class="`feedback-message feedback-${props.type}`">
    <FaIcon :icon="getFaIcon(iconName[props.type])" />
    {{ props.message }}
  </div>
</template>
