import { defineRule, configure } from 'vee-validate';
import { email, max, min, min_value as minValue, required } from '@vee-validate/rules';
import i18n from '@/locale/i18n';
import { isNumber } from '@/util';

export default function configureFormValidation() {
  // https://vee-validate.logaretm.com/v4/guide/global-validators
  defineRule('required', required);
  defineRule('email', email);
  defineRule('min', min);
  defineRule('min_value', minValue);
  defineRule('max', max);
  defineRule('positiveNotZero', (value) => value > 0);

  defineRule('number', (value) => {
    // Field is empty, should pass
    if (value === null || value === undefined || value === '') {
      return true;
    }
    return isNumber(value);
  });

  // https://vee-validate.logaretm.com/v4/guide/i18n/
  configure({
    generateMessage: ({ rule }) => {
      const message = i18n.global.t(`validation.${rule.name}`, rule.params);
      return `${message}.`;
    },
  });
}
