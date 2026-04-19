import { ApiError } from '@/api/http';
import {
  ERROR_CODE_PROFILE_DISPLAY_NAME_EMPTY,
  ERROR_CODE_PROFILE_DISPLAY_NAME_INVALID,
  ERROR_CODE_PROFILE_ICON_INVALID,
} from '@shared/constants/errorCodes';
import { profilesApi } from '../api/client';
import { useLoadingStore } from './loading';
import type { Profile } from '@shared/types/profile';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useProfileStore = defineStore('profile', () => {
  const profile = ref<Profile | null>(null);
  const loadingStore = useLoadingStore();

  const error = ref<{ displayName: string | null; icon: string | null; profile: string | null }>({
    displayName: null,
    icon: null,
    profile: null,
  });

  async function fetchProfile() {
    const traceId = `profile-fetch-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
    console.log('[profile] fetchProfile:start', { traceId });
    loadingStore.start();
    clearProfileError();
    try {
      console.log('[profile] fetchProfile:api:start', { traceId });
      profile.value = await profilesApi.getSelf();
      console.log('[profile] fetchProfile:api:end', { traceId, userId: profile.value?.id ?? null });
    } catch (e) {
      console.log('[profile] fetchProfile:error', { traceId, error: e });
      error.value.profile = e instanceof Error ? e.message : 'Failed to fetch profile';
    } finally {
      loadingStore.stop();
      console.log('[profile] fetchProfile:end', { traceId });
    }
  }

  async function updateProfile(
    updates: Partial<
      Pick<Profile, 'display_name' | 'preferred_locale' | 'icon' | 'icon_color' | 'icon_bg_color'>
    >,
  ) {
    const traceId = `profile-update-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
    console.log('[profile] updateProfile:start', { traceId, updates });
    loadingStore.start();
    clearProfileError();
    try {
      console.log('[profile] updateProfile:api:start', { traceId });
      profile.value = await profilesApi.updateSelf(updates);
      console.log('[profile] updateProfile:api:end', {
        traceId,
        userId: profile.value?.id ?? null,
      });
    } catch (e: unknown) {
      console.log('[profile] updateProfile:error', { traceId, error: e });
      if (
        e instanceof ApiError &&
        (e.code === ERROR_CODE_PROFILE_DISPLAY_NAME_EMPTY ||
          e.code === ERROR_CODE_PROFILE_DISPLAY_NAME_INVALID)
      ) {
        setProfileError(e.message, null, null);
        return;
      }
      if (e instanceof ApiError && e.code === ERROR_CODE_PROFILE_ICON_INVALID) {
        setProfileError(null, e.message, null);
        return;
      }
      error.value.profile = e instanceof Error ? e.message : 'Failed to updateprofile';
    } finally {
      loadingStore.stop();
      console.log('[profile] updateProfile:end', { traceId });
    }
  }

  function clearProfile() {
    profile.value = null;
    clearProfileError();
  }

  function setProfileError(
    displayName: string | null,
    icon: string | null,
    profile: string | null,
  ) {
    error.value = {
      displayName: displayName,
      icon: icon,
      profile: profile,
    };
  }

  function clearProfileError() {
    setProfileError(null, null, null);
  }

  return {
    profile,
    error,
    fetchProfile,
    updateProfile,
    clearProfile,
    setProfileError,
    clearProfileError,
  };
});
