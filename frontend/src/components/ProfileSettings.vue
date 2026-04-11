<script setup lang="ts">
import { PROFILE_ICON_OPTIONS, getFaIcon } from '@/lib/faIcons';
import type { ProfileForm } from '@shared/types/profile';
import type { ProfileIconName } from '@shared/types/profileIcon';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps<{
  modelValue: ProfileForm;
  error?: { displayName: string | null; icon: string | null; profile: string | null } | null;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: ProfileForm): void;
  (e: 'clearProfileError', key: 'displayName' | 'icon' | 'profile'): void;
  (e: 'clearFeedback'): void;
}>();

function updateField<ProfileFormKey extends keyof ProfileForm>(
  key: ProfileFormKey,
  value: ProfileForm[ProfileFormKey],
) {
  emit('update:modelValue', { ...props.modelValue, [key]: value });
  emit('clearFeedback');

  if (key === 'displayName') {
    emit('clearProfileError', 'displayName');
    return;
  }
  if (key === 'icon' || key === 'iconColor' || key === 'iconBgColor') {
    emit('clearProfileError', 'icon');
  }
}

function selectIcon(icon: ProfileIconName) {
  updateField('icon', icon);
}

function formatIconName(icon: string) {
  return t(`icons.${icon}`);
}
</script>

<template>
  <section class="settings__card">
    <h2 class="section-title">Display Name</h2>
    <div class="form-row">
      <label for="settings-display-name" class="sr-only"> Update Display Name </label>
      <input
        :value="props.modelValue.displayName"
        type="text"
        :class="{ is_error: !!props.error?.displayName }"
        @input="updateField('displayName', ($event.target as HTMLInputElement).value)"
        :placeholder="'Display name'"
        id="settings-display-name"
      />
    </div>

    <h2 class="section-title">Profile Icon</h2>

    <div class="settings__preview">
      <div
        class="settings__preview-icon"
        :style="{
          color: props.modelValue.iconColor || '#EEECE9',
          backgroundColor: props.modelValue.iconBgColor || '#1B3A5C',
        }"
      >
        <FaIcon :icon="getFaIcon(props.modelValue.icon)" />
      </div>
    </div>

    <div class="settings__icon-grid">
      <button
        v-for="icon in PROFILE_ICON_OPTIONS"
        :key="icon"
        type="button"
        class="settings__icon-btn"
        :class="{ 'settings__icon-btn--active': props.modelValue.icon === icon }"
        :data-tooltip="formatIconName(icon)"
        :title="formatIconName(icon)"
        :aria-label="`Select ${formatIconName(icon)} icon`"
        @click="selectIcon(icon)"
      >
        <FaIcon :icon="getFaIcon(icon)" />
      </button>
    </div>

    <div class="settings__colors">
      <div class="settings__color-picker">
        <label for="icon-color-picker"> Color </label>
        <input
          id="icon-color-picker"
          :value="props.modelValue.iconColor"
          type="color"
          @input="updateField('iconColor', ($event.target as HTMLInputElement).value)"
          :aria-label="'Choose icon color'"
        />
      </div>
      <div class="settings__color-picker">
        <label for="icon-bg-color-picker"> Background </label>
        <input
          id="icon-bg-color-picker"
          :value="props.modelValue.iconBgColor"
          type="color"
          @input="updateField('iconBgColor', ($event.target as HTMLInputElement).value)"
          :aria-label="'Choose icon background color'"
        />
      </div>
    </div>
  </section>
</template>
