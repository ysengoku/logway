<script setup lang="ts">
import type { EventRow } from '@shared/types/event';

defineProps<{
  event: EventRow;
}>();
</script>

<template>
  <div v-if="event.address" class="day-detail__card-meta-address">
    <span class="material-icons">
      location_on
    </span>
    {{ event.address }}
  </div>
</template>
