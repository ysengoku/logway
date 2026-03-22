<script setup lang="ts">
import { reactive } from 'vue';

defineProps<{
  message?: string | null;
}>();

const emit = defineEmits<{
  submit: [inviteCode: string];
  cancel: [];
}>();

const form = reactive({
  invite_code: '',
});

function submit() {
  const inviteCode = form.invite_code.trim().toUpperCase();
  if (!inviteCode) {
    alert('Invite code is required.');
    return;
  }
  emit('submit', inviteCode);
}
</script>

<template>
  <div class="new-trip-form">
    <div v-if="message" class="home__state">{{ message }}</div>

    <div class="form-row">
      <label>Invite Code *</label>
      <input
        v-model="form.invite_code"
        type="text"
        placeholder="e.g. A1B2C3D4"
        maxlength="8"
      />
    </div>

    <div class="new-trip-form__actions">
      <button class="button-secondary" @click="emit('cancel')">Cancel</button>
      <button class="button-primary" @click="submit">Join</button>
    </div>
  </div>
</template>
