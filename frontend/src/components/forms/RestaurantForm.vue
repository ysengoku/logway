<script setup lang="ts">
import { reactive } from 'vue';
import type { EventRow } from '@shared/types/event';

const props = defineProps<{
  initial?: Partial<EventRow>;
  defaultDate?: string;
}>();

const emit = defineEmits<{
  submit: [data: Partial<EventRow>];
}>();

const form = reactive({
  name:            props.initial?.name ?? '',
  address:         props.initial?.address ?? '',
  reservation_date: props.initial?.reservation_date ?? props.defaultDate ?? '',
  reservation_time: props.initial?.reservation_time ?? '',
  url:             props.initial?.url ?? '',
  note:            props.initial?.note ?? '',
});

function submit() {
  if (!form.name || !form.reservation_date || !form.reservation_time) {
    alert('Restaurant name, reservation date and time are required.');
    return;
  }

  emit('submit', {
    type:             'restaurant',
    name:             form.name,
    address:          form.address || undefined,
    reservation_date: form.reservation_date,
    reservation_time: form.reservation_time,
    url:              form.url || undefined,
    note:             form.note || undefined,
  });
}

defineExpose({ submit });
</script>

<template>
  <div class="restaurant-form">
    <div class="form-row">
      <label>Restaurant Name *</label>
      <input v-model="form.name" type="text" placeholder="e.g. Le Grand Véfour" />
    </div>
    <div class="form-row">
      <label>Address</label>
      <input v-model="form.address" type="text" placeholder="e.g. 17 Rue de Beaujolais, Paris" />
    </div>

    <hr class="form-divider" />

    <div class="form-row-2">
      <div class="form-row">
        <label>Reservation Date *</label>
        <input v-model="form.reservation_date" type="date" />
      </div>
      <div class="form-row">
        <label>Reservation Time *</label>
        <input v-model="form.reservation_time" type="time" />
      </div>
    </div>

    <hr class="form-divider" />

    <div class="form-row">
      <label>Website / Reservation Page</label>
      <input v-model="form.url" type="url" placeholder="https://..." />
    </div>
    <div class="form-row">
      <label>Notes</label>
      <textarea v-model="form.note" placeholder="Allergies, dress code, etc." />
    </div>
  </div>
</template>
