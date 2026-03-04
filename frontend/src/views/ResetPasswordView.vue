<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '@/lib/supabase';

const router = useRouter();
const loading = ref(false);
const error = ref<string | null>(null);
const done = ref(false);

const form = reactive({
  password: '',
  passwordConfirm: '',
});

async function submit() {
  error.value = null;

  if (form.password !== form.passwordConfirm) {
    error.value = 'Passwords do not match.';
    return;
  }

  loading.value = true;
  try {
    const { error: err } = await supabase.auth.updateUser({ password: form.password });
    if (err) throw err;
    done.value = true;
    setTimeout(() => router.push({ name: 'auth' }), 2000);
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'An error occurred.';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="auth-view">
    <div class="auth-view__card">
      <h2 class="auth-view__title">New password</h2>

      <div v-if="done" class="auth-view__success">
        Password updated. Redirecting to sign in...
      </div>

      <template v-else>
        <div class="form-row">
          <label>New Password</label>
          <input v-model="form.password" type="password" placeholder="new password" />
        </div>
        <div class="form-row">
          <label>Confirm Password</label>
          <input v-model="form.passwordConfirm" type="password" placeholder="repeat new password" />
        </div>

        <div v-if="error" class="auth-view__error">{{ error }}</div>

        <button
          class="auth-view__submit"
          :disabled="loading"
          @click="submit"
        >
          {{ loading ? 'Loading...' : 'Update password' }}
        </button>
      </template>
    </div>
  </div>
</template>
