<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useMembersStore } from '@/stores/members';
import { useAuthStore } from '@/stores/auth';
import { profilesApi } from '@/api/client';
import type { Profile } from '@shared/types/profile';

const props = defineProps<{
  tripId: string;
  ownerId?: string;
}>();

const membersStore = useMembersStore();
const authStore = useAuthStore();
const inviteEmail = ref('');
const inviting = ref(false);
const error = ref<string | null>(null);
const success = ref<string | null>(null);
const profiles = ref<Profile[]>([]);

const isOwner = computed(() => authStore.user?.id === props.ownerId);

function getDisplayName(userId: string): string {
  return profiles.value.find((p) => p.id === userId)?.display_name ?? userId;
}

onMounted(async () => {
  await membersStore.fetchByTrip(props.tripId);
  if (membersStore.members.length > 0) {
    const userIds = membersStore.members.map((m) => m.user_id);
    profiles.value = await profilesApi.getByIds(userIds);
  }
});

async function invite() {
  if (!inviteEmail.value) return;
  error.value = null;
  success.value = null;
  inviting.value = true;
  try {
    console.log(1);
    await membersStore.invite(props.tripId, inviteEmail.value);
    console.log(2);
    success.value = `Invitation sent to ${inviteEmail.value}.`;
    inviteEmail.value = '';
    await membersStore.fetchByTrip(props.tripId);
    const userIds = membersStore.members.map((m) => m.user_id);
    profiles.value = await profilesApi.getByIds(userIds);
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to invite member.';
  } finally {
    inviting.value = false;
  }
}

async function remove(userId: string) {
  if (!confirm('Remove this member?')) return;
  await membersStore.remove(props.tripId, userId);
}
</script>

<template>
  <div class="trip-members">
    <div class="trip-members__title">Members</div>
    <div class="trip-members__list">
      <div
        v-for="member in membersStore.members"
        :key="member.id"
        class="trip-members__item"
      >
        <div class="trip-members__item-info">
          <span class="trip-members__role" :class="`trip-members__role--${member.role}`">
            {{ member.role }}
          </span>
          <span class="trip-members__name">{{ getDisplayName(member.user_id) }}</span>
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
      <div class="form-row">
        <label>Invite by email</label>
        <div class="trip-members__invite-row">
          <input
            v-model="inviteEmail"
            type="email"
            placeholder="friend@example.com"
            @keyup.enter="invite"
          />
          <button
            class="trip-members__invite-btn"
            :disabled="inviting || !inviteEmail"
            @click="invite"
          >
            {{ inviting ? '...' : 'Invite' }}
          </button>
        </div>
      </div>
      <p v-if="success" class="trip-members__success">{{ success }}</p>
      <p v-if="error" class="trip-members__error">{{ error }}</p>
    </div>
  </div>
</template>
