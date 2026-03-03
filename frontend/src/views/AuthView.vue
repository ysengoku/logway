<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const mode = ref<'signin' | 'signup'>('signin');
const loading = ref(false);
const error = ref<string | null>(null);
const signUpDone = ref(false);

const form = reactive({
  email: '',
  password: '',
  passwordConfirm: '',
});

const passwordMismatch = computed(() =>
  mode.value === 'signup' &&
  form.passwordConfirm.length > 0 &&
  form.password !== form.passwordConfirm,
);

async function submit() {
  error.value = null;

  if (mode.value === 'signup' && form.password !== form.passwordConfirm) {
    error.value = 'Passwords do not match.';
    return;
  }

  loading.value = true;
  try {
    if (mode.value === 'signin') {
      await authStore.signIn(form.email, form.password);
      router.push({ name: 'home' });
    } else {
      await authStore.signUp(form.email, form.password);
      signUpDone.value = true;
    }
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
      <h2 class="auth-view__title">
        {{ mode === 'signin' ? 'Sign in' : 'Sign up' }}
      </h2>

      <div v-if="signUpDone" class="auth-view__success">
        Check your email to confirm your account, then sign in.
      </div>

      <template v-else>
        <div class="form-row">
          <label>Email</label>
          <input v-model="form.email" type="email" placeholder="you@example.com" />
        </div>
        <div class="form-row">
          <label>Password</label>
          <input v-model="form.password" type="password" placeholder="••••••••" />
        </div>
        <div v-if="mode === 'signup'" class="form-row">
          <label>Confirm Password</label>
          <input
            v-model="form.passwordConfirm"
            type="password"
            placeholder="••••••••"
            :class="{ 'auth-view__input--error': passwordMismatch }"
          />
          <span v-if="passwordMismatch" class="auth-view__field-error">
            Passwords do not match.
          </span>
        </div>

        <div v-if="error" class="auth-view__error">{{ error }}</div>

        <button
          class="auth-view__submit"
          :disabled="loading || passwordMismatch"
          @click="submit"
        >
          {{ loading ? 'Loading...' : mode === 'signin' ? 'Sign in' : 'Sign up' }}
        </button>

        <p class="auth-view__switch">
          <template v-if="mode === 'signin'">
            Don't have an account?
            <button class="auth-view__switch-btn" @click="mode = 'signup'; error = null">
              Sign up
            </button>
          </template>
          <template v-else>
            Already have an account?
            <button class="auth-view__switch-btn" @click="mode = 'signin'; error = null">
              Sign in
            </button>
          </template>
        </p>
      </template>
    </div>
  </div>
</template>
