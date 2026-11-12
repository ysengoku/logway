<script setup lang="ts">
import EventMetaHotel from '@/components/eventCards/EventMetaHotel.vue';
import EventMetaTransport from '@/components/eventCards/EventMetaTransport.vue';
import { EVENT_TYPE, EVENT_TYPE_OPTIONS, TRANSPORT_MODES } from '@/constants/events';
import type { TripEvent } from '@/shared/types/event';
import { getFaIcon } from '@/lib/faIcons';
import { eventTimeOn, formatTime } from '@/utils/time';
import { computed } from 'vue';
import { faLink, faLocationDot } from '@fortawesome/free-solid-svg-icons';

const props = defineProps<{
  event: TripEvent;
  date: string;
  mode: 'timeline' | 'type';
}>();

const emit = defineEmits<{
  edit: [event: TripEvent];
  delete: [id: string];
}>();

const eventIcon = computed(() => {
  const event = props.event;
  if (event.type === EVENT_TYPE.TRANSPORT) {
    const transportMode = TRANSPORT_MODES.find((m) => m.value === event.mode);
    return getFaIcon(transportMode?.icon ?? '');
  }
  const option = EVENT_TYPE_OPTIONS.find((eventType) => eventType.type === event.type);
  return getFaIcon(option?.icon ?? '');
});

function getEventTitle(event: TripEvent): string {
  switch (event.type) {
    case EVENT_TYPE.FLIGHT:
      return event.service_number;
    case EVENT_TYPE.TRANSPORT:
      return event.service_number ?? event.mode;
    case EVENT_TYPE.LINK:
      return event.title;
    default:
      return event.name;
  }
}

function getEventTime(event: TripEvent): string | null {
  const isTransport = event.type === EVENT_TYPE.FLIGHT || event.type === EVENT_TYPE.TRANSPORT;
  // On the arrival day, the card shows the arrival time instead.
  if (isTransport && event.start_date !== props.date) {
    return null;
  }
  return formatTime(eventTimeOn(event, props.date));
}

// Not every event type has these fields.
const address = computed(() => ('address' in props.event ? props.event.address : null));
const url = computed(() => ('url' in props.event ? props.event.url : null));
const bookingRef = computed(() => ('booking_ref' in props.event ? props.event.booking_ref : null));
</script>

<template>
  <div class="day-detail__card" :class="`day-detail__card--${event.type}`">
    <div class="day-detail__card-time">
      {{ getEventTime(event) ?? '—' }}
    </div>
    <div class="day-detail__card-content">
      <div class="day-detail__card-title">
        <FaIcon v-if="mode === 'timeline'" :icon="eventIcon" class="day-detail__card-icon" />
        {{ getEventTitle(event) }}
      </div>
      <div class="day-detail__card-meta">
        <EventMetaTransport
          v-if="event.type === EVENT_TYPE.FLIGHT || event.type === EVENT_TYPE.TRANSPORT"
          :event="event"
          :date="date"
        />
        <EventMetaHotel v-else-if="event.type === EVENT_TYPE.HOTEL" :event="event" :date="date" />
        <div v-if="address" class="day-detail__card-meta-address">
          <FaIcon :icon="faLocationDot" />
          {{ address }}
        </div>
        <div v-if="url" class="day-detail__card-meta-link">
          <a :href="url" target="_blank" rel="noopener">
            <span>{{ url }}</span>
            <FaIcon :icon="faLink" />
          </a>
        </div>
        <div v-if="bookingRef" class="day-detail__tag">
          {{ $t('event.ref', { ref: bookingRef }) }}
        </div>
        <p v-if="event.note" class="day-detail__note">
          {{ event.note }}
        </p>
      </div>
    </div>
    <div class="day-detail__card-actions">
      <button @click="emit('edit', event)">
        <FaIcon icon="fa-solid fa-pen" />
      </button>
      <button @click="emit('delete', event.id)">
        <FaIcon icon="fa-solid fa-trash" />
      </button>
    </div>
  </div>
</template>
