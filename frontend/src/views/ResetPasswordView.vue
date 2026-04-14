<script setup lang="ts">
import FeedbackMessage from '@/components/FeedbackMessage.vue';
import PasswordField from '@/components/forms/PasswordField.vue';
import { useAuthStore } from '@/stores/auth';
import { useLoadingStore } from '@/stores/loading';
import { validatePassword } from '@/validators';
import { ref, reactive, onBeforeUnmount } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

const router = useRouter();
const authStore = useAuthStore();
const loadingStore = useLoadingStore();
const error = ref<string | null>(null);
const done = ref(false);
const { t } = useI18n();

const form = reactive({
  password: '',
  passwordConfirm: '',
});

let redirectTimeoutId: number | undefined;

onBeforeUnmount(() => {
  if (redirectTimeoutId !== undefined) {
    window.clearTimeout(redirectTimeoutId);
  }
});

async function submit() {
  error.value = null;

  const passwordErrorKey = validatePassword(form.password, form.passwordConfirm, true);
  if (passwordErrorKey) {
    error.value = t(`auth.errors.${passwordErrorKey}`);
    return;
  }

  try {
    await authStore.updatePassword(form.password);
    done.value = true;
    if (redirectTimeoutId !== undefined) {
      window.clearTimeout(redirectTimeoutId);
    }
    redirectTimeoutId = window.setTimeout(() => {
      router.push({ name: 'auth' });
    }, 2000);
  } catch (e) {
    error.value = e instanceof Error ? e.message : t('common.errorOccurred');
  }
}
</script>

<template>
  <div class="auth-view">
    <div class="auth-view__card">
      <h2 class="auth-view__title">{{ $t('auth.newPasswordTitle') }}</h2>

      <div v-if="done" class="auth-view__success">
        {{ $t('auth.passwordUpdated') }}
      </div>

      <template v-else>
        <PasswordField
          v-model="form.password"
          input-id="reset-password"
          :label="`${$t('auth.password')} *`"
          :placeholder="$t('auth.placeholderPassword')"
          :has-error="!!error"
          :show-aria-label="$t('auth.showPassword')"
          :hide-aria-label="$t('auth.hidePassword')"
          autocomplete="new-password"
        />
        <PasswordField
          v-model="form.passwordConfirm"
          input-id="reset-password-confirm"
          :label="`${$t('auth.confirmPassword')} *`"
          :placeholder="$t('auth.placeholderRepeatPassword')"
          :has-error="!!error"
          :show-aria-label="$t('auth.showPasswordConfirmation')"
          :hide-aria-label="$t('auth.hidePasswordConfirmation')"
          autocomplete="new-password"
        />

        <FeedbackMessage v-if="error" :message="error" :type="'error'" />

        <button
          class="auth-view__submit"
          :disabled="loadingStore.active"
          @click="submit"
        >
          {{ $t('auth.updatePassword') }}
        </button>
      </template>
    </div>
  </div>
</template>
