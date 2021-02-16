import Vue from 'vue';
import VueSelect from 'vue-select';
import Toasted from 'vue-toasted';
import VTooltip from 'v-tooltip';
import VueMeta from 'vue-meta';
import VueFlatPickr from 'vue-flatpickr-component';
import { ValidationProvider, ValidationObserver, extend, configure } from 'vee-validate';
import { required, email, numeric, min, max } from 'vee-validate/dist/rules';

import { firestorePlugin } from 'vuefire';
import { VueGriddle } from '@braid/griddle';

import App from '@/App.vue';
import router from '@/router';
import store from '@/store';
import i18n from '@/locale/i18n';
import { capitalizeFirstLetterOfNames } from '@/util/';

import './styles/main.scss';

// import plugin styles
import 'vue-select/dist/vue-select.css';
import '@fortawesome/fontawesome-free/css/all.css';
import 'flatpickr/dist/flatpickr.css';
import Keycloak from 'keycloak-js';

const { auth } = require('./config/firebaseConfig');

Vue.config.productionTip = false;

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
Vue.component('Griddle', VueGriddle);
Vue.component('ValidationProvider', ValidationProvider);
Vue.component('ValidationObserver', ValidationObserver);
Vue.component('FormComponent', () => import('@/components/FormComponent.vue'));

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

// Support keycloak as a OIDC provider
if (store.state.providers.includes('keycloak')) {
  const keycloak = new Keycloak({
    url: process.env.VUE_APP_KEYCLOAK_URL,
    realm: process.env.VUE_APP_KEYCLOAK_REALM,
    clientId: process.env.VUE_APP_KEYCLOAK_CLIENT_ID,
  });
  keycloak
    .init({
      onLoad: 'check-sso',
      token: localStorage.getItem('accessToken') !== 'undefined' ? localStorage.getItem('accessToken') : '',
      refreshToken: localStorage.getItem('refreshToken') !== 'undefined' ? localStorage.getItem('refreshToken') : '',
      idToken: localStorage.getItem('idToken') !== 'undefined' ? localStorage.getItem('idToken') : '',
      silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
    })
    .then((authenticated) => {
      store.commit('SET_AUTHENTICATION', authenticated);
      store.dispatch('initKeycloak', keycloak);
    });
}

let app;

auth.onAuthStateChanged(async (user) => {
  try {
    const keycloakParsedToken = store.state.keycloak ? store.state.keycloak.idTokenParsed : null;
    const keycloakProvider = store.state.providers.includes('keycloak');

    if (user && !user.email && keycloakProvider && keycloakParsedToken) {
      console.log(user);
      const firstName = capitalizeFirstLetterOfNames(keycloakParsedToken.given_name);
      const lastName = capitalizeFirstLetterOfNames(keycloakParsedToken.family_name);
      const { email } = keycloakParsedToken; // eslint-disable-line

      await store.dispatch('setLoading', true);

      try {
        await user.updateEmail(email);
      } catch (e) {
        store.state.keycloak.logout({ redirectUri: `${process.env.VUE_APP_KEYCLOAK_ERROR_URL}${e.code}` });
      }

      const newUser = {
        ...user,
        displayName: `${firstName} ${lastName}`,
      };

      await store.dispatch('set_user', newUser);
    } else {
      await store.dispatch('set_user', user);
    }

    await store.dispatch('init_state');

    if (router.currentRoute.query.redirectFrom) {
      await router.push({ path: router.currentRoute.query.redirectFrom });
    }
  } catch (e) {
    console.log(e);
    if (user) {
      store.commit('SET_LOGIN_ERROR', 1);
    }

    await auth.signOut();
    await store.dispatch('reset_state');

    if (!router.currentRoute.name && router.history.getCurrentLocation() !== '/') {
      await router.push(router.history.getCurrentLocation()).catch(() => {
        if (document.querySelector('#spinner')) {
          document.querySelector('#spinner').remove();
        }
      });
    } else {
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
