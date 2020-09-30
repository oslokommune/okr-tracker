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
    path: '/request-access',
    name: 'request-access',
    component: () => import('@/views/RequestAccess.vue'),
    beforeEnter: routerGuards.requestAccess,
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
