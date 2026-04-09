<script setup lang="ts">
import EmailChangeModal from '@/components/modals/EmailChangeModal.vue';
import FeedbackMessage from './FeedbackMessage.vue';
import { getFaIcon } from '@/lib/faIcons';
import { useAuthStore } from '@/stores/auth';
import type { UserForm } from '@shared/types/profile';
import { ref } from 'vue';

const props = defineProps<{
  modelValue: UserForm;
  authError?: { email: string | null; password: string | null; auth: string | null } | null;
}>();

const authStore = useAuthStore();

const isEmailEditorOpen = ref(false);
const isEmailChangePending = ref(false);

const emit = defineEmits<{
  (e: 'update:modelValue', value: UserForm): void;
  (e: 'clearAuthError', field: 'password' | 'auth'): void;
}>();

function updateField<UserFormKey extends keyof UserForm>(
  key: UserFormKey,
  value: UserForm[UserFormKey],
) {
  emit('update:modelValue', { ...props.modelValue, [key]: value });
  if (key === 'newPassword' || key === 'confirmNewPassword') {
    emit('clearAuthError', 'password');
  }
  if (key === 'newPassword' || key === 'confirmNewPassword') {
    emit('clearAuthError', 'auth');
  }
}

function openEmailEditor() {
  isEmailChangePending.value = false;
  isEmailEditorOpen.value = true;
}
</script>

<template>
  <section class="settings__card">
    <h2 class="section-title">
      {{ $t('auth.emailAddress') }}
    </h2>
    <div class="settings__email-display">
      <span class="settings__email-value">{{
        authStore.user?.email ?? props.modelValue.email
      }}</span>
      <button
        type="button"
        class="button-secondary settings__email-edit-btn"
        :disabled="isEmailChangePending"
        @click="openEmailEditor"
      >
        {{ $t('auth.changeEmail') }}
        <FaIcon :icon="getFaIcon('pen')" />
      </button>
    </div>

    <EmailChangeModal
      :open="isEmailEditorOpen"
      :current-email="authStore.user?.email ?? props.modelValue.email"
      @close="isEmailEditorOpen = false"
      @pending="isEmailChangePending = true"
    />

    <FeedbackMessage
      v-if="isEmailChangePending"
      :message="$t('settings.emailChangePending')"
      :type="'info'"
    />

    <h2 class="section-title">
      {{ $t('auth.password') }}
    </h2>
    <div class="form-row">
      <label for="newPassword">
        {{ $t('auth.newPassword') }}
      </label>
      <input
        id="newPassword"
        type="password"
        :class="{ is_error: !!props.authError?.password }"
        :aria-invalid="!!props.authError?.password"
        :placeholder="$t('auth.newPassword')"
        :value="props.modelValue.newPassword"
        @input="updateField('newPassword', ($event.target as HTMLInputElement)?.value)"
      />
    </div>
    <div class="form-row">
      <label for="confirmPassword">
        {{ $t('auth.confirmNewPassword') }}
      </label>
      <input
        id="confirmPassword"
        type="password"
        :class="{ is_error: !!props.authError?.password }"
        :aria-invalid="!!props.authError?.password"
        :value="props.modelValue.confirmNewPassword"
        :placeholder="$t('auth.confirmNewPassword')"
        @input="updateField('confirmNewPassword', ($event.target as HTMLInputElement)?.value)"
      />
    </div>
  </section>
</template>
