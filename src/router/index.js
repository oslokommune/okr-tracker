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
    meta: { breadcrumbs: ['home'] },
    beforeEnter: routerGuards.home,
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { breadcrumbs: ['login'] },
    beforeEnter: routerGuards.login,
  },
  {
    path: '/request-access',
    name: 'request-access',
    meta: { breadcrumbs: ['login', 'requestAccess'] },
    component: () => import('@/views/RequestAccess.vue'),
    beforeEnter: routerGuards.requestAccess,
  },
  {
    path: '/404',
    name: 'Not found',
    meta: { breadcrumbs: ['home'] },
    component: () => import('@/views/NotFound.vue'),
  },
  {
    path: '/user/:id',
    name: 'User',
    component: () => import('@/views/User.vue'),
    meta: { breadcrumbs: ['home', 'users', 'user'] },
    beforeEnter: routerGuards.user,
  },
  {
    path: '/admin',
    beforeEnter: routerGuards.admin,
    component: () => import('@/views/Admin/AdminWrapper.vue'),
    children: [
      {
        path: '',
        name: 'Admin',
        meta: { breadcrumbs: ['home', 'admin'] },
        component: () => import('@/views/Admin/Admin.vue'),
      },
      {
        path: '/admin/create-organization',
        name: 'CreateOrganization',
        meta: { breadcrumbs: ['home', 'admin', 'createOrganization'] },
        component: () => import('@/views/Admin/CreateOrganization.vue'),
      },
      {
        path: '/admin/create-department',
        name: 'CreateDepartment',
        meta: { breadcrumbs: ['home', 'admin', 'createDepartment'] },
        component: () => import('@/views/Admin/CreateDepartment.vue'),
      },
      {
        path: '/admin/create-product',
        name: 'CreateProduct',
        meta: { breadcrumbs: ['home', 'admin', 'createProduct'] },
        component: () => import('@/views/Admin/CreateProduct.vue'),
      },
    ],
  },
  {
    path: '/help',
    name: 'Help',
    meta: { breadcrumbs: ['home', 'help'] },
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
        meta: { breadcrumbs: ['home', 'item'] },
        component: () => import('@/views/ItemHome.vue'),
        beforeEnter: routerGuards.itemHome,
      },
      {
        path: 'admin',
        meta: { breadcrumbs: ['home', 'item', 'itemAdmin'] },
        component: () => import('@/views/ItemAdmin/ItemAdmin.vue'),
        beforeEnter: routerGuards.itemAdmin,
        children: [
          {
            path: '',
            name: 'ItemAdmin',
            meta: { breadcrumbs: ['home', 'item', 'itemAdmin', 'itemAdminGeneral'] },
            component: () => import('@/views/ItemAdmin/ItemAdminGeneral.vue'),
          },
          {
            path: 'okr',
            name: 'ItemAdminOKRs',
            meta: { breadcrumbs: ['home', 'item', 'itemAdmin', 'itemAdminOKR'] },
            component: () => import('@/views/ItemAdmin/ItemAdminOKRs.vue'),
          },
          {
            path: 'kpi',
            name: 'ItemAdminKPIs',
            meta: { breadcrumbs: ['home', 'item', 'itemAdmin', 'itemAdminKPI'] },
            component: () => import('@/views/ItemAdmin/ItemAdminKPIs.vue'),
          },
        ],
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        meta: { breadcrumbs: ['home', 'item'] },
        component: () => import('@/views/DashboardHome.vue'),
        beforeEnter: routerGuards.dashboard,
      },
      {
        path: 'k/:keyResultId',
        name: 'KeyResultHome',
        meta: { breadcrumbs: ['home', 'item', 'objective', 'keyResult'] },
        component: () => import('@/views/KeyResultHome.vue'),
        beforeEnter: routerGuards.keyResultHome,
      },
      {
        path: 'o/:objectiveId',
        name: 'ObjectiveHome',
        meta: { breadcrumbs: ['home', 'item', 'objective'] },
        component: () => import('@/views/ObjectiveHome.vue'),
        beforeEnter: routerGuards.objectiveHome,
      },

      {
        path: 'kpi/:kpiId',
        name: 'KpiHome',
        meta: { breadcrumbs: ['home', 'item', 'kpi'] },
        component: () => import('@/views/KpiHome.vue'),
        beforeEnter: routerGuards.kpiHome,
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
