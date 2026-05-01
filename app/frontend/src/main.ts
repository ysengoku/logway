import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createI18n } from 'vue-i18n';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import './lib/faIcons';

import App from './App.vue';
import router from './router';
import './assets/styles/main.scss';
import messages, { datetimeFormats } from './locales';
import { DEFAULT_LOCALE, resolveInitialLocale } from './lib/locale';

async function bootstrap() {
	const locale = await resolveInitialLocale();
	const app = createApp(App);

	const i18n = createI18n({
		legacy: false,
		locale,
		fallbackLocale: DEFAULT_LOCALE,
		messages,
		datetimeFormats,
	});

	app.use(createPinia());
	app.use(router);
	app.use(i18n);
	app.component('FaIcon', FontAwesomeIcon);

	app.mount('#app');
}

void bootstrap();
