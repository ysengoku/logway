import { useLoadingStore } from './loading';
import { useProfileStore } from './profile';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

function logAuthFlow(message: string, payload?: Record<string, unknown>) {
  console.log(`[auth] ${message}`, payload ?? {});
}

const EMAIL_ERROR_CODES = new Set([
  'email_address_invalid',
  'email_exists',
  'email_not_confirmed',
  'email_provider_disabled',
  'user_sso_managed',
]);

const PASSWORD_ERROR_CODES = new Set([
  'weak_password',
  'same_password',
  'reauthentication_needed',
  'reauthentication_not_valid',
]);

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const initialized = ref(false);
  const loadingStore = useLoadingStore();
  const profileStore = useProfileStore();

  const authError = ref<{ email: string | null; password: string | null; auth: string | null }>({
    email: null,
    password: null,
    auth: null,
  });

  const isAuthenticated = computed(() => !!user.value);

  async function syncProfileForCurrentUser() {
    logAuthFlow('syncProfileForCurrentUser:start', { userId: user.value?.id ?? null });
    try {
      if (user.value) {
        await profileStore.fetchProfile();
        return;
      }

      profileStore.clearProfile();
    } finally {
      logAuthFlow('syncProfileForCurrentUser:end', { userId: user.value?.id ?? null });
    }
  }

  async function init() {
    const traceId = `init-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
    logAuthFlow('init:start', { traceId, initialized: initialized.value });

    if (initialized.value) {
      logAuthFlow('init:skip-already-initialized', { traceId });
      return;
    }

    loadingStore.start();
    logAuthFlow('init:after-loading-start', { traceId });

    logAuthFlow('init:getSession:start', { traceId });
    const { data } = await supabase.auth.getSession();
    logAuthFlow('init:getSession:end', {
      traceId,
      hasSession: Boolean(data.session),
      userId: data.session?.user?.id ?? null,
    });

    user.value = data.session?.user ?? null;
    logAuthFlow('init:syncProfile:start', { traceId, userId: user.value?.id ?? null });
    await syncProfileForCurrentUser();
    logAuthFlow('init:syncProfile:end', { traceId, userId: user.value?.id ?? null });

    loadingStore.stop();
    logAuthFlow('init:after-loading-stop', { traceId });

    supabase.auth.onAuthStateChange(async (event, session) => {
      const eventTraceId = `event-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
      logAuthFlow('onAuthStateChange:start', {
        traceId: eventTraceId,
        event,
        sessionUserId: session?.user?.id ?? null,
      });

      user.value = session?.user ?? null;
      logAuthFlow('onAuthStateChange:syncProfile:start', {
        traceId: eventTraceId,
        userId: user.value?.id ?? null,
      });

      await syncProfileForCurrentUser();
      logAuthFlow('onAuthStateChange:syncProfile:end', {
        traceId: eventTraceId,
        userId: user.value?.id ?? null,
      });
    });

    logAuthFlow('init:onAuthStateChange-subscribed', { traceId });
    initialized.value = true;
    logAuthFlow('init:end', { traceId, initialized: initialized.value });
  }

  async function signUp(email: string, password: string, displayName: string) {
    loadingStore.start();
    clearAuthError();
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
          },
        },
      });
      if (error) {
        setAuthErrorByUpdateContext({ email, password }, error);
      }
    } finally {
      loadingStore.stop();
    }
  }

  async function signIn(email: string, password: string) {
    loadingStore.start();
    clearAuthError();
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setAuthErrorByUpdateContext({ email, password }, error);
      }
    } finally {
      loadingStore.stop();
    }
  }

  async function signOut() {
    loadingStore.start();
    clearAuthError();
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        setAuthErrorByUpdateContext({}, error);
      }
      user.value = null;
    } finally {
      loadingStore.stop();
    }
  }

  async function resetPassword(email: string) {
    loadingStore.start();
    clearAuthError();
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        setAuthErrorByUpdateContext({}, error);
      }
    } finally {
      loadingStore.stop();
    }
  }

  async function updateUserCredentials(updates: { email?: string; password?: string }) {
    if (!updates.email && !updates.password) {
      return;
    }

    loadingStore.start();
    clearAuthError();
    try {
      const { error } = await supabase.auth.updateUser(updates);
      if (error) {
        setAuthErrorByUpdateContext(updates, error);
      }
    } finally {
      loadingStore.stop();
    }
  }

  function setAuthErrorByUpdateContext(
    updates: { email?: string; password?: string },
    error: { message: string; code?: string | null },
  ) {
    const attemptedEmail = Boolean(updates.email);
    const attemptedPassword = Boolean(updates.password);
    const code = error.code ?? null;
    const message = error.message;

    if (attemptedEmail && !attemptedPassword) {
      setAuthError(message, null, null);
      return;
    }

    if (!attemptedEmail && attemptedPassword) {
      setAuthError(null, message, null);
      return;
    }

    if (code && EMAIL_ERROR_CODES.has(code)) {
      setAuthError(message, null, null);
      return;
    }

    if (code && PASSWORD_ERROR_CODES.has(code)) {
      setAuthError(null, message, null);
      return;
    }

    if (code === 'validation_failed') {
      setAuthError(message, message, null);
      return;
    }

    if (code === 'over_request_rate_limit' || code === 'request_timeout') {
      setAuthError(null, null, message);
      return;
    }

    setAuthError(null, null, message);
  }

  function setAuthError(
    emailMessage: string | null,
    passwordMessage: string | null,
    authMessage: string | null = null,
  ) {
    authError.value = { email: emailMessage, password: passwordMessage, auth: authMessage };
  }

  function clearAuthError() {
    authError.value = { email: null, password: null, auth: null };
  }

  return {
    user,
    initialized,
    isAuthenticated,
    authError,
    init,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateUserCredentials,
    setAuthError,
  };
});
