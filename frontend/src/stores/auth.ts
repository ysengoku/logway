import { useLoadingStore } from './loading';
import { useProfileStore } from './profile';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

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

const AUTH_ERROR_KEY_BY_CODE: Record<string, string> = {
  email_address_invalid: 'auth.errors.invalidEmail',
  email_exists: 'auth.errors.emailExists',
  email_not_confirmed: 'auth.errors.emailNotConfirmed',
  email_provider_disabled: 'auth.errors.emailProviderDisabled',
  user_sso_managed: 'auth.errors.emailSsoManaged',
  weak_password: 'auth.errors.weakPassword',
  same_password: 'auth.errors.samePassword',
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

type EmailChangeResult = {
  status: 'pending' | 'error';
  emailError?: string;
  authError?: string;
};

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
    return user.value ? profileStore.fetchProfile() : Promise.resolve(profileStore.clearProfile());
  }

  async function init() {
    if (initialized.value) {
      return;
    }

    loadingStore.start();
    try {
      const { data } = await supabase.auth.getSession();
      user.value = data.session?.user ?? null;
      await syncProfileForCurrentUser();
    } finally {
      loadingStore.stop();
    }

    supabase.auth.onAuthStateChange(async (event, session) => {
      user.value = session?.user ?? null;

      // Password/email updates emit USER_UPDATED, which does not require profile refetch.
      if (event === 'USER_UPDATED') {
        return;
      }

      await syncProfileForCurrentUser();
    });
    initialized.value = true;
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

  async function updatePassword(newPassword: string): Promise<boolean> {
    if (!newPassword) {
      return false;
    }

    loadingStore.start();
    clearAuthError();
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        setAuthErrorByUpdateContext({ password: newPassword }, error);
        return false;
      }
      return true;
    } finally {
      loadingStore.stop();
    }
  }

  async function requestEmailChange(newEmail: string): Promise<EmailChangeResult> {
    const normalizedEmail = newEmail.trim();

    loadingStore.start();
    try {
      const { data, error } = await supabase.auth.updateUser({ email: normalizedEmail });
      if (error) {
        const mapped = mapAuthErrorByUpdateContext({ email: normalizedEmail }, error);
        return {
          status: 'error',
          emailError: mapped.email ?? undefined,
          authError: mapped.auth ?? undefined,
        };
      }

      if (data?.user) {
        user.value = data.user;
      }

      return { status: 'pending' };
    } finally {
      loadingStore.stop();
    }
  }

  function mapAuthErrorByUpdateContext(
    updates: { email?: string; password?: string },
    error: { message: string; code?: string | null },
  ): AuthErrorState {
    const attemptedEmail = Boolean(updates.email);
    const attemptedPassword = Boolean(updates.password);
    const code = error.code ?? null;
    const message = resolveAuthErrorMessage(error);

    if (attemptedEmail && !attemptedPassword) {
      return { email: message, password: null, auth: null };
    }

    if (!attemptedEmail && attemptedPassword) {
      return { email: null, password: message, auth: null };
    }

    if (code && EMAIL_ERROR_CODES.has(code)) {
      return { email: message, password: null, auth: null };
    }

    if (code && PASSWORD_ERROR_CODES.has(code)) {
      return { email: null, password: message, auth: null };
    }

    if (code === 'validation_failed') {
      return { email: message, password: message, auth: null };
    }

    if (code === 'over_request_rate_limit' || code === 'request_timeout') {
      return { email: null, password: null, auth: message };
    }

    return { email: null, password: null, auth: message };
  }

  function resolveAuthErrorMessage(error: { message: string; code?: string | null }): string {
    const code = error.code ?? null;
    if (code && AUTH_ERROR_KEY_BY_CODE[code]) {
      return AUTH_ERROR_KEY_BY_CODE[code];
    }

    return error.message || 'auth.errors.unknown';
  }

  function setAuthErrorByUpdateContext(
    updates: { email?: string; password?: string },
    error: { message: string; code?: string | null },
  ) {
    const mapped = mapAuthErrorByUpdateContext(updates, error);
    setAuthError(mapped.email, mapped.password, mapped.auth);
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
    requestEmailChange,
    updatePassword,
    setAuthError,
  };
});
