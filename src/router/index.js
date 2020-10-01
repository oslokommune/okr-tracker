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
  },
  {
    path: '/:slug/admin',
    component: () => import('@/views/ItemAdmin/ItemAdmin.vue'),
    beforeEnter: routerGuards.itemAdmin,
    children: [
      {
        path: '',
        name: 'ItemAdmin',
        component: () => import('@/views/ItemAdmin/ItemAdminGeneral.vue'),
      },
      {
        path: 'okr',
        name: 'ItemAdminOKRs',
        component: () => import('@/views/ItemAdmin/ItemAdminOKRs.vue'),
      },
      {
        path: 'kpi',
        name: 'ItemAdminKPIs',
        component: () => import('@/views/ItemAdmin/ItemAdminKPIs.vue'),
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
