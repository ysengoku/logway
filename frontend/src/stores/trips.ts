import { defineStore } from 'pinia';
import { ref } from 'vue';
import { tripsApi } from '@/api/client';
import type { Trip, TripInput } from '@shared/types/trip';

export const useTripsStore = defineStore('trips', () => {
  const trips = ref<Trip[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchAll() {
    loading.value = true;
    error.value = null;
    try {
      trips.value = await tripsApi.getAll();
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch trips';
    } finally {
      loading.value = false;
    }
  }

  async function createTrip(body: TripInput): Promise<Trip> {
    const created = await tripsApi.create(body);
    trips.value.push(created);
    return created;
  }

  async function updateTrip(id: string, body: Partial<TripInput>): Promise<Trip> {
    const updated = await tripsApi.update(id, body);
    const index = trips.value.findIndex((t) => t.id === id);
    if (index !== -1) trips.value[index] = updated;
    return updated;
  }

  async function deleteTrip(id: string) {
    await tripsApi.delete(id);
    trips.value = trips.value.filter((t) => t.id !== id);
  }

  return {
    trips,
    loading,
    error,
    fetchAll,
    createTrip,
    updateTrip,
    deleteTrip,
  };
});
