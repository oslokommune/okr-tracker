import Vue, { createApp } from 'vue';
import VueSelect from 'vue-select';
import Toasted from 'vue-toasted';
import VTooltip from 'v-tooltip';
import VueMeta from 'vue-meta';
import VueFlatPickr from 'vue-flatpickr-component';
import { ValidationProvider, ValidationObserver } from 'vee-validate';
import { firestorePlugin } from 'vuefire';

import { PktIcon } from '@oslokommune/punkt-vue2';

import App from '@/App.vue';
import router from '@/router';
import store from '@/store';
import i18n from '@/locale/i18n';
import Spinner from '@/components/VSpinner.vue';
import PageLayout from '@/components/layout/PageLayout.vue';
import FormComponent from '@/components/FormComponent.vue';

import { auth } from './config/firebaseConfig';
import configureFormValidation from './config/validation';

// import plugin styles
import 'flatpickr/dist/flatpickr.css';

import './styles/main.scss';

VueSelect.props.components.default = () => ({
  Deselect: {
    render: (createElement) => {
      return createElement(PktIcon, { props: { name: 'close' } });
    },
  },
  OpenIndicator: {
    render: (createElement) => {
      return createElement(PktIcon, { props: { name: 'chevron-thin-down' } });
    },
  },
});

// Configure VeeValidate for form validation.
// https://vee-validate.logaretm.com/v3/
configureFormValidation();

function createTrackerApp() {
  const app = createApp(App);

  app.use(router);
  app.use(store);
  app.use(i18n);

  // Use plugins
  app.use(Toasted, {
    position: 'bottom-right',
    className: 'toast',
    duration: 3500,
  });
  app.use(VTooltip, {
    defaultHtml: false,
  });
  app.use(VueMeta);
  app.use(firestorePlugin);
  app.use(VueFlatPickr);

  // Global components
  app.component('PageLayout', PageLayout);
  app.component('VSelect', VueSelect);
  app.component('ValidationProvider', ValidationProvider);
  app.component('ValidationObserver', ValidationObserver);
  app.component('FormComponent', FormComponent);
  app.component('VSpinner', Spinner);
  app.component('PktIcon', PktIcon);

  return app
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
