import Vue from 'vue';
import Router from 'vue-router';
import Home from '@/views/Home.vue';
import * as routerGuards from './router-guards';

Vue.use(Router);

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    beforeEnter: routerGuards.home,
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/Login.vue'),
    beforeEnter: routerGuards.login,
  },
  {
    path: '/404',
    name: 'Not found',
    component: () => import('@/views/NotFound.vue'),
  },
  {
    path: '/admin',
    name: 'Admin',
    beforeEnter: routerGuards.admin,
    component: () => import('@/views/Admin/Admin.vue'),
    children: [
      {
        path: 'users',
        name: 'AdminUsers',
        component: () => import('@/views/Admin/AdminUsers.vue'),
      },
      {
        path: 'items',
        name: 'AdminItems',
        component: () => import('@/views/Admin/AdminItems.vue'),
      },
      {
        path: 'access-requests',
        name: 'AdminAccessRequests',
        component: () => import('@/views/Admin/AdminAccessRequests.vue'),
      },
      {
        path: 'system',
        name: 'AdminSystem',
        component: () => import('@/views/Admin/AdminSystem.vue'),
      },
    ],
  },
  {
    path: '/:slug',
    name: 'ItemHome',
    component: () => import('@/views/ItemHome.vue'),
    beforeEnter: routerGuards.itemHome,

    children: [
      {
        path: ':keyResultId',
        name: 'KeyResultHome',
        component: () => import('@/views/KeyResultHome.vue'),
        beforeEnter: routerGuards.keyResultHome,
      },
    ],
  },
];

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

export default router;
