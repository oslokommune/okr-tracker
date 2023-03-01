import Vue from 'vue';
import VueI18n from 'vue-i18n';
import flatpickr from 'flatpickr';
import flatpickrLocale from 'flatpickr/dist/l10n/no';
import nb from './locales/nb-NO.json';
import en from './locales/en-US.json';

Vue.use(VueI18n);

const i18n = new VueI18n({
  locale: import.meta.env.VITE_I18N_LOCALE || 'en-US',
  fallbackLocale: import.meta.env.VITE_I18N_FALLBACK_LOCALE || 'en-US',
  messages: {
    'nb-NO': nb,
    'en-US': en,
  },
});

function setFlatpickerLocale(lang) {
  if (lang === 'en-US') {
    flatpickr.localize(flatpickrLocale.en);
  } else if (lang === 'nb-NO') {
    flatpickr.localize(flatpickrLocale.no);
  } else {
    flatpickr.localize(flatpickrLocale.default);
  }
}

setFlatpickerLocale(i18n.locale);

export function setLanguage(lang) {
  i18n.locale = lang;
  setFlatpickerLocale(lang);
  document.querySelector('html').setAttribute('lang', lang);
}

export default i18n;
