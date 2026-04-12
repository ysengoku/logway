<script setup lang="ts">
import FeedbackMessage from '@/components/FeedbackMessage.vue';
import ProfileSettings from '@/components/ProfileSettings.vue';
import UserSettings from '@/components/UserSettings.vue';
import { useProfileStore } from '@/stores/profile';
import { useAuthStore } from '@/stores/auth';
import { validateDisplayName, validatePassword } from '@/validators';
import type { ProfileForm, UserForm } from '@shared/types/profile';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

const profileStore = useProfileStore();
const authStore = useAuthStore();
const { t, te } = useI18n();

type ProfilePayload = Parameters<typeof profileStore.updateProfile>[0];
type ErrorField = 'displayName' | 'icon' | 'profile' | 'password' | 'auth';

const profileForm = ref<ProfileForm>({
  displayName: profileStore.profile?.display_name ?? '',
  icon: profileStore.profile?.icon ?? 'cat',
  iconColor: profileStore.profile?.icon_color ?? '#EEECE9',
  iconBgColor: profileStore.profile?.icon_bg_color ?? '#1B3A5C',
});

const userForm = ref<UserForm>({
  email: authStore.user?.email ?? '',
  newPassword: '',
  confirmNewPassword: '',
});

const updateSuccess = ref({ profile: false, user: false });
const emailChangePending = ref(false);

const initialProfileForm = Object.assign({ ...profileForm.value });

function buildProfilePayload(): ProfilePayload {
  const changes: ProfilePayload = {};

  if (profileForm.value.displayName !== initialProfileForm.displayName) {
    changes.display_name = profileForm.value.displayName;
  }

  if (profileForm.value.icon !== initialProfileForm.icon) {
    changes.icon = profileForm.value.icon;
  }

  if (profileForm.value.iconColor !== initialProfileForm.iconColor) {
    changes.icon_color = profileForm.value.iconColor;
  }

  if (profileForm.value.iconBgColor !== initialProfileForm.iconBgColor) {
    changes.icon_bg_color = profileForm.value.iconBgColor;
  }

  return changes;
}

function clearPasswordFields() {
  userForm.value.newPassword = '';
  userForm.value.confirmNewPassword = '';
}

function clearErrorField(field: ErrorField) {
  const currentError = {
    displayName: profileStore.error.displayName,
    icon: profileStore.error.icon,
    profile: profileStore.error.profile,
    password: authStore.authError.password,
    auth: authStore.authError.auth,
  };

  if (!currentError[field]) {
    return;
  }

  currentError[field] = null;
  if (field === 'password') {
    authStore.setAuthError(null, currentError.password, currentError.auth);
  } else {
    profileStore.setProfileError(currentError.displayName, currentError.icon, currentError.profile);
  }
}

function clearSuccessFeedback() {
  updateSuccess.value = { profile: false, user: false };
}

function resolveErrorMessage(key: string) {
  if (te(key)) {
    return t(key);
  }

  const i18nKey = `settings.errors.${key}`;
  return te(i18nKey) ? t(i18nKey) : key;
}

const errorMessages = computed(() => {
  const keys = [
    profileStore.error.displayName,
    profileStore.error.icon,
    profileStore.error.profile,
    authStore.authError.password,
    authStore.authError.auth,
  ].filter((key): key is string => Boolean(key));

  return keys.map(resolveErrorMessage);
});

const hasChanges = computed(() => {
  const hasProfileChanges = Object.keys(buildProfilePayload()).length > 0;
  const hasPasswordChanges =
    Boolean(userForm.value.newPassword) || Boolean(userForm.value.confirmNewPassword);

  return hasProfileChanges || hasPasswordChanges;
});

async function updateProfile(): Promise<void> {
  const profilePayload: ProfilePayload = buildProfilePayload();
  if (Object.keys(profilePayload).length === 0) {
    updateSuccess.value.profile = true;
    return;
  }

  if (profilePayload.display_name !== undefined) {
    const displayNameErrorKey = validateDisplayName(profilePayload.display_name);
    if (displayNameErrorKey) {
      profileStore.setProfileError(displayNameErrorKey, null, null);
      return;
    }
  }

  await profileStore.updateProfile(profilePayload);
}

async function updatePassword(): Promise<void> {
  if (!userForm.value.newPassword && !userForm.value.confirmNewPassword) {
    updateSuccess.value.user = true;
    return;
  }

  const passwordErrorKey = validatePassword(
    userForm.value.newPassword,
    userForm.value.confirmNewPassword,
    true,
  );
  if (passwordErrorKey) {
    authStore.setAuthError(null, `auth.errors.${passwordErrorKey}`);
    return;
  }
  const authUpdated = await authStore.updatePassword(userForm.value.newPassword);
  if (authUpdated) {
    updateSuccess.value.user = true;
  }
}

async function submitChanges() {
  if (!hasChanges.value) {
    return;
  }

  updateSuccess.value = { profile: false, user: false };
  authStore.setAuthError(null, null, null);
  profileStore.setProfileError(null, null, null);
  emailChangePending.value = false;

  const [profileResult] = await Promise.allSettled([updateProfile(), updatePassword()]);

  const isProfileSaved =
    profileResult.status === 'fulfilled' &&
    !profileStore.error.displayName &&
    !profileStore.error.icon &&
    !profileStore.error.profile;
  if (isProfileSaved) {
    Object.assign(initialProfileForm, profileForm.value);
    updateSuccess.value.profile = true;
  }

  clearPasswordFields();
}
</script>

<template>
  <main class="settings">
    <h1 class="page-title">{{ $t('settings.settings') }}</h1>
    <ProfileSettings
      v-model="profileForm"
      :error="profileStore.error"
      @clear-profile-error="clearErrorField"
      @clear-feedback="clearSuccessFeedback"
    />
    <UserSettings
      v-model="userForm"
      :auth-error="authStore.authError"
      @clear-auth-error="clearErrorField"
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
        v-if="updateSuccess.user && updateSuccess.profile && errorMessages.length === 0"
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
