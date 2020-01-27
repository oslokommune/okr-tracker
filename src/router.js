import Vue from 'vue';
import Router from 'vue-router';
import Home from './views/Home/Home.vue';
import TheLogin from './views/Login.vue';
import TheProfile from './views/Profile.vue';
import ProductHome from './views/Product/ProductHome.vue';
import EditProduct from './views/Product/EditProduct.vue';
import EditProductDetails from './views/Product/EditProductDetails.vue';
import EditObjectivesAndKeyResults from './views/Product/EditObjectivesAndKeyResults.vue';
import KeyResultPage from './views/KeyResult/KeyResultPage.vue';
import Department from './views/Department/DepartmentHome.vue';

import { auth } from './config/firebaseConfig';
import EditDepartment from './views/Department/EditDepartment.vue';

const AdminHome = () => import(/* webpackChunkName: "group-admin" */ './views/Admin/AdminHome.vue');
const AdminUsers = () => import(/* webpackChunkName: "group-admin" */ './views/Admin/AdminUsers.vue');
const AdminObjects = () => import(/* webpackChunkName: "group-admin" */ './views/Admin/AdminObjects.vue');

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
    path: '/profile',
    name: 'profile',
    meta: { headerStyle: 'profile' },
    component: TheProfile,
  },

  {
    path: '/product/:slug',
    meta: { headerStyle: 'product' },
    name: 'product',
    component: ProductHome,
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
  window.scroll(0, 0);
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
