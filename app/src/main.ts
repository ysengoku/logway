import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createI18n } from 'vue-i18n';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import './lib/faIcons';

import DatabaseErrorView from './views/DatabaseErrorView.vue';
import MaintenanceView from './views/MaintenanceView.vue';
import TabInUseView from './views/TabInUseView.vue';
import '@fontsource/capriola';
import '@fontsource-variable/inter';
import './assets/styles/main.scss';
import messages, { datetimeFormats } from './locales';
import { DEFAULT_LOCALE, resolveInitialLocale } from './lib/locale';
import { getDb } from './db/client';
import { acquireTabLock } from './db/tabLock';

async function bootstrap() {
  const locale = resolveInitialLocale();

  const i18n = createI18n({
    legacy: false,
    locale,
    fallbackLocale: DEFAULT_LOCALE,
    messages,
    datetimeFormats,
  });

  // During maintenance, show only the maintenance page; don't open the database.
  if (import.meta.env.VITE_MAINTENANCE_MODE === 'true') {
    createApp(MaintenanceView).use(i18n).mount('#app');
    return;
  }

  // Without a working database, changes couldn't be saved; don't start the app.
  function showDatabaseError(error: unknown) {
    console.error('Failed to open the database.', error);
    createApp(DatabaseErrorView).use(i18n).mount('#app');
  }

  let ownsDatabase: boolean;
  try {
    ownsDatabase = await acquireTabLock();
  } catch (e) {
    showDatabaseError(e);
    return;
  }

  // Another tab already has the local database open; don't start the app here.
  if (!ownsDatabase) {
    createApp(TabInUseView).use(i18n).mount('#app');
    return;
  }

  try {
    await getDb();
  } catch (e) {
    showDatabaseError(e);
    return;
  }

  // Load these only here: the router pulls in the auth store, which the maintenance page must not evaluate.
  const [{ default: App }, { default: router }] = await Promise.all([
    import('./App.vue'),
    import('./router'),
  ]);

  const app = createApp(App);
  app.use(createPinia());
  app.use(router);
  app.use(i18n);
  app.component('FaIcon', FontAwesomeIcon);

  app.mount('#app');
}

void bootstrap();
