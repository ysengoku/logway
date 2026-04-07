<script setup lang="ts">
import type { UserForm } from '@shared/types/profile';

const props = defineProps<{
  modelValue: UserForm;
  authError?: { email: string | null; password: string | null; auth: string | null } | null;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: UserForm): void;
  (e: 'clearAuthError', field: 'email' | 'password' | 'auth'): void;
}>();

function updateField<UserFormKey extends keyof UserForm>(
  key: UserFormKey,
  value: UserForm[UserFormKey],
) {
  emit('update:modelValue', { ...props.modelValue, [key]: value });
  if (key === 'email') emit('clearAuthError', 'email');
  if (key === 'newPassword' || key === 'confirmNewPassword') {
    emit('clearAuthError', 'password');
  }
  if (key === 'email' || key === 'newPassword' || key === 'confirmNewPassword') {
    emit('clearAuthError', 'auth');
  }
}
</script>

<template>
  <section class="settings__card">
    <h2 class="section-title">
      {{ $t('auth.emailAddress') }}
    </h2>
    <div class="form-row">
      <label class="sr-only" for="email">
        {{ $t('auth.emailAddress') }}
      </label>
      <input
        id="email"
        type="email"
        :class="{'is_error': !!props.authError?.email}"
        :placeholder="$t('auth.emailAddress')"
        :value="props.modelValue.email"
        @input="updateField('email', ($event.target as HTMLInputElement)?.value)"
      />
    </div>

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
        :class="{'is_error': !!props.authError?.password}"
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
        :class="{'is_error': !!props.authError?.password}"
        :aria-invalid="!!props.authError?.password"
        :value="props.modelValue.confirmNewPassword"
        :placeholder="$t('auth.confirmNewPassword')"
        @input="updateField('confirmNewPassword', ($event.target as HTMLInputElement)?.value)"
      />
    </div>
  </section>
</template>
