import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createI18n } from 'vue-i18n';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import './lib/faIcons';

import App from './App.vue';
import router from './router';
import DatabaseErrorView from './views/DatabaseErrorView.vue';
import TabInUseView from './views/TabInUseView.vue';
import './assets/styles/main.scss';
import messages, { datetimeFormats } from './locales';
import { DEFAULT_LOCALE, resolveInitialLocale } from './lib/locale';
import { getDb } from './db/client';
import { acquireTabLock } from './db/tabLock';

async function bootstrap() {
  const locale = resolveInitialLocale();
  const ownsDatabase = await acquireTabLock();

  const i18n = createI18n({
    legacy: false,
    locale,
    fallbackLocale: DEFAULT_LOCALE,
    messages,
    datetimeFormats,
  });

  // Another tab already has the local database open; don't start the app here.
  if (!ownsDatabase) {
    createApp(TabInUseView).use(i18n).mount('#app');
    return;
  }

  // Without a working database, changes couldn't be saved; don't start the app.
  try {
    await getDb();
  } catch (e) {
    console.error('Failed to open the database.', e);
    createApp(DatabaseErrorView).use(i18n).mount('#app');
    return;
  }

  const app = createApp(App);
  app.use(createPinia());
  app.use(router);
  app.use(i18n);
  app.component('FaIcon', FontAwesomeIcon);

  app.mount('#app');
}

void bootstrap();
