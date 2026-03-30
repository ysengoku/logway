import { useLoadingStore } from './loading';
import { useProfileStore } from './profile';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const initialized = ref(false);
  const loadingStore = useLoadingStore();
  const profileStore = useProfileStore();

  const isAuthenticated = computed(() => !!user.value);

  async function init() {
    if (initialized.value) {
      return;
    }

    loadingStore.start();
    const { data } = await supabase.auth.getSession();
    user.value = data.session?.user ?? null;

    user.value ? await profileStore.fetchProfile() : profileStore.clearProfile();
    loadingStore.stop();

    supabase.auth.onAuthStateChange(async (_event, session) => {
      user.value = session?.user ?? null;
      user.value ? await profileStore.fetchProfile() : profileStore.clearProfile();
    });
    initialized.value = true;
  }

  async function signUp(email: string, password: string, displayName: string) {
    loadingStore.start();
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName
          }
        }
      });
      if (error) {
        throw error;
      }
    } finally {
      loadingStore.stop();
    }
  }

  async function signIn(email: string, password: string) {
    loadingStore.start();
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        throw error;
      }
    } finally {
      loadingStore.stop();
    }
  }

  async function signOut() {
    loadingStore.start();
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      user.value = null;
    } finally {
      loadingStore.stop();
    }
  }

  async function resetPassword(email: string) {
    loadingStore.start();
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        throw error;
      }
    } finally {
      loadingStore.stop();
    }
  }

  async function updatePassword(newPassword: string) {
    loadingStore.start();
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        throw error;
      }
    } finally {
      loadingStore.stop();
    }
  }

  return {
    user,
    initialized,
    isAuthenticated,
    init,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
  };
});
