<script setup lang="ts">
import { computed } from 'vue';
import { useEventsStore } from '@/stores/events';
import type { EventRow } from '@shared/types/event';

const props = defineProps<{
  date: string;
}>();

const emit = defineEmits<{
  addEvent: [date: string];
  editEvent: [event: EventRow];
}>();

const eventsStore = useEventsStore();

const events = computed(() => eventsStore.getByDate(props.date));

const formattedDate = computed(() => {
  const d = new Date(props.date + 'T00:00:00');
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
});

const EVENT_GROUPS = [
  { type: 'flight',     icon: '✈️',  label: 'Flights' },
  { type: 'transport',  icon: '🚆',  label: 'Transport' },
  { type: 'hotel',      icon: '🏨',  label: 'Hotel' },
  { type: 'restaurant', icon: '🍽',  label: 'Restaurants' },
  { type: 'activity',   icon: '🎯',  label: 'Activities' },
  { type: 'link',       icon: '🔗',  label: 'Links' },
] as const;

function getEventsByType(type: string) {
  return events.value.filter((e) => e.type === type);
}

async function deleteEvent(id: string) {
  if (!confirm('Delete this event?')) return;
  await eventsStore.deleteEvent(id);
}

function getEventTitle(event: EventRow): string {
  switch (event.type) {
    case 'flight':     return event.flight_number ?? '(no flight number)';
    case 'transport':  return event.service_number ?? event.transport_mode ?? 'Transport';
    case 'hotel':      return event.name ?? '(no name)';
    case 'restaurant': return event.name ?? '(no name)';
    case 'activity':   return event.name ?? '(no name)';
    case 'link':       return event.link_title ?? 'Link';
    default:           return '';
  }
}
</script>

<template>
  <div class="day-detail">
    <div class="day-detail__header">
      <h2 class="day-detail__date">{{ formattedDate }}</h2>
      <button class="day-detail__add-btn" @click="emit('addEvent', date)">
        + Add
      </button>
    </div>

    <div v-if="events.length === 0" class="day-detail__empty">
      No events on this day yet.
    </div>

    <template v-else>
      <div
        v-for="group in EVENT_GROUPS"
        :key="group.type"
      >
        <div
          v-if="getEventsByType(group.type).length"
          class="day-detail__group"
        >
          <div class="day-detail__group-label">{{ group.label }}</div>
          <div
            v-for="event in getEventsByType(group.type)"
            :key="event.id"
            class="day-detail__card"
            :class="`day-detail__card--${event.type}`"
          >
            <span class="day-detail__card-icon">{{ group.icon }}</span>
            <div class="day-detail__card-body">
              <div class="day-detail__card-title">{{ getEventTitle(event) }}</div>
              <div class="day-detail__card-meta">
                <template v-if="event.type === 'flight' || event.type === 'transport'">
                  <span>{{ event.dep_place }} → {{ event.arr_place }}</span><br />
                  <span>🛫 {{ event.dep_local_date }} {{ event.dep_local_time }}</span><br />
                  <span>🛬 {{ event.arr_local_date }} {{ event.arr_local_time }}</span>
                </template>
                <template v-else-if="event.type === 'hotel'">
                  <span>IN {{ event.check_in_date }} {{ event.check_in_time }} → OUT {{ event.check_out_date }}</span><br />
                  <span v-if="event.address">📍 {{ event.address }}</span>
                </template>
                <template v-else-if="event.type === 'restaurant'">
                  <span>🕐 {{ event.reservation_date }} {{ event.reservation_time }}</span><br />
                  <span v-if="event.address">📍 {{ event.address }}</span>
                </template>
                <template v-else-if="event.type === 'activity'">
                  <span>🕐 {{ event.schedule_date }} {{ event.schedule_time }}</span><br />
                  <span v-if="event.address">📍 {{ event.address }}</span>
                </template>
                <template v-else-if="event.type === 'link'">
                  <a v-if="event.link_url" :href="event.link_url" target="_blank" rel="noopener">
                    🔗 {{ event.link_url }}
                  </a>
                </template>
                <div v-if="event.booking_ref" class="day-detail__tag">
                  Booking: {{ event.booking_ref }}
                </div>
                <p v-if="event.note" class="day-detail__note">{{ event.note }}</p>
              </div>
            </div>
            <div class="day-detail__card-actions">
              <button @click="emit('editEvent', event)">✏️</button>
              <button @click="deleteEvent(event.id)">🗑</button>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
