<script setup lang="ts">
import { computed } from 'vue';
import { EVENT_TYPE, EVENT_TYPE_OPTIONS } from '@/constants/events';
import EventMetaAddress from '@/components/eventCards/EventMetaAddress.vue';
import EventMetaHotel from '@/components/eventCards/EventMetaHotel.vue';
import EventMetaTransport from '@/components/eventCards/EventMetaTransport.vue';
import type { EventRow } from '@shared/types/event';

const props = defineProps<{
  event: EventRow;
  date: string;
  mode: 'timeline' | 'type';
}>();

const emit = defineEmits<{
  edit: [event: EventRow];
  delete: [id: string];
}>();

const eventIcon = computed(() => {
  return EVENT_TYPE_OPTIONS.find((eventType) => eventType.type === props.event.type)?.icon ?? '';
});

function getEventTitle(event: EventRow): string {
  switch (event.type) {
    case EVENT_TYPE.FLIGHT:
      return event.flight_number ?? 'Flight';
    case EVENT_TYPE.TRANSPORT:
      return event.service_number ?? event.transport_mode ?? 'Transport';
    case EVENT_TYPE.HOTEL:
      return event.name ?? 'Hotel';
    case EVENT_TYPE.RESTAURANT:
      return event.name ?? 'Restaurant';
    case EVENT_TYPE.ACTIVITY:
      return event.name ?? 'Activity';
    case EVENT_TYPE.LINK:
      return event.link_title ?? 'Link';
    default:
      return '';
  }
}

function getEventTime(event: EventRow): string | null {
  switch (event.type) {
    case EVENT_TYPE.FLIGHT:
    case EVENT_TYPE.TRANSPORT:
      return event.dep_local_time?.slice(0, 5) ?? null;
    case EVENT_TYPE.HOTEL:
      if (event.check_in_date === props.date) {
        return event.check_in_time?.slice(0, 5) ?? null;
      }
      if (event.check_out_date === props.date) {
        return event.check_out_time?.slice(0, 5) ?? null;
      }
      return null;
    case EVENT_TYPE.RESTAURANT:
      return event.reservation_time?.slice(0, 5) ?? null;
    case EVENT_TYPE.ACTIVITY:
      return event.schedule_time?.slice(0, 5) ?? null;
    default:
      return null;
  }
}
</script>

<template>
  <div
    class="day-detail__card"
    :class="`day-detail__card--${event.type}`"
  >
    <div class="day-detail__card-time">
      {{ getEventTime(event) ?? '—' }}
    </div>
    <div class="day-detail__card-content">
      <div class="day-detail__card-title">
        <span v-if="mode === 'timeline'" class="day-detail__card-icon material-icons">
          {{ eventIcon }}
        </span>
        {{ getEventTitle(event) }}
      </div>
      <div class="day-detail__card-meta">
        <EventMetaTransport v-if="event.type === EVENT_TYPE.FLIGHT || event.type === EVENT_TYPE.TRANSPORT" 
          :event="event"
        />
        <EventMetaHotel v-else-if="event.type === EVENT_TYPE.HOTEL" 
          :event="event"
          :date="date"
        />
        <EventMetaAddress v-else-if="event.type === EVENT_TYPE.RESTAURANT || event.type === EVENT_TYPE.ACTIVITY"
          :event="event"
        />
        <div v-if="event.link_url || event.url" class="day-detail__card-meta-link">
          <a v-if="event.link_url" :href="event.link_url" target="_blank" rel="noopener">
            {{ event.link_url }}
          </a>
          <a v-else-if="event.url" :href="event.url" target="_blank" rel="noopener">
            {{ event.url }}
          </a>
          <span class="material-icons">
            open_in_new
          </span>
        </div>
        <div v-if="event.booking_ref" class="day-detail__tag">
          Ref: {{ event.booking_ref }}
        </div>
        <p v-if="event.note" class="day-detail__note">
          {{ event.note }}
        </p>
      </div>
    </div>
    <div class="day-detail__card-actions">
      <button @click="emit('edit', event)">
        <span class="material-icons">
          edit
        </span>
      </button>
      <button @click="emit('delete', event.id)">
        <span class="material-icons">
          delete
        </span>
      </button>
    </div>
  </div>
</template>