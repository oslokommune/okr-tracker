import Vue from 'vue';
import Router from 'vue-router';
import store from './store';
import Home from '@/views/Home/Home.vue';
import TheLogin from '@/views/Login.vue';
import TheHelp from '@/views/Help.vue';
import ProductHome from '@/views/Product/ProductHome.vue';
import EditProduct from '@/views/Product/EditProduct.vue';
import EditProductDetails from '@/views/Product/EditProductDetails.vue';
import EditObjectivesAndKeyResults from '@/views/Product/EditObjectivesAndKeyResults.vue';
import KeyResultPage from '@/views/KeyResult/KeyResultPage.vue';
import Department from '@/views/Department/DepartmentHome.vue';
import Profile from '@/views/Profile.vue';
import EditDepartment from '@/views/Department/EditDepartment.vue';
import DashboardHome from '@/views/Dashboard/dashboardHome.vue';
import EditOrganization from '@/views/Organization/EditOrganization.vue';
import OrganizationHome from '@/views/Organization/OrganizationHome.vue';

import { auth } from '@/config/firebaseConfig';

const AdminHome = () => import(/* webpackChunkName: "group-admin" */ '@/views/Admin/AdminHome.vue');
const AdminUsers = () => import(/* webpackChunkName: "group-admin" */ '@/views/Admin/AdminUsers.vue');
const AdminObjects = () => import(/* webpackChunkName: "group-admin" */ '@/views/Admin/AdminObjects.vue');

Vue.use(Router);

const routes = [
  {
    path: '/',
    name: 'home',
    meta: { headerStyle: 'home' },
    component: Home,
  },

  {
    path: '/login',
    name: 'login',
    component: TheLogin,
  },

  {
    path: '/help',
    name: 'help',
    component: TheHelp,
    meta: { headerStyle: 'help' },
  },

  {
    path: '/me',
    name: 'me',
    meta: { headerStyle: 'me' },
    component: Profile,
  },

  {
    path: '/profile/:slug',
    name: 'profile',
    meta: { headerStyle: 'profile' },
    component: Profile,
  },

  {
    path: '/product/:slug',
    meta: { headerStyle: 'product' },
    name: 'product',
    component: ProductHome,
    props(route) {
      return route.query || {};
    },
    children: [{ name: 'dashboard', path: 'dashboard', component: DashboardHome }],
  },

  {
    path: '/product/:slug/k/:keyresid',
    meta: { headerStyle: 'product' },
    name: 'key-result',
    component: KeyResultPage,
  },

  {
    path: '/product/:slug/edit',
    meta: { headerStyle: 'edit-product' },
    component: EditProduct,
    children: [
      { name: 'edit-product', path: '/', component: EditProductDetails },
      { name: 'edit-product-keyres', path: 'objectives-key-results', component: EditObjectivesAndKeyResults },
    ],
  },

  {
    path: '/department/:slug',
    name: 'department',
    meta: { headerStyle: 'department' },
    component: Department,
  },

  {
    path: '/department/:slug/edit',
    component: EditDepartment,
    meta: { headerStyle: 'edit-product' },
    children: [
      { name: 'edit-department', path: '/', component: EditProductDetails },
      { name: 'edit-department-keyres', path: 'objectives-key-results', component: EditObjectivesAndKeyResults },
    ],
  },

  {
    path: '/organization/:slug',
    name: 'organization',
    meta: { headerStyle: 'department' },
    component: OrganizationHome,
  },

  {
    path: '/organization/:slug/edit',
    component: EditOrganization,
    meta: { headerStyle: 'department' },
    children: [
      { name: 'edit-organization', path: '/', component: EditProductDetails },
      { name: 'edit-organization-keyres', path: '/objectives-key-result', component: EditObjectivesAndKeyResults },
    ],
  },

  {
    path: '/admin',
    component: AdminHome,
    meta: { headerStyle: 'admin' },
    children: [
      { name: 'admin-users', path: '/', component: AdminUsers },
      { name: 'admin-objects', path: 'data', component: AdminObjects },
    ],
  },
];

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

router.beforeEach((to, from, next) => {
  if (from.params.slug !== to.params.slug) {
    store.commit('CLEAN_STATE');
  }
  window.scroll(0, 0);

  if (to.name === 'help') {
    next();
    return;
  }

  if (!isAuthenticated() && to.path !== '/login') {
    next('/login');
  } else {
    next();
  }
});

export default router;

function isAuthenticated() {
  return auth.currentUser;
}
