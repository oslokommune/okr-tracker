import Vue from 'vue';
import VueI18n from 'vue-i18n';

function loadLocaleMessages() {
  const norwegian = require('./locales/nb-no.json');

  return {
    'nb-no': norwegian,
  };
}

Vue.use(VueI18n);

export default new VueI18n({
  locale: process.env.VUE_APP_I18N_LOCALE || 'nb-no',
  fallbackLocale: process.env.VUE_APP_I18N_FALLBACK_LOCALE || 'nb-no',
  messages: loadLocaleMessages(),
});
