import { membersApi } from '@/api/client';
import { useLoadingStore } from './loading';
import type { TripMember } from '@shared/types/trip';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useMembersStore = defineStore('members', () => {
  const members = ref<TripMember[]>([]);
  const loadingStore = useLoadingStore();
  const error = ref<string | null>(null);

  async function fetchByTrip(tripId: string) {
    loadingStore.start();
    error.value = null;
    try {
      members.value = await membersApi.getAll(tripId);
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch membres';
    } finally {
      loadingStore.stop();
    }
  }

  async function add(tripId: string) {
    loadingStore.start();
    try {
      const newMember = await membersApi.add(tripId);
      members.value.push(newMember);
      return newMember;
    } finally {
      loadingStore.stop();
    }
  }

  async function remove(tripId: string, userId: string) {
    loadingStore.start();
    try {
      await membersApi.remove(tripId, userId);
      members.value = members.value.filter(m => m.user_id !== userId);
    } finally {
      loadingStore.stop();
    }
  }

  return {
    members,
    error,
    fetchByTrip,
    remove,
  };
});
