import Vue from 'vue';
import VueSelect from 'vue-select';
import Vuelidate from 'vuelidate';
import VueResize from 'vue-resize';
import VueScrollTo from 'vue-scrollto';
import ImageUploader from 'vue-image-upload-resize';
import Toasted from 'vue-toasted';
import VTooltip from 'v-tooltip';
import { errorHandler, logHandler } from '@/util/utils';
import App from './App.vue';
import router from './router';
import store from './store';

import handleUserAuthStateChange from '@/util/authChangeHelper';

// import plugin styles
import 'vue-select/dist/vue-select.css';
import 'vue-resize/dist/vue-resize.css';

const fb = require('./config/firebaseConfig');

Vue.config.productionTip = false;

// Use plugins
Vue.use(Vuelidate);
Vue.use(VueResize);
Vue.use(Toasted, {
  position: 'bottom-right',
  className: 'toast',
});
Vue.use(VueScrollTo);
Vue.use(ImageUploader);
Vue.use(VTooltip);

// Bind instance properties
Vue.prototype.$errorHandler = errorHandler;
Vue.prototype.$logHandler = logHandler;

// Global components
Vue.component('v-select', VueSelect);

Vue.config.productionTip = false;

// handle page reloads
let app;
fb.auth.onAuthStateChanged(user => {
  handleUserAuthStateChange.call(app, user);

  if (!app) {
    app = new Vue({
      el: '#app',
      router,
      store,
      render: h => h(App),
    });
  }
});

export default { app };
