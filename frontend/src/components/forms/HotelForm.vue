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
  name:             props.initial?.name ?? '',
  booking_ref:      props.initial?.booking_ref ?? '',
  address:          props.initial?.address ?? '',
  check_in_date:    props.initial?.check_in_date ?? props.defaultDate ?? '',
  check_in_time:    props.initial?.check_in_time ?? '',
  check_out_date:   props.initial?.check_out_date ?? '',
  check_out_time:   props.initial?.check_out_time ?? '',
  url:              props.initial?.url ?? '',
  note:             props.initial?.note ?? '',
});

function submit() {
  if (!form.name || !form.check_in_date) {
    alert('Property name and check-in date are required.');
    return;
  }

  emit('submit', {
    type:             'hotel',
    name:             form.name,
    booking_ref:      form.booking_ref || undefined,
    address:          form.address || undefined,
    check_in_date:    form.check_in_date,
    check_in_time:    form.check_in_time || undefined,
    check_out_date:   form.check_out_date || undefined,
    check_out_time:   form.check_out_time || undefined,
    url:              form.url || undefined,
    note:             form.note || undefined,
  });
}

defineExpose({ submit });
</script>

<template>
  <div class="hotel-form">
    <div class="form-row">
      <label>Property Name *</label>
      <input v-model="form.name" type="text" placeholder="e.g. Hôtel Lutetia" />
    </div>
    <div class="form-row">
      <label>Booking Ref.</label>
      <input v-model="form.booking_ref" type="text" placeholder="e.g. RES-789456" />
    </div>
    <div class="form-row">
      <label>Address</label>
      <input v-model="form.address" type="text" placeholder="e.g. 45 Blvd Raspail, Paris" />
    </div>

    <hr class="form-divider" />

    <div class="form-row-2">
      <div class="form-row">
        <label>Check-in Date *</label>
        <input v-model="form.check_in_date" type="date" />
      </div>
      <div class="form-row">
        <label>Check-in Time</label>
        <input v-model="form.check_in_time" type="time" />
      </div>
    </div>
    <div class="form-row-2">
      <div class="form-row">
        <label>Check-out Date</label>
        <input v-model="form.check_out_date" type="date" />
      </div>
      <div class="form-row">
        <label>Check-out Time</label>
        <input v-model="form.check_out_time" type="time" />
      </div>
    </div>

    <hr class="form-divider" />

    <div class="form-row">
      <label>Website / Booking Page</label>
      <input v-model="form.url" type="url" placeholder="https://..." />
    </div>
    <div class="form-row">
      <label>Notes</label>
      <textarea v-model="form.note" placeholder="Breakfast included, room number, etc." />
    </div>
  </div>
</template>
