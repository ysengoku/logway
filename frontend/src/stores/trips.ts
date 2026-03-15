import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { membersApi, tripsApi } from '@/api/client';
import type { Trip, TripInput } from '@shared/types/trip';

export const useTripsStore = defineStore('trips', () => {
  const trips = ref<Trip[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

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

  async function joinTrip(inviteCode: string): Promise<Trip> {
    const joined = await tripsApi.getByInviteCode(inviteCode);
    await membersApi.add(joined.id);
    const index = trips.value.findIndex((t) => t.id === joined.id);
    if (index === -1) {
      trips.value.push(joined);
    } else {
      trips.value[index] = joined;
    }
    return joined;
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
    upcomingTrips,
    pastTrips,
    loading,
    error,
    fetchAll,
    createTrip,
    joinTrip,
    updateTrip,
    deleteTrip,
  };
});
