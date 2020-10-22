import Vue from 'vue';
import VueI18n from 'vue-i18n';
import validationsNb from 'vee-validate/dist/locale/nb_NO.json';
import nb from './locales/nb-no.json';

Vue.use(VueI18n);

export default new VueI18n({
  locale: process.env.VUE_APP_I18N_LOCALE || 'nb-no',
  fallbackLocale: process.env.VUE_APP_I18N_FALLBACK_LOCALE || 'nb-no',
  messages: {
    'nb-no': {
      validation: validationsNb.messages,
      ...nb,
    },
  },
});
