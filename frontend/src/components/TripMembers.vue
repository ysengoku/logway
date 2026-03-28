<script setup lang="ts">
import AppIcon from './AppIcon.vue';
import { useMembersStore } from '@/stores/members';
import { useAuthStore } from '@/stores/auth';
import { profilesApi } from '@/api/client';
import type { Profile } from '@shared/types/profile';
import type { Trip } from '@shared/types/trip';
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps<{
  trip: Trip;
}>();

const membersStore = useMembersStore();
const authStore = useAuthStore();
const error = ref<string | null>(null);
const success = ref<string | null>(null);
const profiles = ref<Profile[]>([]);

const isOwner = computed(() => authStore.user?.id === props.trip.owner_id);
const { t } = useI18n();

function getDisplayName(userId: string): string {
  return profiles.value.find((p) => p.id === userId)?.display_name ?? userId;
}

onMounted(async () => {
  await membersStore.fetchByTrip(props.trip.id);
  if (membersStore.members.length > 0) {
    const userIds = membersStore.members.map((m) => m.user_id);
    profiles.value = await profilesApi.getByIds(userIds);
  }
});

async function remove(userId: string) {
  if (!confirm(t('trip.members.removeConfirm'))) return;
  await membersStore.remove(props.trip.id, userId);
}

async function copyCodeToClipboard() {
  navigator.clipboard.writeText(props.trip.invite_code)
    .then(() => {
      success.value = t('trip.members.inviteCopied');
      setTimeout(() => success.value = null, 3000);
    })
    .catch(() => {
      error.value = t('trip.members.inviteCopyFailed');
      setTimeout(() => error.value = null, 3000);
    });
}
</script>

<template>
  <div class="trip-members">
    <h2 class="trip-members__title">{{ $t('trip.members.members') }}</h2>
    <div class="trip-members__list">
      <div
        v-for="member in membersStore.members"
        :key="member.id"
        class="trip-members__item"
      >
        <div class="trip-members__item-info">
          <span class="trip-members__name">
            {{ getDisplayName(member.user_id) }}
          </span>
          <span v-if="member.role === 'owner'" class="trip-members__role">
            {{ member.role }}
          </span>
        </div>
        <button
          v-if="isOwner && member.role !== 'owner'"
          class="trip-members__remove-btn"
          @click="remove(member.user_id)"
        >
          ✕
        </button>
      </div>
    </div>

    <div v-if="isOwner" class="trip-members__invite">
      <div class="trip-members__invite-code-label">{{ $t('trip.members.inviteShareLabel') }}</div>
      <div class="trip-members__invite-code">
        <span class="trip-members__invite-code-value">{{ props.trip.invite_code }}</span>
        <button @click="copyCodeToClipboard" class="trip-members__invite-code-copy" :title="$t('trip.members.copyInviteTitle')">
          <AppIcon name="copy" :size="16" />
        </button>
      </div>
      <p v-if="success" class="trip-members__success">{{ success }}</p>
      <p v-if="error" class="trip-members__error">{{ error }}</p> 

      <!-- <div class="form-row">
        <label>Send the code</label>
        <div class="trip-members__invite-row">
          <input
            type="email"
            v-model="inviteEmail"
            placeholder="friend@example.com"
          />
          <button @click="invite" :disabled="inviting || !inviteEmail">
            Send
          </button>
        </div>
      </div> -->
    </div>
  </div>
</template>
