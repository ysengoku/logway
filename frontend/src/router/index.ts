import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
    },
    {
      path: '/trips/:id',
      name: 'trip',
      component: () => import('@/views/TripView.vue'),
    },
  ],
});

export default router;