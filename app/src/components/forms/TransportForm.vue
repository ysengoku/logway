<script setup lang="ts">
import { TIMEZONES, toUTC } from '@/utils/time';
import { TRANSPORT_MODES } from '@/constants/events';
import type { EventRow, TransportMode } from '@/shared/types/event';
import { reactive } from 'vue';

const props = defineProps<{
  initial?: Partial<EventRow>;
}>();

const emit = defineEmits<{
  submit: [data: Partial<EventRow>];
}>();

const form = reactive({
  transport_mode: (props.initial?.transport_mode ?? 'train') as TransportMode,
  service_number: props.initial?.service_number ?? '',
  booking_ref: props.initial?.booking_ref ?? '',
  dep_place: props.initial?.dep_place ?? '',
  dep_tz_id: props.initial?.dep_tz_id ?? 'Asia/Tokyo',
  dep_local_date: props.initial?.dep_local_date ?? '',
  dep_local_time: props.initial?.dep_local_time ?? '',
  arr_place: props.initial?.arr_place ?? '',
  arr_tz_id: props.initial?.arr_tz_id ?? 'Asia/Tokyo',
  arr_local_date: props.initial?.arr_local_date ?? '',
  arr_local_time: props.initial?.arr_local_time ?? '',
  note: props.initial?.note ?? '',
});

function submit() {
  if (!form.dep_local_date) {
    alert('Departure date is required.');
    return;
  }

  emit('submit', {
    type: 'transport',
    transport_mode: form.transport_mode,
    service_number: form.service_number || undefined,
    booking_ref: form.booking_ref || undefined,
    dep_place: form.dep_place || undefined,
    dep_tz_id: form.dep_tz_id,
    dep_local_date: form.dep_local_date,
    dep_local_time: form.dep_local_time || undefined,
    dep_utc: toUTC(form.dep_local_date, form.dep_local_time, form.dep_tz_id) ?? undefined,
    arr_place: form.arr_place || undefined,
    arr_tz_id: form.arr_tz_id,
    arr_local_date: form.arr_local_date || undefined,
    arr_local_time: form.arr_local_time || undefined,
    arr_utc: toUTC(form.arr_local_date, form.arr_local_time, form.arr_tz_id) ?? undefined,
    note: form.note || undefined,
  });
}

defineExpose({ submit });
</script>

<template>
  <div class="transport-form">
    <div class="form-row-2">
      <div class="form-row">
        <label>Mode</label>
        <select v-model="form.transport_mode">
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
        <input v-model="form.dep_local_date" type="date" />
      </div>
      <div class="form-row">
        <label>{{ $t('form.event.departureTime') }}</label>
        <input v-model="form.dep_local_time" type="time" />
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
        <input v-model="form.arr_local_date" type="date" />
      </div>
      <div class="form-row">
        <label>{{ $t('form.event.arrivalTime') }}</label>
        <input v-model="form.arr_local_time" type="time" />
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
