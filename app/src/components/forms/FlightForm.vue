<script setup lang="ts">
import { reactive } from 'vue';
import type { EventOfType, FlightEventInput } from '@/shared/types/event';
import { TIMEZONES } from '@/utils/time';

const props = defineProps<{
  initial?: EventOfType<'flight'>;
}>();

const emit = defineEmits<{
  submit: [data: FlightEventInput];
}>();

const form = reactive({
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
    !form.service_number ||
    !form.dep_place ||
    !form.start_date ||
    !form.start_time ||
    !form.arr_place ||
    !form.arr_date ||
    !form.arr_time
  ) {
    alert('Flight number, departure and arrival place, date and time are required.');
    return;
  }

  emit('submit', {
    type: 'flight',
    mode: 'flight',
    service_number: form.service_number,
    booking_ref: form.booking_ref || null,
    start_date: form.start_date,
    start_time: form.start_time,
    end_date: form.start_date,
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
  <div class="flight-form">
    <div class="form-row-2">
      <div class="form-row">
        <label>{{ $t('form.event.flight.number') }} *</label>
        <input v-model="form.service_number" type="text" placeholder="e.g. JL045" />
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
        <input v-model="form.start_date" type="date" />
      </div>
      <div class="form-row">
        <label>{{ $t('form.event.departureTime') }} *</label>
        <input v-model="form.start_time" type="time" />
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
      <label>{{ $t('form.event.to') }} *</label>
      <input v-model="form.arr_place" type="text" placeholder="e.g. Paris (CDG)" />
    </div>
    <div class="form-row-2">
      <div class="form-row">
        <label>{{ $t('form.event.date') }} *</label>
        <input v-model="form.arr_date" type="date" />
      </div>
      <div class="form-row">
        <label>{{ $t('form.event.arrivalTime') }} *</label>
        <input v-model="form.arr_time" type="time" />
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
