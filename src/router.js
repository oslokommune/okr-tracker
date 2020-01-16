import Vue from 'vue';
import Router from 'vue-router';
import Home from './views/Home.vue';
import TheLogin from './views/Login.vue';
import TheProfile from './views/Profile.vue';
import ProductHome from './views/Product/ProductHome.vue';
import EditProduct from './views/Product/EditProduct.vue';
import EditProductDetails from './views/Product/EditProductDetails.vue';
import EditObjectivesAndKeyResults from './views/Product/EditObjectivesAndKeyResults.vue';

import { auth } from './config/firebaseConfig';

const AdminHome = () => import(/* webpackChunkName: "group-admin" */ './views/Admin/AdminHome.vue');
const AdminUsers = () => import(/* webpackChunkName: "group-admin" */ './views/Admin/AdminUsers.vue');
const AdminObjects = () => import(/* webpackChunkName: "group-adin" */ './views/Admin/AdminObjects.vue');

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
    component: ProductHome,
  },

  {
    path: '/product/:slug/edit',
    component: EditProduct,
    children: [
      { name: 'edit-product', path: '/', component: EditProductDetails },
      { name: 'edit-product-keyres', path: 'objectives-key-results', component: EditObjectivesAndKeyResults },
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
