<script setup lang="ts">
import { reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import type { EventOfType, HotelEventInput } from '@/shared/types/event';

const props = defineProps<{
  initial?: EventOfType<'hotel'>;
  defaultDate?: string;
}>();

const emit = defineEmits<{
  submit: [data: HotelEventInput];
}>();

const { t } = useI18n();
const form = reactive({
  name: props.initial?.name ?? '',
  booking_ref: props.initial?.booking_ref ?? '',
  address: props.initial?.address ?? '',
  start_date: props.initial?.start_date ?? props.defaultDate ?? '',
  start_time: props.initial?.start_time ?? '',
  end_date: props.initial?.end_date ?? '',
  check_out_time: props.initial?.check_out_time ?? '',
  url: props.initial?.url ?? '',
  note: props.initial?.note ?? '',
});

function submit() {
  if (!form.name || !form.start_date || !form.end_date) {
    alert(t('form.event.errors.hotelRequired'));
    return;
  }
  if (form.end_date <= form.start_date) {
    alert(t('form.event.errors.checkoutAfterCheckin'));
    return;
  }

  emit('submit', {
    type: 'hotel',
    name: form.name,
    booking_ref: form.booking_ref || null,
    address: form.address || null,
    start_date: form.start_date,
    start_time: form.start_time || null,
    end_date: form.end_date,
    check_out_time: form.check_out_time || null,
    url: form.url || null,
    note: form.note || null,
  });
}

defineExpose({ submit });
</script>

<template>
  <div class="hotel-form">
    <div class="form-row">
      <label>{{ $t('form.event.name') }} *</label>
      <input v-model="form.name" type="text" placeholder="e.g. Hôtel Lutetia" />
    </div>
    <div class="form-row">
      <label>{{ $t('form.event.reference') }}</label>
      <input v-model="form.booking_ref" type="text" placeholder="e.g. RES-789456" />
    </div>
    <div class="form-row">
      <label>{{ $t('form.event.address') }}</label>
      <input v-model="form.address" type="text" placeholder="e.g. 45 Blvd Raspail, Paris" />
    </div>

    <hr class="form-divider" />

    <div class="form-row-2">
      <div class="form-row">
        <label>{{ $t('form.event.hotel.checkinDate') }} *</label>
        <input v-model="form.start_date" type="date" />
      </div>
      <div class="form-row">
        <label>{{ $t('form.event.hotel.checkinTime') }}</label>
        <input v-model="form.start_time" type="time" />
      </div>
    </div>
    <div class="form-row-2">
      <div class="form-row">
        <label>{{ $t('form.event.hotel.checkoutDate') }} *</label>
        <input v-model="form.end_date" type="date" />
      </div>
      <div class="form-row">
        <label>{{ $t('form.event.hotel.checkoutTime') }}</label>
        <input v-model="form.check_out_time" type="time" />
      </div>
    </div>

    <hr class="form-divider" />

    <div class="form-row">
      <label>{{ $t('form.event.website') }}</label>
      <input v-model="form.url" type="url" placeholder="https://..." />
    </div>
    <div class="form-row">
      <label>{{ $t('form.event.notes') }}</label>
      <textarea v-model="form.note" placeholder="Breakfast included, room number, etc." />
    </div>
  </div>
</template>
