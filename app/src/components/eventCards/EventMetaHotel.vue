<script setup lang="ts">
import { formatTime } from '@/utils/time';
import type { EventOfType } from '@/shared/types/event';

defineProps<{
  event: EventOfType<'hotel'>;
  date: string;
}>();
</script>

<template>
  <div v-if="event.end_date === date">
    {{ $t('event.checkOut') }} {{ formatTime(event.check_out_time) }}
  </div>
  <div v-else>
    <div v-if="event.start_date === date">
      {{ $t('event.checkIn') }} {{ formatTime(event.start_time) }}
    </div>
    <span>
      ({{ $t('event.checkOut') }} {{ event.end_date }} {{ formatTime(event.check_out_time) }})
    </span>
  </div>
</template>
