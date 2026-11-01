<script setup lang="ts">
import AppModal from '@/components/AppModal.vue';
import { EMAIL_FORMAT_REGEX } from '@/constants/regex';
import FeedbackMessage from '../FeedbackMessage.vue';
import { useAuthStore } from '@/stores/auth';
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps<{
  open: boolean;
  currentEmail: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'pending'): void;
}>();

const authStore = useAuthStore();
const { t, te } = useI18n();
const emailDraft = ref('');
const isSubmitting = ref(false);
const submitted = ref(false);
const errorMessage = ref<string | null>(null);

watch(
  () => props.open,
  (open) => {
    if (!open) {
      return;
    }
    emailDraft.value = '';
    errorMessage.value = null;
    submitted.value = false;
  },
);

function closeModal() {
  emit('close');
}

function validateEmailDraft(nextEmail: string): string | null {
  if (!nextEmail) {
    return t('auth.errors.emailRequired');
  }

  if (!EMAIL_FORMAT_REGEX.test(nextEmail) || nextEmail.length > 254) {
    return t('auth.errors.invalidEmail');
  }

  if (nextEmail.toLowerCase() === props.currentEmail.trim().toLowerCase()) {
    return t('auth.errors.sameEmail');
  }

  return null;
}

async function submitEmailChange() {
  const nextEmail = emailDraft.value.trim();
  const validationError = validateEmailDraft(nextEmail);

  if (validationError) {
    errorMessage.value = validationError;
    return;
  }

  isSubmitting.value = true;
  errorMessage.value = null;

  try {
    const result = await authStore.requestEmailChange(nextEmail);

    if (result.status === 'pending') {
      emit('pending');
      submitted.value = true;
      return;
    }

    const rawError = result.emailError ?? result.authError;
    errorMessage.value = rawError ? (te(rawError) ? t(rawError) : rawError) : null;
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <Teleport to="body">
    <AppModal :open="open" :title="$t('auth.emailAddress')" @close="closeModal">
      <div v-if="!submitted" class="settings__email-modal-body">
        <div class="form-row">
          <label for="newEmail">
            {{ $t('auth.newEmail') }}
          </label>
          <input
            id="newEmail"
            type="email"
            :class="{ is_error: !!errorMessage }"
            :placeholder="$t('auth.newEmail')"
            @input="emailDraft = ($event.target as HTMLInputElement)?.value"
          />
        </div>
        <FeedbackMessage v-if="errorMessage" :message="errorMessage" :type="'error'" />
        <div class="settings__email-actions">
          <button
            type="button"
            class="button-primary"
            :disabled="isSubmitting"
            @click="submitEmailChange"
          >
            {{ $t('common.save') }}
          </button>
          <button
            type="button"
            class="button-secondary"
            :disabled="isSubmitting"
            @click="closeModal"
          >
            {{ $t('common.cancel') }}
          </button>
        </div>
      </div>

      <div v-else class="settings__email-modal-body">
        <FeedbackMessage :message="$t('settings.emailChangePending')" :type="'info'" />
        <button type="button" class="button-primary settings__modal-close-btn" @click="closeModal">
          {{ $t('common.close') }}
        </button>
      </div>
    </AppModal>
  </Teleport>
</template>
