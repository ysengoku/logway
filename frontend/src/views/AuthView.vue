<script setup lang="ts">
import { EMAIL_FORMAT_REGEX } from '@/constants/regex';
import FeedbackMessage from '@/components/FeedbackMessage.vue';
import { useAuthStore } from '@/stores/auth';
import { useLoadingStore } from '@/stores/loading';
import { validateDisplayName, validatePassword } from '@/validators';
import { computed, ref, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

const router = useRouter();
const authStore = useAuthStore();
const loadingStore = useLoadingStore();
const { t, te } = useI18n();

const mode = ref<'signin' | 'signup' | 'reset'>('signin');
const signUpDone = ref(false);
const resetDone = ref(false);

const form = reactive({
  email: '',
  displayName: '',
  password: '',
  passwordConfirm: '',
});

const errors = ref({
  email: null as string | null,
  displayName: null as string | null,
  password: null as string | null,
  general: null as string | null,
});

const errorMessages = computed(() =>
  Object.values(errors.value)
    .filter((e): e is string => e !== null)
    .map(resolveErrorMessage),
);

function resolveErrorMessage(key: string) {
  return te(key) ? t(key) : key;
}

function switchMode(newMode: 'signin' | 'signup' | 'reset') {
  mode.value = newMode;
  clearForm();
  clearErrors();
  signUpDone.value = false;
  resetDone.value = false;
}

function validateInput() {
  if (!form.email) {
    errors.value.email = 'auth.errors.emailRequired';
  } else if (!EMAIL_FORMAT_REGEX.test(form.email) || form.email.length > 254) {
    errors.value.email = 'auth.errors.invalidEmail';
  }

  if (mode.value === 'reset') {
    return;
  }

  // validate strong password

  if (mode.value === 'signin') {
    return;
  }

  if (mode.value === 'signup') {
    const passwordErrorKey = validatePassword(form.password, form.passwordConfirm, true);
    if (passwordErrorKey) {
      errors.value.password = `auth.errors.${passwordErrorKey}`;
    }

    const displayNameErrorKey = validateDisplayName(form.displayName);
    if (displayNameErrorKey) {
      errors.value.displayName = `settings.errors.${displayNameErrorKey}`;
    }
  }
}

function clearForm() {
  form.email = '';
  form.displayName = '';
  form.password = '';
  form.passwordConfirm = '';
}

function clearErrors() {
  errors.value.email = null;
  errors.value.displayName = null;
  errors.value.password = null;
  errors.value.general = null;
}

async function submit() {
  clearErrors();
  validateInput();
  if (Object.values(errors.value).some((error) => error !== null)) {
    return;
  }

  try {
    switch (mode.value) {
      case 'signin':
        await authStore.signIn(form.email, form.password);

        if (
          authStore.authError?.email ||
          authStore.authError?.password ||
          authStore.authError?.auth
        ) {
          errors.value.email = authStore.authError.email;
          errors.value.password = authStore.authError.password;
          errors.value.general = authStore.authError.auth;
          return;
        }

        router.push({ name: 'home' });
        break;
      case 'signup':
        await authStore.signUp(form.email, form.password, form.displayName);

        if (
          authStore.authError?.email ||
          authStore.authError?.password ||
          authStore.authError?.auth ||
          authStore.authError?.displayName
        ) {
          errors.value.email = authStore.authError.email;
          errors.value.displayName = authStore.authError.displayName ?? null;
          errors.value.password = authStore.authError.password;
          errors.value.general = authStore.authError.auth;
          return;
        }

        signUpDone.value = true;
        break;
      case 'reset':
        await authStore.resetPassword(form.email);

        if (
          authStore.authError?.email ||
          authStore.authError?.password ||
          authStore.authError?.auth
        ) {
          errors.value.email = authStore.authError.email;
          errors.value.password = authStore.authError.password;
          errors.value.general = authStore.authError.auth;
          return;
        }
        resetDone.value = true;
        break;
    }
  } catch (e) {
    errors.value.general = e instanceof Error ? e.message : 'common.unknownError';
  }
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
          <label>{{ $t('auth.email') }} *</label>
          <input
            v-model="form.email"
            type="email"
            :placeholder="$t('auth.placeholderEmail')"
            :class="{ is_error: !!errors.email }"
            @input="clearErrors"
          />
        </div>
        <template v-if="mode === 'signup'">
          <div class="form-row">
            <label>{{ $t('auth.displayName') }}</label>
            <input
              v-model="form.displayName"
              type="text"
              :placeholder="$t('auth.placeholderName')"
              :class="{ is_error: !!errors.displayName }"
              @input="clearErrors"
            />
          </div>
        </template>
        <template v-if="mode !== 'reset'">
          <div class="form-row">
            <label>{{ $t('auth.password') }} *</label>
            <input
              v-model="form.password"
              type="password"
              :placeholder="$t('auth.placeholderPassword')"
              :class="{ is_error: !!errors.password }"
              @input="clearErrors"
            />
          </div>
          <div v-if="mode === 'signup'" class="form-row">
            <label>{{ $t('auth.confirmPassword') }} *</label>
            <input
              v-model="form.passwordConfirm"
              type="password"
              :placeholder="$t('auth.placeholderRepeatPassword')"
              :class="{ is_error: !!errors.password }"
              @input="clearErrors"
            />
          </div>
        </template>

        <FeedbackMessage
          v-for="message in errorMessages"
          :key="message"
          :message="message"
          type="error"
        />

        <button class="auth-view__submit" :disabled="loadingStore.active" @click="submit">
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
