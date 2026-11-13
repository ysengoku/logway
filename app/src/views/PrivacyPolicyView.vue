<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

const LAST_UPDATED = '2026-11-13';
// Kept in two parts and shown only on click, so the address isn't easy to scrape.
const CONTACT_EMAIL_USER = 'logway-app';
const CONTACT_EMAIL_DOMAIN = 'googlegroups.com';
const GOOGLE_PERMISSIONS_URL = 'https://myaccount.google.com/permissions';
const GOOGLE_USER_DATA_POLICY_URL =
  'https://developers.google.com/terms/api-services-user-data-policy';

const STORAGE_ITEMS = ['browser', 'drive'] as const;
const GOOGLE_DATA_ITEMS = ['profile', 'appData', 'appFiles'] as const;
const SHARE_ITEMS = ['snapshot', 'excluded', 'stop'] as const;
const DEVICE_ITEMS = ['cookie', 'localStorage', 'noTracking'] as const;
const PROVIDER_ITEMS = ['google', 'vercel'] as const;
const RIGHTS_ITEMS = ['access', 'complaint'] as const;

const { d } = useI18n({ useScope: 'global' });

const lastUpdated = computed(() => d(new Date(`${LAST_UPDATED}T00:00:00`), 'short'));

const contactEmail = ref<string | null>(null);

function showContactEmail() {
  contactEmail.value = [CONTACT_EMAIL_USER, CONTACT_EMAIL_DOMAIN].join('@');
}
</script>

<template>
  <main class="privacy-policy">
    <h1 class="page-title">{{ $t('privacyPolicy.title') }}</h1>
    <p class="privacy-policy__updated">
      {{ $t('privacyPolicy.lastUpdated', { date: lastUpdated }) }}
    </p>
    <p>{{ $t('privacyPolicy.intro') }}</p>

    <section>
      <h2 class="section-title">{{ $t('privacyPolicy.storage.title') }}</h2>
      <p>{{ $t('privacyPolicy.storage.description') }}</p>
      <ul class="privacy-policy__list">
        <li v-for="item in STORAGE_ITEMS" :key="item">
          {{ $t(`privacyPolicy.storage.items.${item}`) }}
        </li>
      </ul>
    </section>

    <section>
      <h2 class="section-title">{{ $t('privacyPolicy.googleData.title') }}</h2>
      <p>{{ $t('privacyPolicy.googleData.description') }}</p>
      <ul class="privacy-policy__list">
        <li v-for="item in GOOGLE_DATA_ITEMS" :key="item">
          {{ $t(`privacyPolicy.googleData.items.${item}`) }}
        </li>
      </ul>
      <p>{{ $t('privacyPolicy.googleData.noEmail') }}</p>
      <i18n-t keypath="privacyPolicy.googleData.limitedUse" tag="p" scope="global">
        <template #policy>
          <a :href="GOOGLE_USER_DATA_POLICY_URL" target="_blank" rel="noopener noreferrer">
            {{ $t('privacyPolicy.googleData.policyLink') }}
          </a>
        </template>
      </i18n-t>
    </section>

    <section>
      <h2 class="section-title">{{ $t('privacyPolicy.share.title') }}</h2>
      <ul class="privacy-policy__list">
        <li v-for="item in SHARE_ITEMS" :key="item">
          {{ $t(`privacyPolicy.share.items.${item}`) }}
        </li>
      </ul>
    </section>

    <section>
      <h2 class="section-title">{{ $t('privacyPolicy.device.title') }}</h2>
      <ul class="privacy-policy__list">
        <li v-for="item in DEVICE_ITEMS" :key="item">
          {{ $t(`privacyPolicy.device.items.${item}`) }}
        </li>
      </ul>
    </section>

    <section>
      <h2 class="section-title">{{ $t('privacyPolicy.providers.title') }}</h2>
      <ul class="privacy-policy__list">
        <li v-for="item in PROVIDER_ITEMS" :key="item">
          {{ $t(`privacyPolicy.providers.items.${item}`) }}
        </li>
      </ul>
    </section>

    <section>
      <h2 class="section-title">{{ $t('privacyPolicy.deletion.title') }}</h2>
      <ul class="privacy-policy__list">
        <i18n-t keypath="privacyPolicy.deletion.items.revoke" tag="li" scope="global">
          <template #permissions>
            <a :href="GOOGLE_PERMISSIONS_URL" target="_blank" rel="noopener noreferrer">
              {{ $t('privacyPolicy.deletion.permissionsLink') }}
            </a>
          </template>
        </i18n-t>
        <li>{{ $t('privacyPolicy.deletion.items.drive') }}</li>
        <li>{{ $t('privacyPolicy.deletion.items.browser') }}</li>
      </ul>
    </section>

    <section>
      <h2 class="section-title">{{ $t('privacyPolicy.rights.title') }}</h2>
      <ul class="privacy-policy__list">
        <li v-for="item in RIGHTS_ITEMS" :key="item">
          {{ $t(`privacyPolicy.rights.items.${item}`) }}
        </li>
      </ul>
    </section>

    <section>
      <h2 class="section-title">{{ $t('privacyPolicy.changes.title') }}</h2>
      <p>{{ $t('privacyPolicy.changes.description') }}</p>
    </section>

    <section>
      <h2 class="section-title">{{ $t('privacyPolicy.contact.title') }}</h2>
      <i18n-t keypath="privacyPolicy.contact.description" tag="p" scope="global">
        <template #email>
          <a v-if="contactEmail" :href="`mailto:${contactEmail}`">{{ contactEmail }}</a>
          <button v-else class="privacy-policy__show-email" type="button" @click="showContactEmail">
            {{ $t('privacyPolicy.contact.showEmail') }}
          </button>
        </template>
      </i18n-t>
    </section>
  </main>
</template>
