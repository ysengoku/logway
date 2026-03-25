<script setup lang="ts">
import { formatTime } from '@/utils/time';
import type { EventRow } from '@shared/types/event';

const props = defineProps<{
  event: EventRow;
  date: string;
}>();

function isCheckInDate(event: EventRow): boolean {
  return event.check_in_date === props.date;
}

function isCheckOutDate(event: EventRow): boolean {
  return event.check_out_date === props.date;
}
</script>

<template>
  <div v-if="isCheckOutDate(event)">
    CHECK OUT {{ formatTime(event.check_out_time) }}
  </div>
  <div v-else>
    <div v-if="isCheckInDate(event)">
      CHECK IN {{ formatTime(event.check_in_time) }}
    </div>
    <span v-if="event.check_out_date">
      (CHECK OUT {{ event.check_out_date }} {{ formatTime(event.check_out_time) }})
    </span>
  </div>
  <!-- <div v-if="event.address" class="day-detail__card-meta-address">
    <AppIcon name="location" :size="16" />
    {{ event.address }}
  </div> -->
</template>
