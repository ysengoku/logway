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
    const { data } = await supabase.auth.getSession();
    user.value = data.session?.user ?? null;
    await syncProfileForCurrentUser();
    loadingStore.stop();

    supabase.auth.onAuthStateChange(async (_event, session) => {
      user.value = session?.user ?? null;
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

// {
//     "id": "2b3acbcf-d4b4-42b0-8e3e-d0751014c602",
//     "aud": "authenticated",
//     "role": "authenticated",
//     "email": "luna.slowvoyage@gmail.com",
//     "email_confirmed_at": "2026-03-03T20:59:10.145502Z",
//     "phone": "",
//     "confirmed_at": "2026-03-03T20:59:10.145502Z",
//     "new_email": "luna.slowvoyage@gmail.co",
//     "last_sign_in_at": "2026-03-31T19:48:52.661685Z",
//     "app_metadata": {
//         "provider": "email",
//         "providers": [
//             "email"
//         ]
//     },
//     "user_metadata": {
//         "email": "luna.slowvoyage@gmail.com",
//         "email_verified": true,
//         "phone_verified": false,
//         "sub": "2b3acbcf-d4b4-42b0-8e3e-d0751014c602"
//     },
//     "identities": [
//         {
//             "identity_id": "0064ab52-c688-4eb8-874b-518be91542b4",
//             "id": "2b3acbcf-d4b4-42b0-8e3e-d0751014c602",
//             "user_id": "2b3acbcf-d4b4-42b0-8e3e-d0751014c602",
//             "identity_data": {
//                 "email": "luna.slowvoyage@gmail.com",
//                 "email_verified": true,
//                 "phone_verified": false,
//                 "sub": "2b3acbcf-d4b4-42b0-8e3e-d0751014c602"
//             },
//             "provider": "email",
//             "last_sign_in_at": "2026-03-03T20:58:30.028409Z",
//             "created_at": "2026-03-03T20:58:30.028471Z",
//             "updated_at": "2026-03-03T20:58:30.028471Z",
//             "email": "luna.slowvoyage@gmail.com"
//         }
//     ],
//     "created_at": "2026-03-03T20:58:29.964815Z",
//     "updated_at": "2026-04-04T18:28:58.840248Z",
//     "is_anonymous": false
// }