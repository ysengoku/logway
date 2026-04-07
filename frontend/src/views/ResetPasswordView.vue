<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { useLoadingStore } from '@/stores/loading';
import { ref, reactive } from 'vue';
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

async function submit() {
  error.value = null;

  if (form.password !== form.passwordConfirm) {
    error.value = t('auth.passwordsDoNotMatch');
    return;
  }

  try {
    await authStore.updateUserCredentials({ password: form.password });
    done.value = true;
    setTimeout(() => router.push({ name: 'auth' }), 2000);
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
        <div class="form-row">
          <label>{{ $t('auth.password') }}</label>
          <input v-model="form.password" type="password" :placeholder="$t('auth.placeholderPassword')" />
        </div>
        <div class="form-row">
          <label>{{ $t('auth.confirmPassword') }}</label>
          <input v-model="form.passwordConfirm" type="password" :placeholder="$t('auth.placeholderRepeatPassword')" />
        </div>

        <div v-if="error" class="auth-view__error">{{ error }}</div>

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
