<script setup lang="ts">
import { TIMEZONES, previousDay } from '@/utils/time';
import { TRANSPORT_MODES } from '@/constants/events';
import type { EventOfType, TransportEventInput, TransportMode } from '@/shared/types/event';
import { computed, reactive } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps<{
  initial?: EventOfType<'transport'>;
  minDate?: string;
  maxDate?: string;
}>();

const emit = defineEmits<{
  submit: [data: TransportEventInput];
}>();

const { t } = useI18n();
// Crossing the date line eastward can land the day before departure.
const minArrivalDate = computed(() => (props.minDate ? previousDay(props.minDate) : undefined));
const form = reactive({
  mode: (props.initial?.mode ?? 'train') as TransportMode,
  service_number: props.initial?.service_number ?? '',
  booking_ref: props.initial?.booking_ref ?? '',
  start_date: props.initial?.start_date ?? '',
  start_time: props.initial?.start_time ?? '',
  dep_place: props.initial?.dep_place ?? '',
  dep_tz_id: props.initial?.dep_tz_id ?? 'Asia/Tokyo',
  arr_date: props.initial?.arr_date ?? '',
  arr_time: props.initial?.arr_time ?? '',
  arr_place: props.initial?.arr_place ?? '',
  arr_tz_id: props.initial?.arr_tz_id ?? 'Asia/Tokyo',
  note: props.initial?.note ?? '',
});

function submit() {
  if (
    !form.dep_place ||
    !form.start_date ||
    !form.start_time ||
    !form.arr_place ||
    !form.arr_date ||
    !form.arr_time
  ) {
    alert(t('form.event.errors.transportRequired'));
    return;
  }

  emit('submit', {
    type: 'transport',
    mode: form.mode,
    service_number: form.service_number || null,
    booking_ref: form.booking_ref || null,
    start_date: form.start_date,
    start_time: form.start_time,
    // Local arrival can be the day before departure when crossing the date line.
    end_date: form.arr_date > form.start_date ? form.arr_date : form.start_date,
    dep_place: form.dep_place,
    dep_tz_id: form.dep_tz_id,
    arr_date: form.arr_date,
    arr_time: form.arr_time,
    arr_place: form.arr_place,
    arr_tz_id: form.arr_tz_id,
    note: form.note || null,
  });
}

defineExpose({ submit });
</script>

<template>
  <div class="transport-form">
    <div class="form-row-2">
      <div class="form-row">
        <label>Mode</label>
        <select v-model="form.mode">
          <option v-for="m in TRANSPORT_MODES" :key="m.value" :value="m.value">
            {{ m.label }}
          </option>
        </select>
      </div>
      <div class="form-row">
        <label>{{ $t('form.event.transport.line') }}</label>
        <input v-model="form.service_number" type="text" placeholder="e.g. Eurostar 9084" />
      </div>
    </div>

    <div class="form-row">
      <label>{{ $t('form.event.reference') }}</label>
      <input v-model="form.booking_ref" type="text" placeholder="Optional" />
    </div>

    <hr class="form-divider" />
    <div class="form-sub">{{ $t('form.event.departure') }}</div>

    <div class="form-row">
      <label>{{ $t('form.event.from') }} *</label>
      <input v-model="form.dep_place" type="text" placeholder="e.g. London St Pancras" />
    </div>
    <div class="form-row-2">
      <div class="form-row">
        <label>{{ $t('form.event.date') }} *</label>
        <input v-model="form.start_date" type="date" :min="minDate" :max="maxDate" />
      </div>
      <div class="form-row">
        <label>{{ $t('form.event.departureTime') }} *</label>
        <input v-model="form.start_time" type="time" />
      </div>
    </div>
    <div class="form-row">
      <label>{{ $t('form.event.timeZone') }}</label>
      <select v-model="form.dep_tz_id">
        <option v-for="tz in TIMEZONES" :key="tz.id" :value="tz.id">{{ tz.label }}</option>
      </select>
    </div>

    <hr class="form-divider" />
    <div class="form-sub">{{ $t('form.event.arrival') }}</div>

    <div class="form-row">
      <label>{{ $t('form.event.to') }} *</label>
      <input v-model="form.arr_place" type="text" placeholder="e.g. Paris Gare du Nord" />
    </div>
    <div class="form-row-2">
      <div class="form-row">
        <label>{{ $t('form.event.date') }} *</label>
        <input v-model="form.arr_date" type="date" :min="minArrivalDate" :max="maxDate" />
      </div>
      <div class="form-row">
        <label>{{ $t('form.event.arrivalTime') }} *</label>
        <input v-model="form.arr_time" type="time" />
      </div>
    </div>
    <div class="form-row">
      <label>{{ $t('form.event.timeZone') }}</label>
      <select v-model="form.arr_tz_id">
        <option v-for="tz in TIMEZONES" :key="tz.id" :value="tz.id">{{ tz.label }}</option>
      </select>
    </div>

    <p class="form-hint">
      {{ $t('form.event.timezoneHint') }}
    </p>

    <hr class="form-divider" />
    <div class="form-row">
      <label>{{ $t('form.event.notes') }}</label>
      <textarea v-model="form.note" placeholder="Platform, gate, instructions, etc." />
    </div>
  </div>
</template>
