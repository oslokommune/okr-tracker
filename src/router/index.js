import Vue from 'vue';
import Router from 'vue-router';
import Home from '@/views/Home.vue';
import routerGuards from './router-guards';

Vue.use(Router);

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
    beforeEnter: routerGuards.home,
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/Login.vue'),
  },
  {
    path: '/404',
    name: 'Not found',
    component: () => import('@/views/NotFound.vue'),
  },
  {
    path: '/:slug',
    name: 'ItemHome',
    component: () => import('@/views/ItemHome.vue'),
    beforeEnter: routerGuards.itemHome,
  },
  {
    path: '/:slug/:keyResultId',
    name: 'KeyResultHome',
    component: () => import('@/views/KeyResultHome.vue'),
    beforeEnter: routerGuards.keyResultHome,
  },
];

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

export default router;
