import Vue from 'vue';
import Router from 'vue-router';
import Home from './views/Home.vue';
import Product from './views/Product.vue';
import EditProduct from './views/EditProduct.vue';
import NotFound from './views/NotFound.vue';

Vue.use(Router);

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },

    {
      path: '/product/:id',
      name: 'product',
      component: Product,
    },

    {
      path: '/product/:id/endre',
      name: 'edit-product',
      component: EditProduct,
    },

    {
      path: '*',
      name: 'NotFound',
      component: NotFound,
    },
  ],
});
