<script setup lang="ts">
import { reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import type { Trip } from '@/shared/types/trip';
import type { TripInput } from '@/shared/types/trip';

const props = withDefaults(
  defineProps<{
    initial?: Partial<Trip>;
    submitLabel?: string;
  }>(),
  {
    submitLabel: 'Create trip',
  },
);

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

// Reset end date if it's before the new start date (same-day trips are allowed)
function onStartDateChange() {
  if (form.end_date && form.end_date < form.start_date) {
    form.end_date = '';
  }
}

function submit() {
  if (!form.title) {
    alert(t('form.trip.nameRequired'));
    return;
  }
  if (!form.start_date || !form.end_date) {
    alert(t('form.trip.dateRequired'));
    return;
  }
  if (form.end_date < form.start_date) {
    alert(t('form.trip.dateOrder'));
    return;
  }
  emit('submit', {
    title: form.title,
    start_date: form.start_date,
    end_date: form.end_date,
  });
}
</script>

<template>
  <div class="new-trip-form">
    <div class="form-row">
      <label>{{ $t('form.title') }}</label>
      <input v-model="form.title" type="text" :placeholder="$t('form.trip.namePlaceholder')" />
    </div>
    <div class="form-row-2">
      <div class="form-row">
        <label>{{ $t('form.trip.startDate') }}</label>
        <input v-model="form.start_date" type="date" @change="onStartDateChange" />
      </div>
      <div class="form-row">
        <label>{{ $t('form.trip.endDate') }}</label>
        <input
          v-model="form.end_date"
          type="date"
          :min="form.start_date"
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
