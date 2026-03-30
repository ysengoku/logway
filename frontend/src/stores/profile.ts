import { profilesApi } from '../api/client';
import { useLoadingStore } from './loading';
import type { Profile } from '@shared/types/profile';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useProfileStore = defineStore('profile', () => {
  const profile = ref<Profile | null>(null);
  const error = ref<string | null>(null);
  const loadingStore = useLoadingStore();

  async function fetchProfile() {
    loadingStore.start();
    error.value = null;
    try {
      profile.value = await profilesApi.getSelf();
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch profile';
    } finally {
      loadingStore.stop();
    }
  }

  async function updateProfile(updates: Partial<Pick<Profile, 'display_name' | 'preferred_locale' | 'icon' | 'icon_color' | 'icon_bg_color'>>) {
    loadingStore.start();
    error.value = null;
    try {
      profile.value = await profilesApi.updateSelf(updates);
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to update profile';
    } finally {
      loadingStore.stop();
    }
  }

  function clearProfile() {
    profile.value = null;
    error.value = null;
  }

  return { profile, error, fetchProfile, updateProfile, clearProfile };
});