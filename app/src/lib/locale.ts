import messages from '@/locales/index';

const DEFAULT_LOCALE = 'en';
const LOCALE_STORAGE_KEY = 'logway.locale';

export type SupportedLocale = keyof typeof messages;

function isSupportedLocale(value: unknown): value is SupportedLocale {
  return typeof value === 'string' && value in messages;
}

export function resolveInitialLocale(): SupportedLocale {
  const localeFromStorage = localStorage.getItem(LOCALE_STORAGE_KEY);
  return isSupportedLocale(localeFromStorage) ? localeFromStorage : DEFAULT_LOCALE;
}

export function persistLocalePreference(locale: SupportedLocale): void {
  localStorage.setItem(LOCALE_STORAGE_KEY, locale);
}

export { DEFAULT_LOCALE, LOCALE_STORAGE_KEY };
