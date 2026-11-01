<script setup lang="ts">
import type { EventRow } from '@/shared/types/event';

defineProps<{
  event: EventRow;
}>();

function formatTime(time: string | null | undefined): string | null {
  if (!time) return null;
  return time.slice(0, 5);
}
</script>

<template>
  <div>
    <div class="day-detail__card-meta-transport-route">
      {{ event.dep_place }} → {{ event.arr_place }}
    </div>
    <div class="day-detail__card-meta-transport-time">
      {{ $t('form.event.arrival') }}: {{ event.arr_local_date }} {{ formatTime(event.arr_local_time) }}
    </div>
  </div>
</template>
