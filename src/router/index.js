import Vue from 'vue';
import Router from 'vue-router';
import Home from '@/views/Home.vue';
import Api from '@/views/Api.vue';
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
    component: Api,
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
    path: '/404',
    name: 'Not found',
    component: () => import('@/views/NotFound.vue'),
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
    components: {
      default: () => import('@/views/Item/ItemWrapper.vue'),
      SubNav: () => import('@/components/Navigation/ItemTabBar.vue'),
    },
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
      {
        path: 'k/:keyResultId',
        name: 'KeyResultHome',
        component: () => import('@/views/KeyResultHome.vue'),
        beforeEnter: routerGuards.keyResultHome,
      },
      {
        path: 'o/:objectiveId',
        name: 'ObjectiveHome',
        component: () => import('@/views/ObjectiveHome.vue'),
        beforeEnter: routerGuards.objectiveHome,
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
];

const router = new Router({
  mode: 'history',
  base: import.meta.env.BASE_URL,
  routes,
});

export default router;
