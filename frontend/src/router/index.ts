import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

function logRouterFlow(message: string, payload?: Record<string, unknown>) {
  console.log(`[router] ${message}`, payload ?? {});
}

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
      path: '/settings',
      name: 'settings',
      component: () => import('@/views/SettingsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/auth',
      name: 'auth',
      component: () => import('@/views/AuthView.vue'),
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: () => import('@/views/ResetPasswordView.vue'),
    },
  ],
});

router.beforeEach(async (to) => {
  const traceId = `guard-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  const authStore = useAuthStore();

  logRouterFlow('beforeEach:start', {
    traceId,
    to: to.fullPath,
    requiresAuth: Boolean(to.meta.requiresAuth),
    initialized: authStore.initialized,
    isAuthenticated: authStore.isAuthenticated,
  });

  if (!authStore.initialized) {
    logRouterFlow('beforeEach:init:start', { traceId });
    await authStore.init();
    logRouterFlow('beforeEach:init:end', {
      traceId,
      initialized: authStore.initialized,
      isAuthenticated: authStore.isAuthenticated,
    });
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    logRouterFlow('beforeEach:redirect-auth', { traceId, to: to.fullPath });
    return { name: 'auth' };
  }

  if (to.name === 'auth' && authStore.isAuthenticated) {
    logRouterFlow('beforeEach:redirect-home', { traceId, to: to.fullPath });
    return { name: 'home' };
  }

  logRouterFlow('beforeEach:end', { traceId, to: to.fullPath });
});

export default router;
