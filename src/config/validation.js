import { extend, configure, setInteractionMode } from 'vee-validate';
import {
  email,
  max,
  min,
  min_value as minValue,
  numeric,
  required,
} from 'vee-validate/dist/rules';
import i18n from '@/locale/i18n';

export default function configureFormValidation() {
  // Set custom interaction mode for VeeValidate - a combination of 'passive' and
  // 'eager' (default: 'aggressive').
  // https://vee-validate.logaretm.com/v3/guide/interaction-and-ux.html#interaction-modes
  // https://github.com/logaretm/vee-validate/blob/v3/src/modes.ts
  setInteractionMode('custom', ({ errors }) => {
    return {
      on: errors.length ? ['input', 'change'] : [],
    };
  });

  // https://vee-validate.logaretm.com/v3/configuration.html#configuration
  // https://vee-validate.logaretm.com/v3/guide/localization.html#using-other-i18n-libraries
  configure({
    defaultMessage: (field, values) => {
      values._field_ = i18n.t(`fields.${field}`);

      return i18n.t(`validation.${values._rule_}`, values);
    },
  });

  // https://vee-validate.logaretm.com/v3/api/extend.html#extend
  extend('required', required);
  extend('email', email);
  extend('numeric', numeric);
  extend('min', min);
  extend('min_value', minValue);
  extend('max', max);
  extend('decimal', (num) => typeof num === 'number');
  extend('positiveNotZero', (num) => typeof num === 'number' && num > 0);
}
