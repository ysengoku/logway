import { defineStore } from 'pinia';
import { ref } from 'vue';
import { membersApi } from '@/api/client';
import type { TripMember } from '@shared/types/trip';

export const useMembersStore = defineStore('members', () => {
  const members = ref<TripMember[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchByTrip(tripId: string) {
    loading.value = true;
    error.value = null;
    try {
      members.value = await membersApi.getAll(tripId);
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch membres';
    } finally {
      loading.value = false;
    }
  }

  async function add(tripId: string) {
    const newMember = await membersApi.add(tripId);
    members.value.push(newMember);
  }

  async function remove(tripId: string, userId: string) {
    await membersApi.remove(tripId, userId);
    members.value = members.value.filter(m => m.user_id !== userId);
  }

  return {
    members,
    loading,
    error,
    fetchByTrip,
    remove,
  };
});
