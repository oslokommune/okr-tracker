import Vue from 'vue';
import Router from 'vue-router';
import Home from '@/views/Home.vue';
import Api from '@/views/Api.vue';
import * as routerGuards from './router-guards';

import ItemAdminGeneral from '@/views/ItemAdmin/ItemAdminGeneral.vue';
import ItemAdminOKRs from '@/views/ItemAdmin/ItemAdminOKRs.vue';
import ItemAdminKPIs from '@/views/ItemAdmin/ItemAdminKPIs.vue';

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
    path: '/logout',
    name: 'Logout',
    component: () => import('@/views/Logout.vue'),
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
    component: () => import('@/views/ItemWrapper.vue'),
    beforeEnter: routerGuards.itemHome,
    children: [
      {
        path: '',
        name: 'ItemHome',
        component: () => import('@/views/ItemHome.vue'),
        beforeEnter: routerGuards.itemHome,
      },
      {
        path: 'admin',
        component: () => import('@/views/ItemAdmin/ItemAdminWrapper.vue'),
        beforeEnter: routerGuards.itemAdmin,
        children: [
          {
            path: '',
            name: 'ItemAdmin',
            component: ItemAdminGeneral,
          },
          {
            path: 'okr',
            name: 'ItemAdminOKRs',
            component: ItemAdminOKRs,
          },
          {
            path: 'kpi',
            name: 'ItemAdminKPIs',
            component: ItemAdminKPIs,
          },
        ],
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

      {
        path: 'kpi/:kpiId',
        name: 'KpiHome',
        component: () => import('@/views/KpiHome.vue'),
        beforeEnter: routerGuards.kpiHome,
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
