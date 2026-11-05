<script setup lang="ts">
const CAUSES = ['privateWindow', 'blockedStorage', 'outdatedBrowser', 'storageFull'] as const;

function reload() {
  window.location.reload();
}
</script>

<template>
  <main class="database-error">
    <h1 class="database-error__title">{{ $t('common.databaseError.title') }}</h1>
    <p>{{ $t('common.databaseError.description') }}</p>
    <p>{{ $t('common.databaseError.causesIntro') }}</p>
    <ul class="database-error__causes">
      <li v-for="cause in CAUSES" :key="cause">
        {{ $t(`common.databaseError.causes.${cause}`) }}
      </li>
    </ul>
    <button class="database-error__retry" type="button" @click="reload">
      {{ $t('common.databaseError.reload') }}
    </button>
  </main>
</template>
