<script setup lang="ts">
import { reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import type { EventOfType, LinkEventInput } from '@/shared/types/event';

const props = defineProps<{
  initial?: EventOfType<'link'>;
  defaultDate?: string;
  minDate?: string;
  maxDate?: string;
}>();

const emit = defineEmits<{
  submit: [data: LinkEventInput];
}>();

const { t } = useI18n();
const form = reactive({
  title: props.initial?.title ?? '',
  url: props.initial?.url ?? '',
  start_date: props.initial?.start_date ?? props.defaultDate ?? '',
  note: props.initial?.note ?? '',
});

function submit() {
  if (!form.title || !form.url || !form.start_date) {
    alert(t('form.event.errors.linkRequired'));
    return;
  }

  emit('submit', {
    type: 'link',
    title: form.title,
    url: form.url,
    start_date: form.start_date,
    start_time: null,
    end_date: form.start_date,
    note: form.note || null,
  });
}

defineExpose({ submit });
</script>

<template>
  <div class="link-form">
    <div class="form-row">
      <label>{{ $t('form.title') }} *</label>
      <input v-model="form.title" type="text" placeholder="e.g. Local transport info" />
    </div>
    <div class="form-row">
      <label>{{ $t('form.event.link.url') }} *</label>
      <input v-model="form.url" type="url" placeholder="https://..." />
    </div>
    <div class="form-row">
      <label>{{ $t('form.event.link.relatedDate') }} *</label>
      <input v-model="form.start_date" type="date" :min="minDate" :max="maxDate" />
    </div>
    <div class="form-row">
      <label>{{ $t('form.event.notes') }}</label>
      <textarea v-model="form.note" placeholder="Description, context, etc." />
    </div>
  </div>
</template>
