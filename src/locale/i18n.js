import { createI18n } from 'vue-i18n';
import flatpickr from 'flatpickr';
import flatpickrLocale from 'flatpickr/dist/l10n/no';
import { enUS as datefnsLocaleEn, nb as datefnsLocaleNb } from 'date-fns/locale';
import { setDefaultOptions as setDateFnsOptions } from 'date-fns';
import nb from './locales/nb-NO.json';
import en from './locales/en-US.json';

const LOCALES = {
  'en-US': {
    flatpickr: flatpickrLocale.en,
    datefns: datefnsLocaleEn,
  },
  'nb-NO': {
    flatpickr: flatpickrLocale.no,
    datefns: datefnsLocaleNb,
  },
};
const DEFAULT_LOCALE = import.meta.env.VITE_I18N_LOCALE || 'en-US';
const FALLBACK_LOCALE = import.meta.env.VITE_I18N_FALLBACK_LOCALE || 'en-US';

const i18n = createI18n({
  legacy: false,
  locale: DEFAULT_LOCALE,
  fallbackLocale: FALLBACK_LOCALE,
  messages: {
    'nb-NO': nb,
    'en-US': en,
  },
});

setLanguage(DEFAULT_LOCALE);

export function setLanguage(lang) {
  if (!Object.hasOwnProperty.call(LOCALES, lang)) {
    return;
  }

  i18n.global.locale.value = lang;
  flatpickr.localize(LOCALES[lang].flatpickr);
  setDateFnsOptions({ locale: LOCALES[lang].datefns });

  document.querySelector('html').setAttribute('lang', lang);
}

export default i18n;
