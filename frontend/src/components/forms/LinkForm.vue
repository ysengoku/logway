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
  link_title:   props.initial?.link_title ?? '',
  link_url:     props.initial?.link_url ?? '',
  related_date: props.initial?.related_date ?? props.defaultDate ?? '',
  note:         props.initial?.note ?? '',
});

function submit() {
  if (!form.link_title || !form.link_url) {
    alert('Title and URL are required.');
    return;
  }

  emit('submit', {
    type:         'link',
    link_title:   form.link_title,
    link_url:     form.link_url,
    related_date: form.related_date || undefined,
    note:         form.note || undefined,
  });
}

defineExpose({ submit });
</script>

<template>
  <div class="link-form">
    <div class="form-row">
      <label>Title *</label>
      <input v-model="form.link_title" type="text" placeholder="e.g. Local transport info" />
    </div>
    <div class="form-row">
      <label>URL *</label>
      <input v-model="form.link_url" type="url" placeholder="https://..." />
    </div>
    <div class="form-row">
      <label>Related Date (optional)</label>
      <input v-model="form.related_date" type="date" />
    </div>
    <div class="form-row">
      <label>Notes</label>
      <textarea v-model="form.note" placeholder="Description, context, etc." />
    </div>
  </div>
</template>
