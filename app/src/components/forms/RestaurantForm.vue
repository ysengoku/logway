<script setup lang="ts">
import { reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import type { EventOfType, RestaurantEventInput } from '@/shared/types/event';

const props = defineProps<{
  initial?: EventOfType<'restaurant'>;
  defaultDate?: string;
}>();

const emit = defineEmits<{
  submit: [data: RestaurantEventInput];
}>();

const { t } = useI18n();
const form = reactive({
  name: props.initial?.name ?? '',
  address: props.initial?.address ?? '',
  start_date: props.initial?.start_date ?? props.defaultDate ?? '',
  start_time: props.initial?.start_time ?? '',
  url: props.initial?.url ?? '',
  note: props.initial?.note ?? '',
});

function submit() {
  if (!form.name || !form.start_date || !form.start_time) {
    alert(t('form.event.errors.restaurantRequired'));
    return;
  }

  emit('submit', {
    type: 'restaurant',
    name: form.name,
    address: form.address || null,
    start_date: form.start_date,
    start_time: form.start_time,
    end_date: form.start_date,
    url: form.url || null,
    note: form.note || null,
  });
}

defineExpose({ submit });
</script>

<template>
  <div class="restaurant-form">
    <div class="form-row">
      <label>{{ $t('form.event.name') }} *</label>
      <input v-model="form.name" type="text" placeholder="e.g. Le Grand Véfour" />
    </div>
    <div class="form-row">
      <label>{{ $t('form.event.address') }}</label>
      <input v-model="form.address" type="text" placeholder="e.g. 17 Rue de Beaujolais, Paris" />
    </div>

    <hr class="form-divider" />

    <div class="form-row-2">
      <div class="form-row">
        <label>{{ $t('form.event.date') }} *</label>
        <input v-model="form.start_date" type="date" />
      </div>
      <div class="form-row">
        <label>{{ $t('form.event.time') }} *</label>
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
      <textarea v-model="form.note" placeholder="Allergies, dress code, etc." />
    </div>
  </div>
</template>
