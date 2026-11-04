import { tripRepository } from '@/repositories';
import { useLoadingStore } from './loading';
import type { Trip, TripInput } from '@/shared/types/trip';
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useTripsStore = defineStore('trips', () => {
  const trips = ref<Trip[]>([]);
  const error = ref<string | null>(null);
  const loadingStore = useLoadingStore();

  const MIDNIGHT_BUFFER_MS = 1000;
  let dayTickTimeout: number | undefined;
  const today = ref(initializeToday());

  function msUntilNextMidnight(): number {
    const now = new Date();
    const nextMidnight = new Date(now);
    nextMidnight.setHours(24, 0, 0, 0);
    return Math.max(1, nextMidnight.getTime() - now.getTime());
  }

  function scheduleDayTick() {
    const delayMs = msUntilNextMidnight() + MIDNIGHT_BUFFER_MS;
    dayTickTimeout = window.setTimeout(() => {
      today.value = new Date().toISOString().slice(0, 10);
      scheduleDayTick();
    }, delayMs);
  }

  function initializeToday(): string {
    scheduleDayTick();
    return new Date().toISOString().slice(0, 10);
  }

  // Clear the timeout when the store is hot-reloaded to prevent multiple timers
  import.meta.hot?.dispose(() => {
    if (dayTickTimeout !== undefined) {
      window.clearTimeout(dayTickTimeout);
    }
  });

  const upcomingTrips = computed(() =>
    trips.value
      .filter((t) => t.end_date >= today.value)
      .sort((a, b) => a.start_date.localeCompare(b.start_date)),
  );

  const pastTrips = computed(() =>
    trips.value
      .filter((t) => t.end_date < today.value)
      .sort((a, b) => b.start_date.localeCompare(a.start_date)),
  );

  async function fetchAll() {
    loadingStore.start();
    error.value = null;
    try {
      trips.value = await tripRepository.getAll();
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch trips';
    } finally {
      loadingStore.stop();
    }
  }

  async function createTrip(body: TripInput): Promise<Trip> {
    loadingStore.start();
    try {
      const created = await tripRepository.create(body);
      trips.value.push(created);
      return created;
    } finally {
      loadingStore.stop();
    }
  }

  async function updateTrip(id: string, body: Partial<TripInput>): Promise<Trip> {
    loadingStore.start();
    try {
      const updated = await tripRepository.update(id, body);
      const index = trips.value.findIndex((t) => t.id === id);
      if (index !== -1) trips.value[index] = updated;
      return updated;
    } finally {
      loadingStore.stop();
    }
  }

  async function deleteTrip(id: string) {
    loadingStore.start();
    try {
      await tripRepository.delete(id);
      trips.value = trips.value.filter((t) => t.id !== id);
    } finally {
      loadingStore.stop();
    }
  }

  return {
    trips,
    upcomingTrips,
    pastTrips,
    error,
    fetchAll,
    createTrip,
    updateTrip,
    deleteTrip,
  };
});
