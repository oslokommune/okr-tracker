import Vue from 'vue';
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

// Use plugins
Vue.use(Toasted, {
  position: 'bottom-right',
  className: 'toast',
  duration: 3500,
});
Vue.use(VTooltip, {
  defaultHtml: false,
});
Vue.use(VueMeta);
Vue.use(firestorePlugin);
Vue.use(VueFlatPickr);

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

// Global components
Vue.component('PageLayout', PageLayout);
Vue.component('VSelect', VueSelect);
Vue.component('ValidationProvider', ValidationProvider);
Vue.component('ValidationObserver', ValidationObserver);
Vue.component('FormComponent', FormComponent);
Vue.component('VSpinner', Spinner);
Vue.component('PktIcon', PktIcon);

// Configure VeeValidate for form validation.
// https://vee-validate.logaretm.com/v3/
configureFormValidation();

Vue.config.productionTip = false;

let app;

auth.onAuthStateChanged(async (user) => {
  try {
    await store.dispatch('set_user', user);

    await store.dispatch('init_state');

    if (router.currentRoute.query.redirectFrom) {
      await router.push({ path: router.currentRoute.query.redirectFrom });
    } else if (
      router.currentRoute.name === 'Login' &&
      !router.currentRoute.query.redirectFrom
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

    if (!router.currentRoute.name && router.history.getCurrentLocation() !== '/') {
      await router.push(router.history.getCurrentLocation()).catch(() => {
        if (document.querySelector('#spinner')) {
          document.querySelector('#spinner').remove();
        }
      });
    } else if (!router.currentRoute.query.redirectFrom) {
      await router.push({
        name: 'Login',
        query: { redirectFrom: router.currentRoute.fullPath },
      });
    }
  }

  if (!app) {
    app = new Vue({
      el: '#app',
      router,
      store,
      i18n,
      render: (h) => h(App),
    });

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
