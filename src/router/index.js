import Vue from 'vue';
import Router from 'vue-router';

import Admin from '@/views/Admin/Admin.vue';
import AdminWrapper from '@/views/Admin/AdminWrapper.vue';
import CreateDepartment from '@/views/Admin/CreateDepartment.vue';
import CreateOrganization from '@/views/Admin/CreateOrganization.vue';
import CreateProduct from '@/views/Admin/CreateProduct.vue';
import Forbidden from '@/views/Forbidden.vue';
import Help from '@/views/Help.vue';
import Home from '@/views/Home.vue';
import ItemAbout from '@/views/Item/ItemAbout.vue';
import ItemMeasurements from '@/views/Item/ItemMeasurements.vue';
import ItemOKRs from '@/views/Item/ItemOKRs.vue';
import ItemWrapper from '@/views/Item/ItemWrapper.vue';
import KeyResultHome from '@/views/KeyResultHome.vue';
import Login from '@/views/Login.vue';
import NotFound from '@/views/NotFound.vue';
import ObjectiveHome from '@/views/ObjectiveHome.vue';
import RequestAccess from '@/views/RequestAccess.vue';

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
    component: Login,
    beforeEnter: routerGuards.login,
  },
  {
    path: '/request-access',
    name: 'request-access',
    component: RequestAccess,
    beforeEnter: routerGuards.requestAccess,
  },
  {
    path: '/403',
    name: 'Forbidden',
    component: Forbidden,
  },
  {
    path: '/admin',
    beforeEnter: routerGuards.admin,
    component: AdminWrapper,
    children: [
      {
        path: '',
        name: 'Admin',
        component: Admin,
      },
      {
        path: 'create-organization',
        name: 'CreateOrganization',
        component: CreateOrganization,
      },
      {
        path: 'create-department',
        name: 'CreateDepartment',
        component: CreateDepartment,
      },
      {
        path: 'create-product',
        name: 'CreateProduct',
        component: CreateProduct,
      },
    ],
  },
  {
    path: '/help',
    name: 'Help',
    component: Help,
  },
  {
    path: '/:slug',
    component: ItemWrapper,
    beforeEnter: routerGuards.itemCommon,
    children: [
      {
        path: '',
        redirect: { name: 'ItemHome' },
      },
      {
        path: 'okr',
        name: 'ItemHome',
        component: ItemOKRs,
        beforeEnter: routerGuards.itemOKRs,
        beforeRouteUpdate: routerGuards.itemOKRs,
      },
      {
        path: 'measurements/:kpiId?',
        name: 'ItemMeasurements',
        component: ItemMeasurements,
        beforeEnter: routerGuards.itemMeasurements,
      },
      {
        path: 'about',
        name: 'ItemAbout',
        component: ItemAbout,
      },
      {
        path: 'integrations',
        name: 'ItemIntegrations',
        component: () => import('@/views/Item/ItemIntegrations.vue'),
        beforeEnter: routerGuards.itemIntegrations,
      },
      {
        path: 'k/:keyResultId',
        name: 'KeyResultHome',
        component: KeyResultHome,
        beforeEnter: routerGuards.keyResultHome,
      },
      {
        path: 'o/:objectiveId',
        name: 'ObjectiveHome',
        component: ObjectiveHome,
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
  {
    path: '*',
    name: 'NotFound',
    component: NotFound,
  },
];

const router = new Router({
  mode: 'history',
  base: import.meta.env.BASE_URL,
  routes,
});

export default router;
