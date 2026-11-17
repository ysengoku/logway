import { defineStore } from 'pinia';
import { ref } from 'vue';

type ToastType = 'info' | 'error';
export interface ToastData {
  id: number;
  type: ToastType;
  message: string;
}

export const useToastStore = defineStore('toast', () => {
  const queue = ref<ToastData[]>([]);
  let nextId: number = 0;

  function push(data: Omit<ToastData, 'id'>) {
    const id = nextId++;
    queue.value.push({ ...data, id: id });
    setTimeout(() => remove(id), 3000);
  }

  function remove(id: number) {
    queue.value = queue.value.filter((toast) => toast.id !== id);
  }

  return { queue, push };
});
