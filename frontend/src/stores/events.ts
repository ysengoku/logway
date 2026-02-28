import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { eventsApi } from '@/api/client';
import type { EventRow } from '@shared/types/event';

export const useEventsStore = defineStore('events', () => {
  // --- State -----------
  const events = ref<EventRow[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // --- Getters -----------

  // Group events by their primary date (for calendar display)
  const eventsByDate = computed(() => {
    const map = new Map<string, EventRow[]>();

    for (const event of events.value) {
      const dates = eventDates(event);
      for (const date of dates) {
        if (!map.has(date)) map.set(date, []);
        map.get(date)!.push(event);
      }
    }

    return map;
  });

  function eventDates(event: EventRow): string[] {
    switch (event.type) {
      case 'flight':
      case 'transport':  return [event.dep_local_date].filter(Boolean) as string[];
      case 'hotel': {
        if (!event.check_in_date) return [];
        if (!event.check_out_date) return [event.check_in_date];
        const dates: string[] = [];
        const current = new Date(event.check_in_date);
        const end = new Date(event.check_out_date);
        while (current <= end) {
          dates.push(current.toISOString().slice(0, 10));
          current.setDate(current.getDate() + 1);
        }
        return dates;
      }
      case 'restaurant': return [event.reservation_date].filter(Boolean) as string[];
      case 'activity':   return [event.schedule_date].filter(Boolean) as string[];
      case 'link':       return [event.related_date].filter(Boolean) as string[];
      default:           return [];
    }
  }

  // Get events for a specific date
  function getByDate(date: string): EventRow[] {
    return (eventsByDate.value.get(date) ?? []).sort((a, b) => {
      const ta = sortKey(a);
      const tb = sortKey(b);
      return ta < tb ? -1 : ta > tb ? 1 : 0;
    });
  }

  function sortKey(event: EventRow): string {
    switch (event.type) {
      case 'flight':
      case 'transport':  return event.dep_local_time ?? '99:99';
      case 'hotel':      return event.check_in_time ?? '99:99';
      case 'restaurant': return event.reservation_time ?? '99:99';
      case 'activity':   return event.schedule_time ?? '99:99';
      default:           return '99:99';
    }
  }

  // Set of dates that have events (for calendar highlighting)
  const datesWithEvents = computed(() => new Set(eventsByDate.value.keys()));

  // --- Actions ----------
  async function fetchAll() {
    loading.value = true;
    error.value = null;
    try {
      events.value = await eventsApi.getAll();
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch events';
    } finally {
      loading.value = false;
    }
  }

  async function fetchByTrip(tripId: string) {
    loading.value = true;
    error.value = null;
    try {
      events.value = await eventsApi.getByTrip(tripId);
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch events';
    } finally {
      loading.value = false;
    }
  }

  async function createEvent(body: Partial<EventRow>) {
    const created = await eventsApi.create(body);
    events.value.push(created);
    return created;
  }

  async function updateEvent(id: string, body: Partial<EventRow>) {
    const updated = await eventsApi.update(id, body);
    const index = events.value.findIndex((e) => e.id === id);
    if (index !== -1) events.value[index] = updated;
    return updated;
  }

  async function deleteEvent(id: string) {
    await eventsApi.delete(id);
    events.value = events.value.filter((e) => e.id !== id);
  }

  function primaryDate(event: EventRow): string | null {
    switch (event.type) {
      case 'flight':
      case 'transport':  return event.dep_local_date ?? null;
      case 'hotel':      return event.check_in_date ?? null;
      case 'restaurant': return event.reservation_date ?? null;
      case 'activity':   return event.schedule_date ?? null;
      case 'link':       return event.related_date ?? null;
      default:           return null;
    }
  }

  return {
    // state
    events,
    loading,
    error,
    // getters
    eventsByDate,
    datesWithEvents,
    getByDate,
    // actions
    fetchAll,
    fetchByTrip,
    createEvent,
    updateEvent,
    deleteEvent,
    // helpers
    primaryDate,
  };
});
