import Vue from 'vue';
import VueSelect from 'vue-select';
import Toasted from 'vue-toasted';
import VTooltip from 'v-tooltip';
import VueMeta from 'vue-meta';
import VueFlatPickr from 'vue-flatpickr-component';
import { ValidationProvider, ValidationObserver, extend, configure } from 'vee-validate';
import { required, email, numeric, min, max } from 'vee-validate/dist/rules';
import { ContentLoader } from 'vue-content-loader';

import { firestorePlugin } from 'vuefire';
import { VueGriddle } from '@braid/griddle';

import App from '@/App.vue';
import router from '@/router';
import store from '@/store';
import i18n from '@/locale/i18n';
import Spinner from '@/components/VSpinner.vue';

import { auth } from './config/firebaseConfig';

// import plugin styles
import '@fortawesome/fontawesome-free/css/all.css';
import 'flatpickr/dist/flatpickr.css';

import './styles/main.scss';

// Use plugins
Vue.use(Toasted, {
  position: 'bottom-right',
  className: 'toast',
  duration: 3500,
});
Vue.use(VTooltip);
Vue.use(VueMeta);
Vue.use(firestorePlugin);
Vue.use(VueFlatPickr);

// Global components
Vue.component('VSelect', VueSelect);
Vue.component('VueGriddle', VueGriddle);
Vue.component('ValidationProvider', ValidationProvider);
Vue.component('ValidationObserver', ValidationObserver);
Vue.component('FormComponent', () => import('@/components/FormComponent.vue'));
Vue.component('ContentLoader', ContentLoader);
Vue.component('VSpinner', Spinner);

/* eslint-disable */
configure({
  defaultMessage: (field, values) => {
    values._field_ = i18n.t(`fields.${field}`);

    return i18n.t(`validation.${values._rule_}`, values);
  },
});
/* eslint-enable */

extend('required', required);
extend('email', email);
extend('numeric', numeric);
extend('min', min);
extend('max', max);
extend('decimal', (num) => typeof num === 'number');
extend('positiveNotZero', (num) => typeof num === 'number' && num > 0);

Vue.config.productionTip = false;

let app;

auth.onAuthStateChanged(async (user) => {
  try {
    await store.dispatch('set_user', user);

    await store.dispatch('init_state');

    if (router.currentRoute.query.redirectFrom) {
      await router.push({ path: router.currentRoute.query.redirectFrom });
    } else if (router.currentRoute.name === 'Login' && !router.currentRoute.query.redirectFrom) {
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
