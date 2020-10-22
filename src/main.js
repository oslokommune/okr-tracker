import Vue from 'vue';
import VueSelect from 'vue-select';
import VueResize from 'vue-resize';
import Toasted from 'vue-toasted';
import VTooltip from 'v-tooltip';
import VueMeta from 'vue-meta';
import VueFlatPickr from 'vue-flatpickr-component';
import { ValidationProvider, ValidationObserver, extend, configure } from 'vee-validate';
import { required, email, numeric } from 'vee-validate/dist/rules';

import { firestorePlugin } from 'vuefire';
import { VueGriddle } from '@braid/griddle';

import App from '@/App.vue';
import router from '@/router';
import store from '@/store';
import i18n from '@/locale/i18n';

// import plugin styles
import 'vue-select/dist/vue-select.css';
import 'vue-resize/dist/vue-resize.css';
import '@fortawesome/fontawesome-free/css/all.css';
import 'flatpickr/dist/flatpickr.css';

const { auth } = require('./config/firebaseConfig');

Vue.config.productionTip = false;

// Use plugins
Vue.use(VueResize);
Vue.use(Toasted, {
  position: 'bottom-right',
  className: 'toast',
  duration: 5000,
});
Vue.use(VTooltip);
Vue.use(VueMeta);
Vue.use(firestorePlugin);
Vue.use(VueFlatPickr);

// Global components
Vue.component('VSelect', VueSelect);
Vue.component('Griddle', VueGriddle);
Vue.component('ValidationProvider', ValidationProvider);
Vue.component('ValidationObserver', ValidationObserver);

configure({
  defaultMessage: (field, values) => {
    values._field_ = i18n.t(`fields.${field}`);

    return i18n.t(`validation.${values._rule_}`, values);
  },
});

extend('required', required);
extend('email', email);
extend('numeric', numeric);

Vue.config.productionTip = false;

let app;

auth.onAuthStateChanged(async user => {
  try {
    await store.dispatch('set_user', user);
    await store.dispatch('init_state');
    await router.push({
      path: `${router.currentRoute.query.redirectFrom || router.history.getCurrentLocation() || '/'}`,
    });
  } catch {
    if (user) {
      store.commit('SET_LOGIN_ERROR', 1);
    }

    await auth.signOut();
    await store.dispatch('reset_state');

    await router.push({
      name: 'Login',
      query: { redirectFrom: router.currentRoute.fullPath },
    });
  }

  if (!app) {
    app = new Vue({
      el: '#app',
      router,
      store,
      i18n,
      render: h => h(App),
    });
  }
});

export default { app };
