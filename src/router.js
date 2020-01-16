import Vue from 'vue';
import Router from 'vue-router';
import Home from './views/Home.vue';
import TheLogin from './views/Login.vue';
import TheProfile from './views/Profile.vue';
import Product from './views/Product.vue';
import EditProduct from './views/EditProduct.vue';
import AdminBasicInfo from './views/EditProduct/BasicInfo.vue';
import EditObjectivesAndKeyResults from './views/EditProduct/EditObjectivesAndKeyResults.vue';
import Department from './views/Department.vue';

import { auth } from './config/firebaseConfig';
import EditDepartment from './views/EditDepartment.vue';

const AdminHome = () => import(/* webpackChunkName: "group-admin" */ './views/admin/AdminHome.vue');
const AdminUsers = () => import(/* webpackChunkName: "group-admin" */ './views/admin/AdminUsers.vue');
const AdminObjects = () => import(/* webpackChunkName: "group-adin" */ './views/admin/AdminObjects.vue');

Vue.use(Router);

const routes = [
  {
    path: '/',
    name: 'home',
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
    component: TheProfile,
  },

  {
    path: '/product/:slug',
    name: 'product',
    component: Product,
  },

  {
    path: '/product/:slug/edit',
    component: EditProduct,
    children: [
      { name: 'edit-product', path: '/', component: AdminBasicInfo },
      { name: 'edit-product-keyres', path: 'objectives-key-results', component: EditObjectivesAndKeyResults },
    ],
  },

  {
    path: '/department/:slug',
    component: Department,
    name: 'department',
  },

  {
    path: '/department/:slug/edit',
    component: EditDepartment,
    children: [
      { name: 'edit-department', path: '/', component: AdminBasicInfo },
      { name: 'edit-department-keyres', path: 'objectives-key-results', component: EditObjectivesAndKeyResults },
    ],
  },

  {
    path: '/admin',
    component: AdminHome,
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
  if (!isAuthenticated() && to.path !== '/login') next('/login');
  else next();
});

export default router;

function isAuthenticated() {
  return auth.currentUser;
}
