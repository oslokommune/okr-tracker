import { createApp } from 'vue';
import Toasted from 'vue-toasted';
import VTooltip from 'v-tooltip';
import { VueHeadMixin, createHead } from '@unhead/vue';
import { firestorePlugin } from 'vuefire';

import { PktIcon } from '@oslokommune/punkt-vue';

import App from '@/App.vue';
import router from '@/router';
import store from '@/store';
import i18n from '@/locale/i18n';
import Spinner from '@/components/VSpinner.vue';
import PageLayout from '@/components/layout/PageLayout.vue';
import FormSection from '@/components/generic/form/FormSection.vue';
import FormComponent from '@/components/FormComponent.vue';
import { auth } from './config/firebaseConfig';
import configureFormValidation from './config/validation';

import './styles/main.scss';

function createTrackerApp() {
  const app = createApp(App);

  app.use(router);
  app.use(store);
  app.use(i18n);

  // Use plugins
  const head = createHead();
  app.mixin(VueHeadMixin);
  app.use(head);

  // TODO: Replace - not compatible with Vue 3
  app.use(Toasted, {
    position: 'bottom-right',
    className: 'toast',
    duration: 3500,
  });
  app.use(VTooltip, {
    defaultHtml: false,
  });
  app.use(firestorePlugin);

  // Configure VeeValidate for form validation.
  // https://vee-validate.logaretm.com/v4/guide/global-validators/
  configureFormValidation();

  // Global components
  app.component('PageLayout', PageLayout);
  app.component('FormSection', FormSection);
  app.component('FormComponent', FormComponent);
  app.component('VSpinner', Spinner);
  app.component('PktIcon', PktIcon);

  return app;
}

let app;

auth.onAuthStateChanged(async (user) => {
  try {
    await store.dispatch('set_user', user);

    await store.dispatch('init_state');

    if (router.currentRoute.value.query.redirectFrom) {
      await router.push({ path: router.currentRoute.value.query.redirectFrom });
    } else if (
      router.currentRoute.value.name === 'Login' &&
      !router.currentRoute.value.query.redirectFrom
    ) {
      await router.push({
        name: 'Home',
      });
    }
  } catch (e) {
    if (user) {
      store.commit('SET_LOGIN_ERROR', 1);
    }

    await store.dispatch('reset_state');
    await auth.signOut();

    if (!router.currentRoute.value.name && router.options.history.location !== '/') {
      await router.push(router.options.history.location).catch(() => {
        if (document.querySelector('#spinner')) {
          document.querySelector('#spinner').remove();
        }
      });
    } else if (!router.currentRoute.value.query.redirectFrom) {
      await router.push({
        name: 'Login',
        query: { redirectFrom: router.currentRoute.value.fullPath },
      });
    }
  }

  if (!app) {
    app = createTrackerApp();
    app.mount('#app');

    router.beforeEach((to, from, next) => {
      store.dispatch('setLoading', true);
      next();
    });

    router.afterEach(() => {
      store.dispatch('setLoading', false);
    });
  }
});

export default { app };
