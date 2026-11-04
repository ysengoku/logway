<script setup lang="ts">
import { reactive } from 'vue';
import type { ActivityEventInput, EventOfType } from '@/shared/types/event';

const props = defineProps<{
  initial?: EventOfType<'activity'>;
  defaultDate?: string;
}>();

const emit = defineEmits<{
  submit: [data: ActivityEventInput];
}>();

const form = reactive({
  name: props.initial?.name ?? '',
  address: props.initial?.address ?? '',
  start_date: props.initial?.start_date ?? props.defaultDate ?? '',
  start_time: props.initial?.start_time ?? '',
  url: props.initial?.url ?? '',
  note: props.initial?.note ?? '',
});

function submit() {
  if (!form.name || !form.start_date) {
    alert('Name and date are required.');
    return;
  }

  emit('submit', {
    type: 'activity',
    name: form.name,
    address: form.address || null,
    start_date: form.start_date,
    start_time: form.start_time || null,
    end_date: form.start_date,
    url: form.url || null,
    note: form.note || null,
  });
}

defineExpose({ submit });
</script>

<template>
  <div class="activity-form">
    <div class="form-row">
      <label>{{ $t('form.event.name') }} *</label>
      <input v-model="form.name" type="text" placeholder="e.g. Louvre Museum" />
    </div>
    <div class="form-row">
      <label>{{ $t('form.event.address') }}</label>
      <input v-model="form.address" type="text" placeholder="e.g. Rue de Rivoli, 75001 Paris" />
    </div>

    <hr class="form-divider" />

    <div class="form-row-2">
      <div class="form-row">
        <label>{{ $t('form.event.date') }} *</label>
        <input v-model="form.start_date" type="date" />
      </div>
      <div class="form-row">
        <label>{{ $t('form.event.time') }} </label>
        <input v-model="form.start_time" type="time" />
      </div>
    </div>

    <hr class="form-divider" />

    <div class="form-row">
      <label>{{ $t('form.event.website') }}</label>
      <input v-model="form.url" type="url" placeholder="https://..." />
    </div>
    <div class="form-row">
      <label>{{ $t('form.event.notes') }}</label>
      <textarea v-model="form.note" placeholder="Ticket number, what to bring, etc." />
    </div>
  </div>
</template>
