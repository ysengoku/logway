<script setup lang="ts">
import AppIcon from './AppIcon.vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { persistLocalePreference, type SupportedLocale } from '@/lib/locale';
import { useI18n } from 'vue-i18n';
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';

const router = useRouter();
const authStore = useAuthStore();
const { locale } = useI18n({ useScope: 'global' });

const localeOptions: Array<{ value: SupportedLocale; label: string }> = [
  { value: 'en', label: 'EN' },
  { value: 'fr', label: 'FR' },
];

const localeMenuOpen = ref(false);
const localeTriggerRef = ref<HTMLElement | null>(null);
const localeMenuRef = ref<HTMLElement | null>(null);
const localeMenuTop = ref(0);
const localeMenuLeft = ref(0);
const localeMenuMinWidth = ref(0);

const currentLocaleLabel = computed(() => {
  const matched = localeOptions.find((option) => option.value === locale.value);
  return matched?.label ?? locale.value;
});

function switchLocale(nextLocale: SupportedLocale) {
  locale.value = nextLocale;
  void persistLocalePreference(nextLocale);
}

function updateLocaleMenuPosition() {
  if (!localeTriggerRef.value) return;
  const rect = localeTriggerRef.value.getBoundingClientRect();
  localeMenuTop.value = rect.bottom + 8;
  localeMenuLeft.value = rect.left;
  localeMenuMinWidth.value = rect.width;
}

async function toggleLocaleMenu() {
  localeMenuOpen.value = !localeMenuOpen.value;
  if (localeMenuOpen.value) {
    await nextTick();
    updateLocaleMenuPosition();
  }
}

function closeLocaleMenu() {
  localeMenuOpen.value = false;
}

function onSelectLocale(nextLocale: SupportedLocale) {
  switchLocale(nextLocale);
  closeLocaleMenu();
}

function onDocumentClick(event: MouseEvent) {
  if (!localeMenuOpen.value) return;
  const target = event.target as Node | null;
  if (!target) return;
  if (localeTriggerRef.value?.contains(target)) return;
  if (localeMenuRef.value?.contains(target)) return;
  closeLocaleMenu();
}

function onWindowResizeOrScroll() {
  if (!localeMenuOpen.value) return;
  updateLocaleMenuPosition();
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
  closeLocaleMenu();
});

async function signOut() {
  await authStore.signOut();
  router.push({ name: 'auth' });
}
</script>

<template>
  <header class="app-header">
    <div class="app-header__logo" @click="router.push({ name: 'home' })">
      Lo<span class="app-header__logo-highlight">gWa</span>y
    </div>
    <div class="app-header__actions">
      <button
        ref="localeTriggerRef"
        class="app-header__locale-control"
        type="button"
        :aria-expanded="localeMenuOpen"
        aria-haspopup="menu"
        aria-label="Change language"
        @click="toggleLocaleMenu"
      >
        <span class="app-header__locale-globe" aria-hidden="true">🌐</span>
        <span class="app-header__locale-label">{{ currentLocaleLabel }}</span>
        <span class="app-header__locale-caret" aria-hidden="true">▾</span>
      </button>
      <button
        v-if="authStore.isAuthenticated"
        class="app-header__account-btn"
        title="Sign out"
        @click="signOut"
      >
        <AppIcon name="face" :size="32"  />
      </button>
    </div>

    <Teleport to="body">
      <div
        v-if="localeMenuOpen"
        ref="localeMenuRef"
        class="app-header-locale-menu"
        role="menu"
        :style="{
          top: `${localeMenuTop}px`,
          left: `${localeMenuLeft}px`,
          minWidth: `${localeMenuMinWidth}px`,
        }"
      >
        <button
          v-for="option in localeOptions"
          :key="option.value"
          class="app-header-locale-menu__item"
          :class="{ 'app-header-locale-menu__item--active': locale === option.value }"
          role="menuitemradio"
          :aria-pressed="locale === option.value"
          @click="onSelectLocale(option.value)"
        >
          {{ option.label }}
        </button>
      </div>
    </Teleport>
  </header>
</template>
