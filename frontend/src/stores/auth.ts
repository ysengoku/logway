import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const loading = ref(true);

  const isAuthenticated = computed(() => !!user.value);

  async function init() {
    const { data } = await supabase.auth.getSession();
    user.value = data.session?.user ?? null;
    loading.value = false;

    supabase.auth.onAuthStateChange((_event, session) => {
      user.value = session?.user ?? null;
    });
  }

  async function signUp(email: string, password: string) {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    user.value = null;
  }

  return {
    user,
    loading,
    isAuthenticated,
    init,
    signUp,
    signIn,
    signOut,
  };
});
