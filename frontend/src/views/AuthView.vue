<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const mode = ref<'signin' | 'signup' | 'reset' >('signin');
const loading = ref(false);
const error = ref<string | null>(null);
const signUpDone = ref(false);
const resetDone = ref(false);

const form = reactive({
  email: '',
  displayName: '',
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
    switch (mode.value) {
      case 'signin':
        await authStore.signIn(form.email, form.password);
        router.push({ name: 'home' });
        break;
      case 'signup':
        await authStore.signUp(form.email, form.password, form.displayName);
        signUpDone.value = true;
        break;
      case 'reset':
        await authStore.resetPassword(form.email);
        resetDone.value = true;
        break;
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'An error occurred.';
  } finally {
    loading.value = false;
  }
}

function switchMode(newMode: 'signin' | 'signup' | 'reset') {
  mode.value = newMode;
  error.value = null;
  signUpDone.value = false;
  resetDone.value = false;
}
</script>

<template>
  <div class="auth-view">
    <div class="auth-view__card">
      <h2 class="auth-view__title">
        <template v-if="mode === 'signin'">{{ $t('auth.signIn') }}</template>
        <template v-else-if="mode === 'signup'">{{ $t('auth.signUp') }}</template>
        <template v-else>{{ $t('auth.resetPassword') }}</template>
      </h2>

      <div v-if="signUpDone" class="auth-view__success">
        {{ $t('auth.emailConfirmationInstructions') }}
      </div>
      <div v-else-if="resetDone" class="auth-view__success">
        {{ $t('auth.resetPasswordInstructions') }}
        <button class="auth-view__switch-btn" @click="switchMode('signin')">
          {{ $t('common.backToSignIn') }}
        </button>
      </div>

      <template v-else>
        <div class="form-row">
          <label>{{ $t('auth.email') }}</label>
          <input v-model="form.email" type="email" :placeholder="$t('auth.placeholderEmail')" />
        </div>
        <template v-if="mode === 'signup'">
          <div class="form-row">
            <label>{{ $t('auth.displayName') }}</label>
            <input v-model="form.displayName" type="text" :placeholder="$t('auth.placeholderName')" />
          </div>
        </template>
        <template v-if="mode !== 'reset'">
          <div class="form-row">
            <label>{{ $t('auth.password') }}</label>
            <input v-model="form.password" type="password" :placeholder="$t('auth.placeholderPassword')" />
          </div>
          <div v-if="mode === 'signup'" class="form-row">
            <label>{{ $t('auth.confirmPassword') }}</label>
            <input
              v-model="form.passwordConfirm"
              type="password"
              :placeholder="$t('auth.placeholderRepeatPassword')"
              :class="{ 'auth-view__input--error': passwordMismatch }"
            />
            <span v-if="passwordMismatch" class="auth-view__field-error">
              {{ $t('auth.passwordsDoNotMatch') }}
            </span>
          </div>
        </template>

        <div v-if="error" class="auth-view__error">{{ error }}</div>

        <button
          class="auth-view__submit"
          :disabled="loading || passwordMismatch"
          @click="submit"
        >
          <template v-if="mode === 'signin'">{{ $t('auth.signIn') }}</template>
          <template v-else-if="mode === 'signup'">{{ $t('auth.signUp') }}</template>
          <template v-else>{{ $t('auth.resetPassword') }}</template>
        </button>

        <p class="auth-view__links">
          <template v-if="mode === 'signin'">
            <p class="auth-view__switch">
              <button class="auth-view__switch-btn" @click="switchMode('reset')">
                {{ $t('auth.resetPassword') }}
              </button>
            </p>
            <p class="auth-view__switch">
                {{ $t('auth.dontHaveAccount') }}
              <button class="auth-view__switch-btn" @click="switchMode('signup')">
                {{ $t('auth.signUp') }}
              </button>
            </p>
          </template>
          <template v-else>
            <p class="auth-view__switch">
              <button class="auth-view__switch-btn" @click="switchMode('signin')">
                {{ $t('auth.signIn') }}
              </button>
            </p>
          </template>
        </p>
      </template>
    </div>
  </div>
</template>
