<script setup lang="ts">
import EmailChangeModal from '@/components/modals/EmailChangeModal.vue';
import FeedbackMessage from './FeedbackMessage.vue';
import PasswordField from './forms/PasswordField.vue';
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
  (e: 'clearAuthError', field: 'password'): void;
  (e: 'clearFeedback'): void;
}>();

function updateField<UserFormKey extends keyof UserForm>(
  key: UserFormKey,
  value: UserForm[UserFormKey],
) {
  emit('update:modelValue', { ...props.modelValue, [key]: value });
  if (key === 'newPassword' || key === 'confirmNewPassword') {
    emit('clearAuthError', 'password');
    emit('clearFeedback');
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
    <PasswordField
      :model-value="props.modelValue.newPassword"
      input-id="settings-new-password"
      :label="$t('auth.newPassword')"
      :placeholder="$t('auth.newPassword')"
      :has-error="!!props.authError?.password"
      :show-aria-label="'Show new password'"
      :hide-aria-label="'Hide new password'"
      autocomplete="new-password"
      @update:model-value="(value) => updateField('newPassword', value)"
    />

    <PasswordField
      :model-value="props.modelValue.confirmNewPassword"
      input-id="settings-confirm-password"
      :label="$t('auth.confirmNewPassword')"
      :placeholder="$t('auth.confirmNewPassword')"
      :has-error="!!props.authError?.password"
      :show-aria-label="'Show password confirmation'"
      :hide-aria-label="'Hide password confirmation'"
      autocomplete="new-password"
      @update:model-value="(value) => updateField('confirmNewPassword', value)"
    />
  </section>
</template>
