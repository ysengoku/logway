import { membersApi, tripsApi } from '@/api/client';
import { useLoadingStore } from './loading';
import type { Trip, TripInput } from '@shared/types/trip';
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useTripsStore = defineStore('trips', () => {
  const trips = ref<Trip[]>([]);
  const error = ref<string | null>(null);
  const loadingStore = useLoadingStore();

  const today = new Date().toISOString().slice(0, 10);

  const upcomingTrips = computed(() =>
    trips.value
      .filter((t) => !t.end_date || t.end_date >= today)
      .sort((a, b) => (a.start_date ?? '').localeCompare(b.start_date ?? '')),
  );

  const pastTrips = computed(() =>
    trips.value
      .filter((t) => t.end_date && t.end_date < today)
      .sort((a, b) => (b.start_date ?? '').localeCompare(a.start_date ?? '')),
  );

  async function fetchAll() {
    loadingStore.start();
    error.value = null;
    try {
      trips.value = await tripsApi.getAll();
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch trips';
    } finally {
      loadingStore.stop();
    }
  }

  async function createTrip(body: TripInput): Promise<Trip> {
    loadingStore.start();
    try {
      const created = await tripsApi.create(body);
      trips.value.push(created);
      return created;
    } finally {
      loadingStore.stop();
    }
  }

  async function joinTrip(inviteCode: string): Promise<Trip> {
    loadingStore.start();
    try {
      const joined = await tripsApi.getByInviteCode(inviteCode);
      await membersApi.add(joined.id);
      const index = trips.value.findIndex((t) => t.id === joined.id);
      if (index === -1) {
        trips.value.push(joined);
      } else {
        trips.value[index] = joined;
      }
      return joined;
    } finally {
      loadingStore.stop();
    }
  }

  async function updateTrip(id: string, body: Partial<TripInput>): Promise<Trip> {
    loadingStore.start();
    try {
      const updated = await tripsApi.update(id, body);
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
      await tripsApi.delete(id);
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
    joinTrip,
    updateTrip,
    deleteTrip,
  };
});
