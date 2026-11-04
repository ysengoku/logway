import { ApiError } from '@/repositories/errors';
import {
  ERROR_CODE_PROFILE_DISPLAY_NAME_EMPTY,
  ERROR_CODE_PROFILE_DISPLAY_NAME_INVALID,
  ERROR_CODE_PROFILE_ICON_INVALID,
} from '@/shared/constants/errorCodes';
import { profilesApi } from '../repositories';
import { useLoadingStore } from './loading';
import type { Profile } from '@/shared/types/profile';
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
    loadingStore.start();
    clearProfileError();
    try {
      profile.value = await profilesApi.getSelf();
    } catch (e) {
      error.value.profile = e instanceof Error ? e.message : 'Failed to fetch profile';
    } finally {
      loadingStore.stop();
    }
  }

  async function updateProfile(
    updates: Partial<
      Pick<Profile, 'display_name' | 'preferred_locale' | 'icon' | 'icon_color' | 'icon_bg_color'>
    >,
  ) {
    loadingStore.start();
    clearProfileError();
    try {
      profile.value = await profilesApi.updateSelf(updates);
    } catch (e: unknown) {
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
