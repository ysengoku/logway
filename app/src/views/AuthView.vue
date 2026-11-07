<script setup lang="ts">
// import { useAuthStore } from '@/stores/auth';
import { useLoadingStore } from '@/stores/loading';

// const authStore = useAuthStore();
const loadingStore = useLoadingStore();
</script>

<template>
  <div class="auth-view">
    <div class="auth-view__card">
      <h2 class="auth-view__title">
        {{ $t('auth.signIn') }}
      </h2>

      <p>
        (tmp) 旅行のデータはあなたの Google
        ドライブに保存されます。次のGoogle承認画面で、ドライブへのアクセスにチェックを入れてください。
        Google ドライブでのアプリ独自の設定データの参照、作成、削除。 このアプリで使用する Google
        ドライブ上の特定のファイルのみの参照、編集、作成、削除。
      </p>

      <a class="auth-view__submit" :disabled="loadingStore.active" href="/api/auth/login">
        {{ $t('auth.signIn') }}
      </a>
    </div>
  </div>
</template>
