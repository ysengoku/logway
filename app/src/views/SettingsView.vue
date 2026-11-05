<script setup lang="ts">
import FeedbackMessage from '@/components/FeedbackMessage.vue';
import UserSettings from '@/components/UserSettings.vue';
import { useAuthStore } from '@/stores/auth';
import { validatePassword } from '@/validators';
import type { UserForm } from '@/shared/types/user';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

const authStore = useAuthStore();
const { t, te } = useI18n();

const userForm = ref<UserForm>({
  email: authStore.user?.email ?? '',
  newPassword: '',
  confirmNewPassword: '',
});

const updateSuccess = ref(false);

function clearPasswordFields() {
  userForm.value.newPassword = '';
  userForm.value.confirmNewPassword = '';
}

function clearPasswordError() {
  if (authStore.authError.password) {
    authStore.setAuthError(null, null, authStore.authError.auth);
  }
}

function clearSuccessFeedback() {
  updateSuccess.value = false;
}

const errorMessages = computed(() =>
  [authStore.authError.password, authStore.authError.auth]
    .filter((key): key is string => Boolean(key))
    .map((key) => (te(key) ? t(key) : key)),
);

const hasChanges = computed(
  () => Boolean(userForm.value.newPassword) || Boolean(userForm.value.confirmNewPassword),
);

async function updatePassword(): Promise<void> {
  const passwordErrorKey = validatePassword(
    userForm.value.newPassword,
    userForm.value.confirmNewPassword,
    true,
  );
  if (passwordErrorKey) {
    authStore.setAuthError(null, `auth.errors.${passwordErrorKey}`);
    return;
  }
  updateSuccess.value = await authStore.updatePassword(userForm.value.newPassword);
}

async function submitChanges() {
  if (!hasChanges.value) {
    return;
  }

  updateSuccess.value = false;
  authStore.setAuthError(null, null, null);

  await updatePassword();

  clearPasswordFields();
}
</script>

<template>
  <main class="settings">
    <h1 class="page-title">{{ $t('settings.settings') }}</h1>
    <UserSettings
      v-model="userForm"
      :auth-error="authStore.authError"
      @clear-auth-error="clearPasswordError"
      @clear-feedback="clearSuccessFeedback"
    />

    <div class="settings__card">
      <FeedbackMessage
        v-for="message in errorMessages"
        :key="message"
        :message="message"
        :type="'error'"
      />
      <FeedbackMessage
        v-if="updateSuccess && errorMessages.length === 0"
        class="success-message"
        :message="$t('settings.updateSuccess')"
        :type="'success'"
      />
    </div>

    <div class="settings__button-wrapper">
      <button
        class="settings__submit-btn button-primary"
        type="submit"
        :disabled="!hasChanges"
        @click.stop="submitChanges"
      >
        {{ $t('common.saveChanges') }}
      </button>
    </div>
  </main>
</template>
