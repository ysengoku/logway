<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { supabase } from '@/lib/supabase';

const router = useRouter();
const loading = ref(false);
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

  loading.value = true;
  try {
    const { error: err } = await supabase.auth.updateUser({ password: form.password });
    if (err) throw err;
    done.value = true;
    setTimeout(() => router.push({ name: 'auth' }), 2000);
  } catch (e) {
    error.value = e instanceof Error ? e.message : t('common.errorOccurred');
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="auth-view">
    <div class="auth-view__card">
      <h2 class="auth-view__title">{{ $t('reset.newPasswordTitle') }}</h2>

      <div v-if="done" class="auth-view__success">
        {{ $t('reset.passwordUpdated') }}
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
          :disabled="loading"
          @click="submit"
        >
          {{ loading ? $t('common.loading') : $t('reset.updatePassword') }}
        </button>
      </template>
    </div>
  </div>
</template>
