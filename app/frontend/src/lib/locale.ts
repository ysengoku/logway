import messages from '@/locales/index';
import { useProfileStore } from '@/stores/profile';

const DEFAULT_LOCALE = 'en';
const LOCALE_STORAGE_KEY = 'logway.locale';

export type SupportedLocale = keyof typeof messages;

function isSupportedLocale(value: unknown): value is SupportedLocale {
  return typeof value === 'string' && value in messages;
}

export async function resolveInitialLocale(): Promise<SupportedLocale> {
  try {
    const profileStore = useProfileStore();
    const localeFromDb = profileStore.profile?.preferred_locale ?? undefined;
    if (isSupportedLocale(localeFromDb)) {
      localStorage.setItem(LOCALE_STORAGE_KEY, localeFromDb);
      return localeFromDb;
    }
  } catch {
    // If DB lookup fails, continue with localStorage fallback.
  }

  const localeFromStorage = localStorage.getItem(LOCALE_STORAGE_KEY);
  if (isSupportedLocale(localeFromStorage)) {
    return localeFromStorage;
  }
  return DEFAULT_LOCALE;
}

export async function persistLocalePreference(locale: SupportedLocale): Promise<void> {
  localStorage.setItem(LOCALE_STORAGE_KEY, locale);

  try {
    const profileStore = useProfileStore();
    await profileStore.updateProfile({ preferred_locale: locale });
  } catch {
    // Keep localStorage as fallback when profile patch is unavailable.
  }
}

export { DEFAULT_LOCALE, LOCALE_STORAGE_KEY };
