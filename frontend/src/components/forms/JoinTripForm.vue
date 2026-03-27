<script setup lang="ts">
import { reactive } from 'vue';
import { useI18n } from 'vue-i18n';

defineProps<{
  message?: string | null;
}>();

const emit = defineEmits<{
  submit: [inviteCode: string];
  cancel: [];
}>();

const { t } = useI18n();
const form = reactive({
  invite_code: '',
});

function submit() {
  const inviteCode = form.invite_code.trim().toUpperCase();
  if (!inviteCode) {
    alert(t('join.inviteCodeRequired'));
    return;
  }
  emit('submit', inviteCode);
}
</script>

<template>
  <div class="new-trip-form">
    <div v-if="message" class="home__state">{{ message }}</div>

    <div class="form-row">
      <label>{{ $t('join.inviteCodeLabel') }}</label>
      <input
        v-model="form.invite_code"
        type="text"
        :placeholder="$t('join.inviteCodePlaceholder')"
        maxlength="8"
      />
    </div>

    <div class="new-trip-form__actions">
      <button class="button-secondary" @click="emit('cancel')">{{ $t('common.cancel') }}</button>
      <button class="button-primary" @click="submit">{{ $t('join.join') }}</button>
    </div>
  </div>
</template>
