import Vue from 'vue';
import VueGAPI from 'vue-gapi';
import VueSelect from 'vue-select';
import Vuelidate from 'vuelidate';
import VueResize from 'vue-resize';
import VueScrollTo from 'vue-scrollto';
import Toasted from 'vue-toasted';
import App from './App.vue';
import router from './router';
import store from './store';

// import plugin styles
import 'vue-select/dist/vue-select.css';
import 'vue-resize/dist/vue-resize.css';

// create the 'options' object for google api
const apiConfig = {
  clientId: process.env.VUE_APP_GOOGLE_API_CLIENT_SECRET,
  discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
  scope: 'https://www.googleapis.com/auth/spreadsheets',
};

// Use plugins
Vue.use(VueGAPI, apiConfig);
Vue.use(Vuelidate);
Vue.use(VueResize);
Vue.use(Toasted, {
  position: 'bottom-right',
  className: 'toast',
});
Vue.use(VueScrollTo);

// Global components
Vue.component('v-select', VueSelect);

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app');
