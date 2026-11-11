<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue';

const authStore = useAuthStore();
const router = useRouter();

const accountMenuOpen = ref(false);
const accountTriggerRef = ref<HTMLElement | null>(null);
const accountMenuRef = ref<HTMLElement | null>(null);
const accountMenuTop = ref(0);
const accountMenuRight = ref(0);

function updateAccountMenuPosition() {
  if (!accountTriggerRef.value) return;
  const rect = accountTriggerRef.value.getBoundingClientRect();
  accountMenuTop.value = rect.bottom + 8;
  accountMenuRight.value = window.innerWidth - rect.right;
}

async function toggleAccountMenu() {
  accountMenuOpen.value = !accountMenuOpen.value;
  if (accountMenuOpen.value) {
    await nextTick();
    updateAccountMenuPosition();
  }
}

function closeAccountMenu() {
  accountMenuOpen.value = false;
}

async function onSignOut(allDevices: boolean) {
  closeAccountMenu();
  // TODO: If allDevices is true, show confirmation dialog
  const success = await authStore.signOut(allDevices);
  if (success) {
    await router.push({ name: 'auth' });
    return;
  }
  // TODO: Show error
  console.error('Logout failed');
}

function onDocumentClick(event: MouseEvent) {
  if (!accountMenuOpen.value) return;
  const target = event.target as Node | null;
  if (!target) return;
  if (accountTriggerRef.value?.contains(target)) return;
  if (accountMenuRef.value?.contains(target)) return;
  closeAccountMenu();
}

function onWindowResizeOrScroll() {
  if (!accountMenuOpen.value) return;
  updateAccountMenuPosition();
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick);
  window.addEventListener('resize', onWindowResizeOrScroll);
  window.addEventListener('scroll', onWindowResizeOrScroll, true);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick);
  window.removeEventListener('resize', onWindowResizeOrScroll);
  window.removeEventListener('scroll', onWindowResizeOrScroll, true);
  closeAccountMenu();
});
</script>

<template>
  <button
    ref="accountTriggerRef"
    class="app-header__account-btn"
    type="button"
    :aria-expanded="accountMenuOpen"
    aria-haspopup="menu"
    aria-label="Open account menu"
    @click="toggleAccountMenu"
  >
    <img
      v-if="authStore.profile"
      class="app-header__account-avatar"
      :src="authStore.profile.picture"
      alt=""
      referrerpolicy="no-referrer"
    />
    <FaIcon v-else icon="fa-solid fa-user" />
  </button>

  <Teleport to="body">
    <div
      v-if="accountMenuOpen"
      ref="accountMenuRef"
      class="app-header__account-menu"
      role="menu"
      :style="{
        top: `${accountMenuTop}px`,
        right: `${accountMenuRight}px`,
      }"
    >
      <span class="app-header__account-menu__user">{{ authStore.profile?.username }}</span>
      <button class="app-header__account-menu__item" role="menuitem" @click="onSignOut(false)">
        {{ $t('auth.signOut') }}
      </button>
      <button class="app-header__account-menu__item" role="menuitem" @click="onSignOut(true)">
        {{ $t('auth.signOutAll') }}
      </button>
    </div>
  </Teleport>
</template>
