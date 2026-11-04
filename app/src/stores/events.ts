import { eventRepository } from '@/repositories';
import { useLoadingStore } from './loading';
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { EventInput, TripEvent } from '@/shared/types/event';

export const useEventsStore = defineStore('events', () => {
  // --- State -----------
  const events = ref<TripEvent[]>([]);
  const error = ref<string | null>(null);
  const loadingStore = useLoadingStore();

  // --- Getters -----------

  // Group events by their primary date (for calendar display)
  const eventsByDate = computed(() => {
    const map = new Map<string, TripEvent[]>();

    for (const event of events.value) {
      const dates = eventDates(event);
      for (const date of dates) {
        if (!map.has(date)) map.set(date, []);
        map.get(date)!.push(event);
      }
    }

    return map;
  });

  function eventDates(event: TripEvent): string[] {
    const dates: string[] = [];
    const current = new Date(`${event.start_date}T00:00:00Z`);
    const end = new Date(`${event.end_date}T00:00:00Z`);
    while (current <= end) {
      dates.push(current.toISOString().slice(0, 10));
      current.setUTCDate(current.getUTCDate() + 1);
    }
    return dates;
  }

  // Get events for a specific date
  function getByDate(date: string): TripEvent[] {
    return (eventsByDate.value.get(date) ?? []).sort((a, b) => {
      const ta = sortKey(a);
      const tb = sortKey(b);
      return ta < tb ? -1 : ta > tb ? 1 : 0;
    });
  }

  function sortKey(event: TripEvent): string {
    return event.start_time ?? '99:99';
  }

  // Set of dates that have events (for calendar highlighting)
  const datesWithEvents = computed(() => new Set(eventsByDate.value.keys()));

  // --- Actions ----------

  async function fetchByTrip(tripId: string) {
    loadingStore.start();
    error.value = null;
    try {
      events.value = await eventRepository.getByTrip(tripId);
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch events';
    } finally {
      loadingStore.stop();
    }
  }

  async function createEvent(tripId: string, input: EventInput) {
    loadingStore.start();
    try {
      const created = await eventRepository.create(tripId, input);
      events.value.push(created);
      return created;
    } finally {
      loadingStore.stop();
    }
  }

  async function updateEvent(id: string, input: EventInput) {
    loadingStore.start();
    try {
      const updated = await eventRepository.update(id, input);
      const index = events.value.findIndex((e) => e.id === id);
      if (index !== -1) events.value[index] = updated;
      return updated;
    } finally {
      loadingStore.stop();
    }
  }

  async function deleteEvent(id: string) {
    loadingStore.start();
    try {
      await eventRepository.delete(id);
      events.value = events.value.filter((e) => e.id !== id);
    } finally {
      loadingStore.stop();
    }
  }

  return {
    // state
    events,
    error,
    // getters
    eventsByDate,
    datesWithEvents,
    getByDate,
    // actions
    fetchByTrip,
    createEvent,
    updateEvent,
    deleteEvent,
  };
});
