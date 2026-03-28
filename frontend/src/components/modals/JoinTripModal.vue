<script setup lang="ts">
import AppModal from '@/components/AppModal.vue';
import JoinTripForm from '@/components/forms/JoinTripForm.vue';

defineProps<{
  open: boolean;
  message?: string | null;
}>();

const emit = defineEmits<{
  close: [];
  submit: [inviteCode: string];
}>();
</script>

<template>
  <AppModal :open="open" :title="$t('common.joinTrip')" @close="emit('close')">
    <JoinTripForm :message="message" @submit="emit('submit', $event)" @cancel="emit('close')" />
  </AppModal>
</template>