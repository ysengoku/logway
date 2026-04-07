<script setup lang="ts">
import ErrorMessage from '@/components/ErrorMessage.vue';
import ProfileSettings from '@/components/ProfileSettings.vue';
import UserSettings from '@/components/UserSettings.vue';
import { useProfileStore } from '@/stores/profile';
import { useAuthStore } from '@/stores/auth';
import type { ProfileForm, UserForm } from '@shared/types/profile';
import { ref } from 'vue';

const profileStore = useProfileStore();
const authStore = useAuthStore();

type ProfilePayload = Parameters<typeof profileStore.updateProfile>[0];
type UserCredentialsPayload = Parameters<typeof authStore.updateUserCredentials>[0];
type ErrorField = 'displayName' | 'icon' | 'profile' | 'email' | 'password' | 'auth';

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

const initialProfileForm = Object.assign({ ...profileForm.value });
const initialUserForm = Object.assign({ ...userForm.value });

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

function validatePassword(): { valid: boolean; message?: string } {
  if (
    (userForm.value.newPassword && !userForm.value.confirmNewPassword) ||
    (!userForm.value.newPassword && userForm.value.confirmNewPassword)
  ) {
    return {
      valid: false,
      message: 'Both new password and confirmation are required to change password.',
    };
  }

  if (userForm.value.newPassword !== userForm.value.confirmNewPassword) {
    return {
      valid: false,
      message: 'New password and confirmation do not match.',
    };
  }

  return { valid: true };
}

function clearPasswordFields() {
  userForm.value.newPassword = '';
  userForm.value.confirmNewPassword = '';
  initialUserForm.newPassword = '';
  initialUserForm.confirmNewPassword = '';
}

function clearErrorField(field: ErrorField) {
  const currentError = {
    displayName: profileStore.error.displayName,
    icon: profileStore.error.icon,
    profile: profileStore.error.profile,
    email: authStore.authError.email,
    password: authStore.authError.password,
    auth: authStore.authError.auth,
  };

  if (!currentError[field]) {
    return;
  }

  currentError[field] = null;
  if (field === 'email' || field === 'password' || field === 'auth') {
    authStore.setAuthError(currentError.email, currentError.password, currentError.auth);
  } else {
    profileStore.setProfileError(currentError.displayName, currentError.icon, currentError.profile);
  }
}

async function updateProfile(): Promise<void> {
  const profilePayload: ProfilePayload = buildProfilePayload();
  if (Object.keys(profilePayload).length === 0) {
    return;
  }

  await profileStore.updateProfile(profilePayload);
}

async function updateUserCredentials(): Promise<void> {
  const authPayload: UserCredentialsPayload = {};

  if (userForm.value.email !== initialUserForm.email) {
    authPayload.email = userForm.value.email;
  }

  if (userForm.value.newPassword || userForm.value.confirmNewPassword) {
    const passwordValidation = validatePassword();
    if (!passwordValidation.valid) {
      authStore.setAuthError(null, passwordValidation.message || 'Password validation failed.');
      return;
    }
    authPayload.password = userForm.value.newPassword;
  }

  if (Object.keys(authPayload).length === 0) {
    return;
  }

  await authStore.updateUserCredentials(authPayload);
}

async function submitChanges() {
  const [profileResult, authResult] = await Promise.allSettled([
    updateProfile(),
    updateUserCredentials(),
  ]);

  const isProfileSaved =
    profileResult.status === 'fulfilled' &&
    !profileStore.error.displayName &&
    !profileStore.error.icon &&
    !profileStore.error.profile;
  const isAuthSaved =
    authResult.status === 'fulfilled' &&
    !authStore.authError.email &&
    !authStore.authError.password &&
    !authStore.authError.auth;

  isProfileSaved && Object.assign(initialProfileForm, profileForm.value);
  isAuthSaved && Object.assign(initialUserForm, userForm.value);
  clearPasswordFields();
}
</script>

<template>
  <main class="settings">
    <h1 class="page-title">Settings</h1>
    <ProfileSettings
      v-model="profileForm"
      :error="profileStore.error"
      @clear-profile-error="clearErrorField"
    />
    <UserSettings
      v-model="userForm"
      :auth-error="authStore.authError"
      @clear-auth-error="clearErrorField"
    />

    <div class="settings__card">
      <ErrorMessage v-if="profileStore.error.displayName" :message="profileStore. error.displayName" />
      <ErrorMessage v-if="profileStore.error.icon" :message="profileStore.error.  icon" />
      <ErrorMessage v-if="profileStore.error.profile" :message="profileStore.error. profile" />
      <ErrorMessage v-if="authStore.authError.email" :message="authStore.authError. email" />
      <ErrorMessage v-if="authStore.authError.password" :message="authStore.  authError.password" />
      <ErrorMessage v-if="authStore.authError.auth" :message="authStore.authError.auth" />
    </div>

    <div class="settings__button-wrapper">
      <button class="settings__submit-btn button-primary" type="submit" @click.stop="submitChanges">
        {{ $t('common.saveChanges') }}
      </button>
    </div>
  </main>
</template>
  