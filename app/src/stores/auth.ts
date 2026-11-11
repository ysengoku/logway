import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { fetchSession, logout } from '@/api/auth';
// import { useLoadingStore } from './loading';
import type { Session } from '@/shared/types/auth';

type StoredSession = Session & { expiresAt: number };

const TOKEN_REFRESH_MARGIN_MS = 5 * 60 * 1000;
const TOKEN_USABLE_MARGIN_MS = 60 * 1000;

export const useAuthStore = defineStore('auth', () => {
  const initialized = ref(false);
  const session = ref<StoredSession | null>(null);
  const profile = computed(() => session.value?.profile ?? null);
  const isAuthenticated = computed(() => session.value !== null);
  let refreshing: Promise<void> | null = null;
  let sessionGeneration = 0;
  // const loadingStore = useLoadingStore();

  async function init() {
    if (initialized.value) {
      return;
    }

    await Promise.all([refreshSession(), new Promise((resolve) => setTimeout(resolve, 3600))]);
    initialized.value = true;
  }

  async function refreshSession(): Promise<void> {
    if (refreshing) {
      return refreshing;
    }

    refreshing = (async () => {
      const generation = sessionGeneration;
      const fetchedSession = await fetchSession();
      if (generation !== sessionGeneration) {
        return; // Signed out while this refresh was in flight.
      }
      switch (fetchedSession.status) {
        case 'ok':
          session.value = {
            ...fetchedSession.session,
            expiresAt: Date.now() + fetchedSession.session.expiresIn * 1000,
          };
          break;
        case 'unauthenticated':
          session.value = null;
          break;
        case 'unavailable':
          break;
      }
    })().finally(() => {
      refreshing = null;
    });
    return refreshing;
  }

  async function getAccessToken(): Promise<string | null> {
    if (!session.value || session.value.expiresAt - TOKEN_REFRESH_MARGIN_MS < Date.now()) {
      await refreshSession();
    }
    if (!session.value || session.value.expiresAt - TOKEN_USABLE_MARGIN_MS < Date.now()) {
      return null;
    }
    return session.value.token;
  }

  async function signOut(allDevices: boolean = false): Promise<boolean> {
    const success = await logout(allDevices);
    if (!success) {
      return false;
    }
    ++sessionGeneration;
    session.value = null;
    return true;
  }

  return {
    initialized,
    profile,
    isAuthenticated,
    init,
    getAccessToken,
    signOut,
  };
});
