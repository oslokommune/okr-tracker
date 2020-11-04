import Vue from 'vue';
import VueI18n from 'vue-i18n';
import nb from './locales/nb-NO.json';
import en from './locales/en-US.json';

Vue.use(VueI18n);

const i18n = new VueI18n({
  locale: process.env.VUE_APP_I18N_LOCALE || 'en-US',
  fallbackLocale: process.env.VUE_APP_I18N_FALLBACK_LOCALE || 'en-US',
  messages: {
    'nb-NO': nb,
    'en-US': en,
  },
});

export function setLanguage(lang) {
  i18n.locale = lang;
  document.querySelector('html').setAttribute('lang', lang);
}

export default i18n;
