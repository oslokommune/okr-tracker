import Vue from 'vue';
import Router from 'vue-router';
import Home from './views/Home.vue';
import TheLogin from './views/Login.vue';
import TheAdmin from './views/Admin.vue';
import TheProfile from './views/Profile.vue';

import { auth } from './config/firebaseConfig';

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
    path: '/admin',
    name: 'admin',
    component: TheAdmin,
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
