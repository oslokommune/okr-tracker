import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createHead } from '@unhead/vue';
import {
  VueFire,
  VueFireAuthOptionsFromAuth,
  VueFireFirestoreOptionsAPI,
  globalFirestoreOptions,
  firestoreDefaultConverter,
} from 'vuefire';
import VueTippy from 'vue-tippy';
import ToastPlugin from 'vue-toast-notification';
import { PktIcon } from '@oslokommune/punkt-vue';
import App from '@/App.vue';
import router from '@/router';
import i18n from '@/locale/i18n';
import PageLayout from '@/components/layout/PageLayout.vue';
import FormSection from '@/components/generic/form/FormSection.vue';
import FormComponent from '@/components/generic/form/FormComponent.vue';
import { firebaseApp, auth } from './config/firebaseConfig';
import configureFormValidation from './config/validation';

import './styles/main.scss';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(i18n);

// VueFire
app.use(VueFire, {
  firebaseApp,
  modules: [
    // https://vuefire.vuejs.org/guide/auth.html
    VueFireAuthOptionsFromAuth({ auth }),
    // https://vuefire.vuejs.org/guide/getting-started.html#Options-API
    // https://vuefire.vuejs.org/guide/options-api-realtime-data.html
    VueFireFirestoreOptionsAPI({
      // Maximum depth to bind nested refs.
      maxRefDepth: 1,
      // Keep same behavior as VueFire 2.x for now.
      // https://vuefire.vuejs.org/cookbook/migration-v2-v3.html
      reset: true,
      wait: false,
    }),
  ],
});
// https://vuefire.vuejs.org/guide/global-options.html
globalFirestoreOptions.reset = true;
globalFirestoreOptions.converter = {
  toFirestore: firestoreDefaultConverter.toFirestore,
  fromFirestore: (snapshot, options) => {
    const data = firestoreDefaultConverter.fromFirestore(snapshot, options);
    if (!data) {
      return null;
    }
    Object.defineProperty(data, 'path', {
      value: snapshot.ref.path,
      writable: false,
    });
    return data;
  },
};

// Unhead
// https://github.com/unjs/unhead
const head = createHead();
app.use(head);

// VueTippy
// https://vue-tippy.netlify.app/
app.use(VueTippy, {
  directive: 'tooltip',
  component: 'Tooltip',
  defaultProps: {
    maxWidth: 250,
    allowHTML: false,
  },
});

// Vue Toast Notification
// https://github.com/ankurk91/vue-toast-notification
// Note: Aliased to global property `$toasted` for backwards compatibility.
app.use(ToastPlugin, {
  duration: 3500,
});
const toasted = app.config.globalProperties.$toast;
toasted.show = toasted.success;
app.config.globalProperties.$toasted = toasted;

// Configure VeeValidate for form validation.
// https://vee-validate.logaretm.com/v4/guide/global-validators/
configureFormValidation();

// Global components
app.component('PageLayout', PageLayout);
app.component('FormSection', FormSection);
app.component('FormComponent', FormComponent);
app.component('PktIcon', PktIcon);

app.mount('#app');

export default { app };
