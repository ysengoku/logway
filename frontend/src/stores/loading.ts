import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useLoadingStore = defineStore('loading', () => {
  const count = ref(0);
  const message = ref('');

  const active = computed(() => count.value > 0);

  function start(msg?: string) {
    if (msg) message.value = msg;
    count.value += 1;
    console.log('[loading] start', { count: count.value, message: message.value || null });
  }

  function stop() {
    if (count.value > 0) count.value -= 1;
    if (count.value === 0) message.value = '';
    console.log('[loading] stop', { count: count.value, message: message.value || null });
  }

  function reset() {
    count.value = 0;
    message.value = '';
    console.log('[loading] reset', { count: count.value, message: message.value || null });
  }

  return { count, message, active, start, stop, reset };
});
