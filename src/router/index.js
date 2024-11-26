import { createRouter, createWebHistory, START_LOCATION } from 'vue-router';
import { storeToRefs } from 'pinia';
import { getCurrentUser } from 'vuefire';
import { useTrackerStore } from '@/store/tracker';
import { useAuthStore } from '@/store/auth';
import Admin from '@/views/Admin/Admin.vue';
import AdminWrapper from '@/views/Admin/AdminWrapper.vue';
import CreateDepartment from '@/views/Admin/CreateDepartment.vue';
import CreateOrganization from '@/views/Admin/CreateOrganization.vue';
import CreateProduct from '@/views/Admin/CreateProduct.vue';
import Help from '@/views/Help.vue';
import Home from '@/views/Home.vue';
import ItemAbout from '@/views/Item/ItemAbout.vue';
import ItemMeasurements from '@/views/Item/ItemMeasurements.vue';
import ItemOKRs from '@/views/Item/ItemOKRs.vue';
import ItemWrapper from '@/views/Item/ItemWrapper.vue';
import Login from '@/views/Login.vue';
import NotFound from '@/views/NotFound.vue';
import RequestAccess from '@/views/RequestAccess.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
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
    meta: { requiresAuth: false },
  },
  {
    path: '/request-access',
    name: 'RequestAccess',
    component: RequestAccess,
    meta: { requiresAuth: false },
  },
  {
    path: '/admin',
    meta: { requiresAdmin: true },
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
    meta: { requiresAuth: false },
  },
  {
    path: '/:slug',
    component: ItemWrapper,
    children: [
      {
        path: '',
        redirect: { name: 'ItemHome' },
      },
      {
        path: 'okr',
        name: 'ItemHome',
        component: ItemOKRs,
        children: [
          {
            path: 'o/:objectiveId',
            name: 'ObjectiveHome',
            component: ItemOKRs,
          },
          {
            path: 'o/:objectiveId/k/:keyResultId',
            name: 'KeyResultHome',
            component: ItemOKRs,
          },
        ],
      },
      {
        path: 'measurements/:kpiId?',
        name: 'ItemMeasurements',
        component: ItemMeasurements,
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
      },
      /*
       * Redirect old paths for objective and key result details.
       */
      {
        path: 'o/:objectiveId',
        redirect: (to) => ({ name: 'ObjectiveHome', params: to.params }),
      },
      {
        path: 'k/:keyResultId',
        redirect: (to) => ({ name: 'KeyResultHome', params: to.params }),
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
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
    meta: { requiresAuth: false },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  const requiresAdmin = to.matched.some((r) => r.meta.requiresAdmin === true);
  const requiresAuth =
    requiresAdmin || to.matched.some((r) => r.meta.requiresAuth !== false);

  await getCurrentUser();

  const { userPromise, isLoggedIn, isAdmin } = storeToRefs(authStore);

  // Ensure that the user is fully loaded
  await userPromise.value;

  if (to.name === 'Login') {
    if (isLoggedIn.value) {
      const { redirectFrom } = to.query;
      next(redirectFrom ? { path: redirectFrom } : { name: 'Home' });
    } else {
      next();
    }
  } else if (requiresAuth) {
    if (isLoggedIn.value) {
      if (requiresAdmin && !isAdmin.value) {
        next({ name: 'Home' });
      } else {
        next();
      }
    } else {
      next({ name: 'Login', query: { redirectFrom: to.fullPath } });
    }
  } else {
    next();
  }
});

router.afterEach((to, from) => {
  // Initial navigation
  if (from === START_LOCATION) {
    const { loading } = storeToRefs(useTrackerStore());
    loading.value = false;
  }
});

export default router;
