<script setup lang="ts">
import { useProfileStore } from '@/stores/profile';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';

const profileStore = useProfileStore();
const authStore = useAuthStore();
const router = useRouter();

const accountMenuOpen = ref(false);
const accountTriggerRef = ref<HTMLElement | null>(null);
const accountMenuRef = ref<HTMLElement | null>(null);
const accountMenuTop = ref(0);
const accountMenuRight = ref(0);

const iconName = computed(() => {
  return profileStore.profile ? `fa-solid fa-${profileStore.profile.icon}` : 'fa-solid fa-user';
});
const iconColor = computed(() => profileStore.profile?.icon_color ?? '#EEECE9');
const iconBgColor = computed(() => profileStore.profile?.icon_bg_color ?? '#1B3A5C');

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

async function onSignOut() {
  closeAccountMenu();
  await authStore.signOut();
  await router.push({ name: 'auth' });
}

async function goToProfileSettings() {
  closeAccountMenu();
  await router.push({ name: 'settings' });
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
    v-if="authStore.isAuthenticated"
    ref="accountTriggerRef"
    class="app-header__account-btn"
    type="button"
    :aria-expanded="accountMenuOpen"
    aria-haspopup="menu"
    aria-label="Open account menu"
    @click="toggleAccountMenu"
    :style="{
      color: iconColor,
      backgroundColor: iconBgColor,
    }"
  >
    <FaIcon :icon="iconName" />
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
      <span class="app-header__account-menu__user">{{ profileStore.profile?.display_name }}</span>
      <button class="app-header__account-menu__item" role="menuitem" @click="goToProfileSettings">
        Profile settings
      </button>
      <button class="app-header__account-menu__item" role="menuitem" @click="onSignOut">
        {{ $t('auth.signOut') }}
      </button>
    </div>
  </Teleport>
</template>
