import Vue from 'vue';
import VueSelect from 'vue-select';
import Vuelidate from 'vuelidate';
import VueResize from 'vue-resize';
import VueScrollTo from 'vue-scrollto';
import Toasted from 'vue-toasted';
import VTooltip from 'v-tooltip';
import VueMeta from 'vue-meta';

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

const { auth } = require('./config/firebaseConfig');

Vue.config.productionTip = false;

// Use plugins
Vue.use(Vuelidate);
Vue.use(VueResize);
Vue.use(Toasted, {
  position: 'bottom-right',
  className: 'toast',
});
Vue.use(VueScrollTo);
Vue.use(VTooltip);
Vue.use(VueMeta);
Vue.use(firestorePlugin);

// Global components
Vue.component('VSelect', VueSelect);
Vue.component('Griddle', VueGriddle);

Vue.config.productionTip = false;

auth.onAuthStateChanged(async user => {
  try {
    await store.dispatch('set_user', user);
    await store.dispatch('init_state');
    await store.commit('SET_LOADING_COMPLETE');
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
});

new Vue({
  router,
  store,
  i18n,
  render: h => h(App),
}).$mount('#app');
