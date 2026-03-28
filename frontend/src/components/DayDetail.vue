<script setup lang="ts">
import AppIcon from '@/components/AppIcon.vue';
import EventCard from '@/components/eventCards/EventCard.vue';
import { EVENT_TYPE_OPTIONS } from '@/constants/events';
import { useEventsStore } from '@/stores/events';
import type { EventRow, EventType } from '@shared/types/event';
import { useI18n } from 'vue-i18n';
import { computed, ref } from 'vue';

const props = defineProps<{
  date: string;
}>();

const emit = defineEmits<{
  addEvent: [date: string];
  editEvent: [event: EventRow];
}>();

const eventsStore = useEventsStore();
const viewMode = ref<'timeline' | 'type'>('timeline');
const { d } = useI18n();

const events = computed(() => eventsStore.getByDate(props.date));

const formattedDate = computed(() => {
  return d(new Date(`${props.date}T00:00:00`), 'short');
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
          + {{ $t('common.add') }}
        </button>
      </div>
      <div class="day-detail__view-toggle">
        <button
          class="day-detail__toggle-btn"
          :class="{ 'day-detail__toggle-btn--active': viewMode === 'timeline' }"
          @click="viewMode = 'timeline'"
        >
          {{ $t('day.timeline') }}
        </button>
        <button
          class="day-detail__toggle-btn"
          :class="{ 'day-detail__toggle-btn--active': viewMode === 'type' }"
          @click="viewMode = 'type'"
        >
          {{ $t('day.byType') }}
        </button>
      </div>
    </div>

    <div v-if="events.length === 0" class="day-detail__empty">
      {{ $t('day.noEvents') }}
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
              <AppIcon :name="group.icon" :size="20" />
              {{ group.label }}
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
