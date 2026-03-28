<script setup lang="ts">
import { reactive } from 'vue';
import type { EventRow } from '@shared/types/event';
import { TIMEZONES, toUTC } from '@/utils/time';

const props = defineProps<{
  initial?: Partial<EventRow>;
}>();

const emit = defineEmits<{
  submit: [data: Partial<EventRow>];
}>();

const form = reactive({
  flight_number: props.initial?.flight_number ?? '',
  booking_ref:   props.initial?.booking_ref ?? '',
  dep_place:     props.initial?.dep_place ?? '',
  dep_tz_id:     props.initial?.dep_tz_id ?? 'Asia/Tokyo',
  dep_local_date: props.initial?.dep_local_date ?? '',
  dep_local_time: props.initial?.dep_local_time ?? '',
  arr_place:     props.initial?.arr_place ?? '',
  arr_tz_id:     props.initial?.arr_tz_id ?? 'Asia/Tokyo',
  arr_local_date: props.initial?.arr_local_date ?? '',
  arr_local_time: props.initial?.arr_local_time ?? '',
  note:          props.initial?.note ?? '',
});

function submit() {
  if (!form.flight_number || !form.dep_local_date || !form.dep_local_time || !form.arr_local_date || !form.arr_local_time) {
    alert('Flight number, departure date/time and arrival date/time are required.');
    return;
  }

  emit('submit', {
    type: 'flight',
    flight_number:  form.flight_number,
    booking_ref:    form.booking_ref || undefined,
    dep_place:      form.dep_place || undefined,
    dep_tz_id:      form.dep_tz_id,
    dep_local_date: form.dep_local_date,
    dep_local_time: form.dep_local_time,
    dep_utc:        toUTC(form.dep_local_date, form.dep_local_time, form.dep_tz_id) ?? undefined,
    arr_place:      form.arr_place || undefined,
    arr_tz_id:      form.arr_tz_id,
    arr_local_date: form.arr_local_date,
    arr_local_time: form.arr_local_time,
    arr_utc:        toUTC(form.arr_local_date, form.arr_local_time, form.arr_tz_id) ?? undefined,
    note:           form.note || undefined,
  });
}

defineExpose({ submit });
</script>

<template>
  <div class="flight-form">
    <div class="form-row-2">
      <div class="form-row">
        <label>{{ $t('form.event.flight.number') }} *</label>
        <input v-model="form.flight_number" type="text" placeholder="e.g. JL045" />
      </div>
      <div class="form-row">
        <label>{{ $t('form.event.reference') }}</label>
        <input v-model="form.booking_ref" type="text" placeholder="e.g. ABC123" />
      </div>
    </div>

    <hr class="form-divider" />
    <div class="form-sub">{{ $t('form.event.departure') }}</div>

    <div class="form-row">
      <label>{{ $t('form.event.from') }} *</label>
      <input v-model="form.dep_place" type="text" placeholder="e.g. Tokyo (HND)" />
    </div>
    <div class="form-row-2">
      <div class="form-row">
        <label>{{ $t('form.event.date') }} *</label>
        <input v-model="form.dep_local_date" type="date" />
      </div>
      <div class="form-row">
        <label>{{ $t('form.event.departureTime') }} *</label>
        <input v-model="form.dep_local_time" type="time" />
      </div>
    </div>
    <div class="form-row">
      <label>{{ $t('form.event.timeZone') }} *</label>
      <select v-model="form.dep_tz_id">
        <option v-for="tz in TIMEZONES" :key="tz.id" :value="tz.id">{{ tz.label }}</option>
      </select>
    </div>

    <hr class="form-divider" />
    <div class="form-sub">{{ $t('form.event.arrival') }}</div>

    <div class="form-row">
      <label>{{ $t('form.event.to') }}</label>
      <input v-model="form.arr_place" type="text" placeholder="e.g. Paris (CDG)" />
    </div>
    <div class="form-row-2">
      <div class="form-row">
        <label>{{ $t('form.event.date') }} *</label>
        <input v-model="form.arr_local_date" type="date" />
      </div>
      <div class="form-row">
        <label>{{ $t('form.event.arrivalTime') }} *</label>
        <input v-model="form.arr_local_time" type="time" />
      </div>
    </div>
    <div class="form-row">
      <label>{{ $t('form.event.timeZone') }} *</label>
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
      <textarea v-model="form.note" placeholder="Seat number, baggage claim, etc." />
    </div>
  </div>
</template>
