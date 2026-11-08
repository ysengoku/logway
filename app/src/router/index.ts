import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/trips/:id',
      name: 'trip',
      component: () => import('@/views/TripView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/auth',
      name: 'auth',
      component: () => import('@/views/AuthView.vue'),
    },
  ],
});

router.beforeEach(async (to) => {
  const authStore = useAuthStore();

  if (!authStore.initialized) {
    await authStore.init();
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: 'auth' };
  }

  if (to.name === 'auth' && authStore.isAuthenticated) {
    return { name: 'home' };
  }
});

export default router;
