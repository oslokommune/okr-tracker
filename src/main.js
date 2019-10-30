import Vue from 'vue';
import VueGAPI from 'vue-gapi';
import VueSelect from 'vue-select';
import Vuelidate from 'vuelidate';
import App from './App.vue';
import router from './router';
import store from './store';

import 'vue-select/dist/vue-select.css';

// create the 'options' object
const apiConfig = {
  clientId: process.env.VUE_APP_GOOGLE_API_CLIENT_SECRET,
  discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
  scope: 'https://www.googleapis.com/auth/spreadsheets',
  // see all available scopes here: https://developers.google.com/identity/protocols/googlescopes'
};

// Use the plugin and pass along the configuration
Vue.use(VueGAPI, apiConfig);
Vue.use(Vuelidate);

// Global components
Vue.component('v-select', VueSelect);

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app');
