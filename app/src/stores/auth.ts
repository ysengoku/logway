import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { fetchSession, logout } from '@/api/auth';
// import { useLoadingStore } from './loading';
import type { Session } from '@/shared/types/auth';

type StoredSession = Session & { expiresAt: number; sessionExpiresAt: number };

const TOKEN_REFRESH_MARGIN_MS = 5 * 60 * 1000;
const TOKEN_USABLE_MARGIN_MS = 60 * 1000;
const SESSION_REAUTH_MARGIN_MS = 60 * 60 * 24 * 1000;
const RESUME_REFRESH_INTERVAL_MS = 5 * 60 * 1000;

export const useAuthStore = defineStore('auth', () => {
  const initialized = ref(false);
  const session = ref<StoredSession | null>(null);
  const profile = computed(() => session.value?.profile ?? null);
  const isAuthenticated = computed(() => session.value !== null);
  let refreshing: Promise<void> | null = null;
  let logoutRequesting: Promise<boolean> | null = null;
  let sessionGeneration = 0;
  let lastRefreshedAt = 0;
  // const loadingStore = useLoadingStore();

  async function init() {
    if (initialized.value) {
      return;
    }

    await Promise.all([resumeSession(), new Promise((resolve) => setTimeout(resolve, 3600))]);
    initialized.value = true;
  }

  async function resumeSession(): Promise<boolean> {
    if (lastRefreshedAt + RESUME_REFRESH_INTERVAL_MS < Date.now()) {
      await refreshSession();
    }
    if (session.value && session.value?.sessionExpiresAt > Date.now() + SESSION_REAUTH_MARGIN_MS) {
      return true;
    }
    // TODO: sync unsaved changes to Google Drive
    session.value = null;
    ++sessionGeneration;
    return false;
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
          const now = Date.now();
          session.value = {
            ...fetchedSession.session,
            profile: fetchedSession.session.profile ?? session.value?.profile ?? null,
            expiresAt: now + fetchedSession.session.expiresIn * 1000,
            sessionExpiresAt: now + fetchedSession.session.sessionExpiresIn * 1000,
          };
          lastRefreshedAt = Date.now();
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
    if (logoutRequesting) {
      return logoutRequesting;
    }
    logoutRequesting = (async () => {
      const success = await logout(allDevices);
      if (!success) {
        return false;
      }
      ++sessionGeneration;
      session.value = null;
      return true;
    })().finally(() => {
      logoutRequesting = null;
    });
    return logoutRequesting;
  }

  return {
    initialized,
    profile,
    isAuthenticated,
    init,
    resumeSession,
    getAccessToken,
    signOut,
  };
});
