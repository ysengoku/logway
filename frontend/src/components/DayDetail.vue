<script setup lang="ts">
import { computed, ref } from 'vue';
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
const viewMode = ref<'timeline' | 'type'>('timeline');

const events = computed(() => eventsStore.getByDate(props.date));

const formattedDate = computed(() => {
  const d = new Date(props.date + 'T00:00:00');
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
});

const EVENT_ICONS: Record<string, string> = {
  flight:     '✈️',
  transport:  '🚆',
  hotel:      '🏨',
  restaurant: '🍽️',
  activity:   '🎯',
  link:       '🔗',
};

const EVENT_GROUPS = [
  { type: 'flight',     label: 'Flights' },
  { type: 'transport',  label: 'Transport' },
  { type: 'hotel',      label: 'Hotel' },
  { type: 'restaurant', label: 'Restaurants' },
  { type: 'activity',   label: 'Activities' },
  { type: 'link',       label: 'Links' },
] as const;

function getEventsByType(type: string) {
  return events.value.filter((e) => e.type === type);
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

function formatTime(time: string | null | undefined): string | null {
  if (!time) return null;
  return time.slice(0, 5);
}

function getEventTime(event: EventRow): string | null {
  switch (event.type) {
    case 'flight':
    case 'transport':  return formatTime(event.dep_local_time);
    case 'hotel':
      if (event.check_in_date === props.date) return formatTime(event.check_in_time);
      if (event.check_out_date === props.date) return formatTime(event.check_out_time);
      return null;
    case 'restaurant': return formatTime(event.reservation_time);
    case 'activity':   return formatTime(event.schedule_time);
    default:           return null;
  }
}

function isCheckInDate(event: EventRow): boolean {
  return event.type === 'hotel' && event.check_in_date === props.date;
}

function isCheckOutDate(event: EventRow): boolean {
  return event.type === 'hotel' && event.check_out_date === props.date;
}

async function deleteEvent(id: string) {
  if (!confirm('Delete this event?')) return;
  await eventsStore.deleteEvent(id);
}
</script>

<template>
  <div class="day-detail">
    <div class="day-detail__header">
      <div class="day-detail__header-top">
        <h2 class="day-detail__date">{{ formattedDate }}</h2>
        <button class="button-secondary2" @click="emit('addEvent', date)">
          + Add
        </button>
      </div>
      <div class="day-detail__view-toggle">
        <button
          class="day-detail__toggle-btn"
          :class="{ 'day-detail__toggle-btn--active': viewMode === 'timeline' }"
          @click="viewMode = 'timeline'"
        >
          Timeline
        </button>
        <button
          class="day-detail__toggle-btn"
          :class="{ 'day-detail__toggle-btn--active': viewMode === 'type' }"
          @click="viewMode = 'type'"
        >
          By type
        </button>
      </div>
    </div>

    <div v-if="events.length === 0" class="day-detail__empty">
      No events on this day yet.
    </div>

    <template v-else>
      <!-- Timeline view -->
      <div v-if="viewMode === 'timeline'" class="day-detail__list">
        <div
          v-for="event in events"
          :key="event.id"
          class="day-detail__card"
          :class="`day-detail__card--${event.type}`"
        >
          <div class="day-detail__card-time">
            {{ getEventTime(event) ?? '—' }}
          </div>
          <div class="day-detail__card-content">
            <div class="day-detail__card-title">
              <span class="day-detail__card-icon">{{ EVENT_ICONS[event.type] }}</span>
              {{ getEventTitle(event) }}
            </div>
            <div class="day-detail__card-meta">
              <template v-if="event.type === 'flight' || event.type === 'transport'">
                <span>{{ event.dep_place }} → {{ event.arr_place }}</span><br />
                <span>🛬 {{ event.arr_local_date }} {{ formatTime(event.arr_local_time) }}</span>
              </template>
              <template v-else-if="event.type === 'hotel'">
                <span v-if="isCheckInDate(event)">
                  IN {{ formatTime(event.check_in_time) }}
                  <template v-if="event.check_out_date"> · OUT {{ event.check_out_date }} {{ formatTime(event.check_out_time) }}</template>
                </span>
                <span v-else-if="isCheckOutDate(event)">
                  OUT {{ formatTime(event.check_out_time) }}
                </span>
                <span v-if="event.address">📍 {{ event.address }}</span>
              </template>
              <template v-else-if="event.type === 'restaurant' || event.type === 'activity'">
                <span v-if="event.address">📍 {{ event.address }}</span>
              </template>
              <template v-else-if="event.type === 'link'">
                <a v-if="event.link_url" :href="event.link_url" target="_blank" rel="noopener">
                  {{ event.link_url }}
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

      <!-- By type view -->
      <div v-else class="day-detail__groups">
        <template
          v-for="group in EVENT_GROUPS"
          :key="group.type"
        >
          <template v-if="getEventsByType(group.type).length">
            <div class="day-detail__group-label">
              {{ EVENT_ICONS[group.type] }} {{ group.label }}
            </div>
            <div class="day-detail__list">
              <div
                v-for="event in getEventsByType(group.type)"
                :key="event.id"
                class="day-detail__card"
                :class="`day-detail__card--${event.type}`"
              >
                <div class="day-detail__card-time">
                  {{ getEventTime(event) ?? '—' }}
                </div>
                <div class="day-detail__card-content">
                  <div class="day-detail__card-title">
                    {{ getEventTitle(event) }}
                  </div>
                  <div class="day-detail__card-meta">
                    <template v-if="event.type === 'flight' || event.type === 'transport'">
                      <span>{{ event.dep_place }} → {{ event.arr_place }}</span><br />
                      <span>🛬 {{ event.arr_local_date }} {{ formatTime(event.arr_local_time) }}</span>
                    </template>
                    <template v-else-if="event.type === 'hotel'">
                      <span>OUT {{ event.check_out_date }}</span><br />
                      <span v-if="event.address">📍 {{ event.address }}</span>
                    </template>
                    <template v-else-if="event.type === 'restaurant' || event.type === 'activity'">
                      <span v-if="event.address">📍 {{ event.address }}</span>
                    </template>
                    <template v-else-if="event.type === 'link'">
                      <a v-if="event.link_url" :href="event.link_url" target="_blank" rel="noopener">
                        {{ event.link_url }}
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
          </template>
        </template>
      </div>
    </template>
  </div>
</template>
