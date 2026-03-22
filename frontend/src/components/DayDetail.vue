<script setup lang="ts">
import { computed, ref } from 'vue';
import { useEventsStore } from '@/stores/events';
import { EVENT_TYPE_OPTIONS } from '@/constants/events';
import EventCard from '@/components/eventCards/EventCard.vue';
import type { EventRow, EventType } from '@shared/types/event';

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

function getEventsByType(type: EventType) {
  return events.value.filter((e) => e.type === type);
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
        <EventCard
          v-for="event in events"
          :key="event.id"
          :event="event"
          :date="date"
          mode="timeline"
          @edit="emit('editEvent', $event)"
          @delete="deleteEvent($event)"
        />
      </div>

      <!-- By type view -->
      <div v-else class="day-detail__groups">
        <template
          v-for="group in EVENT_TYPE_OPTIONS"
          :key="group.type"
        >
          <template v-if="getEventsByType(group.type).length">
            <div class="day-detail__group-label">
              <span class="material-icons">{{ group.icon }}</span> {{ group.label }}
            </div>
            <div class="day-detail__list">
              <EventCard
                v-for="event in getEventsByType(group.type)"
                :key="event.id"
                :event="event"
                :date="date"
                mode="type"
                @edit="emit('editEvent', $event)"
                @delete="deleteEvent($event)"
              />
            </div>
          </template>
        </template>
      </div>
    </template>
  </div>
</template>
