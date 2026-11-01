<script setup lang="ts">
import AppModal from '@/components/AppModal.vue';
import TripForm from '@/components/forms/TripForm.vue';
import type { Trip } from '@/shared/types/trip';
import type { TripInput } from '@/shared/types/trip';

withDefaults(defineProps<{
  open: boolean;
  title: string;
  initial?: Partial<Trip>;
  submitLabel?: string;
}>(), {
  submitLabel: 'Create trip',
});

const emit = defineEmits<{
  close: [];
  submit: [data: TripInput];
}>();
</script>

<template>
  <AppModal :open="open" :title="title" @close="emit('close')">
    <TripForm
      :initial="initial"
      :submit-label="submitLabel"
      @submit="emit('submit', $event)"
      @cancel="emit('close')"
    />
  </AppModal>
</template>