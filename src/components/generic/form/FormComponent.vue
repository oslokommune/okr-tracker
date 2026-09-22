<script setup>
import { computed, inject, unref, useAttrs, onMounted } from 'vue';
import { useField } from 'vee-validate';
import { useI18n } from 'vue-i18n';
import { useToast } from 'vue-toast-notification';
import { PktButton } from '@oslokommune/punkt-vue';
import '@oslokommune/punkt-elements/dist/pkt-checkbox.js';
import '@oslokommune/punkt-elements/dist/pkt-select.js';
import '@oslokommune/punkt-elements/dist/pkt-textarea.js';
import '@oslokommune/punkt-elements/dist/pkt-textinput.js';
import CustomSelect from '@/components/generic/form/CustomSelect.vue';
import DatePicker from '@/components/generic/form/DatePicker.vue';
import RadioGroup from '@/components/generic/form/RadioGroup.vue';
import NumberInput from '@/components/generic/form/NumberInput.vue';

defineOptions({
  inheritAttrs: false,
});

const toast = useToast();
const i18n = useI18n();

const props = defineProps({
  modelValue: {
    type: [Number, Date, String, Boolean, Array, Object],
    required: false,
    default: null,
  },
  inputType: {
    type: String,
    required: false,
    default: 'input',
    validator: (value) =>
      [
        'input',
        'textarea',
        'select',
        'custom-select',
        'radio-group',
        'date',
        'switch',
      ].includes(value),
  },
  type: {
    type: String,
    required: false,
    default: 'text',
    validator: (value) =>
      ['url', 'text', 'password', 'tel', 'search', 'number', 'email'].includes(value),
  },
  name: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  rules: {
    type: String,
    required: false,
    default: null,
  },
  showOptionalTag: {
    type: Boolean,
    required: false,
    default: true,
  },
  fullwidth: {
    type: Boolean,
    required: false,
    default: true,
  },
  previewValue: {
    type: String,
    required: false,
    default: null,
  },
  copyButton: {
    type: Boolean,
    required: false,
    default: false,
  },
});

const attrs = useAttrs();
const formIsValidated = inject('formIsValidated', false);

const validationRules = computed(() => {
  if (props.type === 'number') {
    return props.rules ? `number|${props.rules}` : 'number';
  }
  return props.rules;
});

const {
  value: fieldValue,
  errorMessage,
  handleChange,
} = useField(props.name, validationRules, {
  syncVModel: true,
});

// The component rendering the field: either a Punkt Elements tag name or one
// of our own wrapper components.
const fieldComponent = computed(() => {
  switch (props.inputType) {
    case 'date':
      return DatePicker;
    case 'custom-select':
      return CustomSelect;
    case 'radio-group':
      return RadioGroup;
    case 'textarea':
      return 'pkt-textarea';
    case 'select':
      return 'pkt-select';
    case 'switch':
      return 'pkt-checkbox';
    default:
      return props.type === 'number' ? NumberInput : 'pkt-textinput';
  }
});

const isTextField = computed(() =>
  ['pkt-textinput', 'pkt-textarea', 'pkt-select'].includes(fieldComponent.value)
);

const innerValue = computed({
  get() {
    let value = fieldValue.value;
    if (value === null || value === undefined) {
      value = attrs.value;
    }
    // Punkt text fields only accept `String` as value.
    if (value !== null && value !== undefined && isTextField.value) {
      value = String(value);
    }
    return value;
  },
  set(value) {
    handleChange(value);
  },
});

onMounted(() => {
  handleChange(innerValue.value || props.modelValue);
});

const isRequired = computed(() => {
  if (props.rules) {
    if (typeof props.rules === 'string') {
      return props.rules.split('|').includes('required');
    }
    if (typeof props.rules === 'object' && props.rules?.required === true) {
      return true;
    }
  }
  return false;
});

// Props and listeners for the field component. Punkt Elements expose `value`
// (or `checked`) and DOM events, while our own components use `v-model`.
const fieldProps = computed(() => {
  const { class: _, ...rest } = attrs;
  const common = {
    ...rest,
    id: props.name,
    name: props.name,
    label: props.label,
    optionalTag: props.showOptionalTag && !isRequired.value,
    hasError: unref(formIsValidated) && !!errorMessage.value,
    errorMessage: errorMessage.value,
    fullwidth: props.fullwidth,
  };

  switch (fieldComponent.value) {
    case 'pkt-textinput':
      return {
        ...common,
        type: props.type,
        value: innerValue.value,
        onInput: (event) => {
          innerValue.value = event.target.value;
        },
      };
    case 'pkt-textarea':
      return {
        ...common,
        value: innerValue.value,
        onInput: (event) => {
          innerValue.value = event.target.value;
        },
      };
    case 'pkt-select':
      return {
        ...common,
        value: innerValue.value,
        onChange: (event) => {
          innerValue.value = event.target.value;
        },
      };
    case 'pkt-checkbox':
      return {
        ...common,
        optionalTag: false,
        isSwitch: true,
        checked: !!innerValue.value,
        onValueChange: (event) => {
          innerValue.value = event.detail;
        },
      };
    default:
      return {
        ...common,
        modelValue: innerValue.value,
        'onUpdate:modelValue': (value) => {
          innerValue.value = value;
        },
      };
  }
});

function copyFieldText() {
  if (fieldValue.value) {
    navigator.clipboard.writeText(fieldValue.value).then(() => {
      toast.success(i18n.t('toaster.action.copiedToClipboard'));
    });
  }
}
</script>

<template>
  <div
    :class="['form-component', { 'form-component--copiable': copyButton }, $attrs.class]"
  >
    <component :is="fieldComponent" v-bind="fieldProps">
      <slot />
    </component>

    <div v-if="previewValue" class="form-component__preview pkt-txt-14-medium mt-size-8">
      {{ $t('general.displayedAs') }}
      {{ previewValue }}
    </div>

    <PktButton
      v-if="copyButton"
      v-tooltip.left="$t('tooltip.copyToClipboard')"
      skin="tertiary"
      variant="icon-only"
      icon-name="copy"
      class="form-component__copy-button"
      @on-click="copyFieldText"
    />
  </div>
</template>

<style lang="scss" scoped>
.form-component {
  &--copiable {
    position: relative;

    :deep(.pkt-input) {
      padding-right: 3.25rem;
    }
  }

  &__copy-button {
    position: absolute;
    top: 3rem;
    right: 0.25rem;
    width: 2.5rem;
    height: 2.5rem;
    padding: 0 0.5rem;
  }

  &__preview {
    color: var(--color-grayscale-60);
  }

  :deep(.pkt-input:is(textarea)[rows]) {
    // Override `min-height` for textarea inputs with specified `rows` attribute.
    min-height: 3rem;
  }
}
</style>
