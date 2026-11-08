import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { fetchSession, logout } from '@/api/auth';
import { useLoadingStore } from './loading';
import type { Session } from '@/shared/types/auth';

const AUTH_ERROR_KEY_BY_CODE: Record<string, string> = {
  reauthentication_needed: 'auth.errors.reauthenticationNeeded',
  reauthentication_not_valid: 'auth.errors.reauthenticationNeeded',
  validation_failed: 'auth.errors.validationFailed',
  over_request_rate_limit: 'auth.errors.tooManyRequests',
  request_timeout: 'auth.errors.requestTimeout',
};

type AuthErrorState = {
  email: string | null;
  password: string | null;
  auth: string | null;
};

export const useAuthStore = defineStore('auth', () => {
  const initialized = ref(false);
  const session = ref<Session | null>(null);
  const isAuthenticated = computed(() => session.value !== null);
  const loadingStore = useLoadingStore();

  async function init() {
    if (initialized.value) {
      return;
    }

    await Promise.all([
      (async () => {
        session.value = (await fetchSession()) ?? null;
      })(),
      new Promise((resolve) => setTimeout(resolve, 3600)),
    ]);

    initialized.value = true;
  }

  async function getSession() {
    if (!session.value) {
      session.value = (await fetchSession()) ?? null;
    }
    return session.value;
  }

  async function signOut(): Promise<boolean> {
    const success = await logout();
    if (!success) {
      return false;
    }
    session.value = null;
    return true;
  }

  return {
    initialized,
    session,
    isAuthenticated,
    init,
    getSession,
    signOut,
  };
});
