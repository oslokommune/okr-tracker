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
    path: '/api',
    name: 'Api',
    component: () => import('@/views/Api.vue'),
  },
  {
    path: '/login',
    name: 'Login',
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
    path: '/403',
    name: 'Forbidden',
    component: () => import('@/views/Forbidden.vue'),
  },
  {
    path: '/admin',
    beforeEnter: routerGuards.admin,
    component: () => import('@/views/Admin/AdminWrapper.vue'),
    children: [
      {
        path: '',
        name: 'Admin',
        component: () => import('@/views/Admin/Admin.vue'),
      },
      {
        path: 'create-organization',
        name: 'CreateOrganization',
        component: () => import('@/views/Admin/CreateOrganization.vue'),
      },
      {
        path: 'create-department',
        name: 'CreateDepartment',
        component: () => import('@/views/Admin/CreateDepartment.vue'),
      },
      {
        path: 'create-product',
        name: 'CreateProduct',
        component: () => import('@/views/Admin/CreateProduct.vue'),
      },
    ],
  },
  {
    path: '/help',
    name: 'Help',
    component: () => import('@/views/Help.vue'),
  },
  {
    path: '/:slug',
    component: () => import('@/views/Item/ItemWrapper.vue'),
    beforeEnter: routerGuards.itemCommon,
    children: [
      {
        path: '',
        redirect: { name: 'ItemHome' },
      },
      {
        path: 'okr',
        name: 'ItemHome',
        component: () => import('@/views/Item/ItemOKRs.vue'),
        beforeEnter: routerGuards.itemOKRs,
        beforeRouteUpdate: routerGuards.itemOKRs,
        children: [
          {
            path: 'o/:objectiveId',
            name: 'ObjectiveHome',
          },
          {
            path: 'o/:objectiveId/k/:keyResultId',
            name: 'KeyResultHome',
            beforeEnter: routerGuards.keyResultHome,
          },
        ],
      },
      {
        path: 'measurements/:kpiId?',
        name: 'ItemMeasurements',
        component: () => import('@/views/Item/ItemMeasurements.vue'),
        beforeEnter: routerGuards.itemMeasurements,
      },
      {
        path: 'about',
        name: 'ItemAbout',
        component: () => import('@/views/Item/ItemAbout.vue'),
      },
      {
        path: 'admin',
        name: 'ItemAdmin',
        component: () => import('@/views/ItemAdmin/ItemAdminWrapper.vue'),
        beforeEnter: routerGuards.itemAdmin,
      },
      /*
       * Redirect old paths for objective and key result details.
       */
      {
        path: 'o/:objectiveId',
        redirect: (to) => ({ name: 'ObjectiveHome', params: to.params }),
      },
      {
        path: 'k/:keyResultId',
        redirect: (to) => ({ name: 'KeyResultHome', params: to.params }),
      },
      /*
       * Aliases for `measurements` -- redirect from the old `dashboard` and
       * KPI details paths in case people have them bookmarked.
       */
      {
        path: 'dashboard',
        name: 'Dashboard',
        redirect: { name: 'ItemMeasurements' },
      },
      {
        path: 'kpi/:kpiId',
        name: 'KpiHome',
        redirect: { name: 'ItemMeasurements' },
      },
    ],
  },
  {
    path: '*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
  },
];

const router = new Router({
  mode: 'history',
  base: import.meta.env.BASE_URL,
  routes,
});

export default router;
