<script setup lang="ts">
import { reactive, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { Trip } from '@shared/types/trip';
import type { TripInput } from '@shared/types/trip';

const props = withDefaults(defineProps<{
  initial?: Partial<Trip>;
  submitLabel?: string;
}>(), {
  submitLabel: 'Create trip',
});

const emit = defineEmits<{
  submit: [data: TripInput];
  cancel: [];
}>();

const { t } = useI18n();
const form = reactive({
  title: props.initial?.title ?? '',
  start_date: props.initial?.start_date ?? '',
  end_date: props.initial?.end_date ?? '',
});

// Minimum end date is the day after start date
const minEndDate = computed(() => {
  if (!form.start_date) return '';
  const d = new Date(form.start_date);
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
});

// Reset end date if it's before or equal to the new start date
function onStartDateChange() {
  if (form.end_date && form.end_date <= form.start_date) {
    form.end_date = '';
  }
}

function submit() {
  if (!form.title) {
    alert(t('tripForm.tripNameRequired'));
    return;
  }
  emit('submit', {
    title: form.title,
    start_date: form.start_date || undefined,
    end_date: form.end_date || undefined,
  });
}
</script>

<template>
  <div class="new-trip-form">
    <div class="form-row">
      <label>{{ $t('tripForm.tripName') }}</label>
      <input v-model="form.title" type="text" :placeholder="$t('tripForm.tripNamePlaceholder')" />
    </div>
    <div class="form-row-2">
      <div class="form-row">
        <label>{{ $t('tripForm.startDate') }}</label>
        <input
          v-model="form.start_date"
          type="date"
          @change="onStartDateChange"
        />
      </div>
      <div class="form-row">
        <label>{{ $t('tripForm.endDate') }}</label>
        <input
          v-model="form.end_date"
          type="date"
          :min="minEndDate"
          :disabled="!form.start_date"
        />
      </div>
    </div>
    <div class="new-trip-form__actions">
      <button class="button-secondary" @click="emit('cancel')">{{ $t('common.cancel') }}</button>
      <button class="button-primary" @click="submit">{{ submitLabel }}</button>
    </div>
  </div>
</template>