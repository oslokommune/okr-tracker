import Vue from 'vue';
import Router from 'vue-router';
import Home from './views/Home.vue';
import Product from './views/Product.vue';
import AddProduct from './views/AddProduct.vue';
import EditProduct from './views/EditProduct.vue';
import EditProductBasic from './views/EditProduct/BasicInfo.vue';
import EditProductObjectives from './views/EditProduct/Objectives.vue';
import EditProductKeyres from './views/EditProduct/KeyResults.vue';
import KeyResDetails from './views/EditProduct/KeyResultDetails.vue';
import Dashboard from './views/Dashboard.vue';
import NotFound from './views/NotFound.vue';

Vue.use(Router);

const routes = [
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
    path: '/add-product',
    name: 'add-product',
    component: AddProduct,
  },

  {
    path: '/product/:id/edit',
    component: EditProduct,
    children: [
      { path: '/', name: 'edit-product', component: EditProductBasic },
      { path: 'objectives', name: 'edit-product-objectives', component: EditProductObjectives },
      { path: 'key-results/', name: 'edit-product-keyres', component: EditProductKeyres },
      { path: 'key-results/:keyresId', name: 'keyres-value-details', component: KeyResDetails },
    ],
  },

  {
    name: 'dashboard',
    path: '/product/:id/dashboard',
    component: Dashboard,
  },

  {
    path: '*',
    name: 'NotFound',
    component: NotFound,
  },
];

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

router.beforeEach((to, from, next) => {
  window.scroll(0, 0);
  next();
});

export default router;
