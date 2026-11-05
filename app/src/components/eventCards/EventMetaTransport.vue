<script setup lang="ts">
import type { EventOfType } from '@/shared/types/event';

defineProps<{
  event: EventOfType<'flight'> | EventOfType<'transport'>;
  date: string;
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
    <div
      v-if="event.start_date !== date && event.arr_date === date"
      class="day-detail__card-meta-transport-time"
    >
      {{ $t('form.event.arrival') }} {{ formatTime(event.arr_time) }}
    </div>
    <div v-else class="day-detail__card-meta-transport-time">
      {{ $t('form.event.arrival') }}: {{ event.arr_date }}
      {{ formatTime(event.arr_time) }}
    </div>
  </div>
</template>
