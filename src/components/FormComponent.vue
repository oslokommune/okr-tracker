<script setup>
import { computed, defineOptions, inject, useAttrs, onMounted } from 'vue';
import { useField } from 'vee-validate';
import { useI18n } from 'vue-i18n';
import { useToast } from 'vue-toast-notification';
import {
  PktButton,
  PktCheckbox,
  PktSelect,
  PktTextarea,
  PktTextinput,
} from '@oslokommune/punkt-vue';
import CustomSelect from '@/components/generic/form/CustomSelect.vue';
import DatePicker from '@/components/generic/form/DatePicker.vue';
import RadioGroup from '@/components/generic/form/RadioGroup.vue';

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

const {
  value: fieldValue,
  errorMessage,
  handleChange: changeHandler,
} = useField(props.name, props.rules, {
  syncVModel: true,
});

function handleChange(value) {
  if (props.type === 'number') {
    value = value ? parseFloat(value) : null;
  } else if (typeof value === 'string') {
    value = value.trim();
  }
  return changeHandler(value);
}

const innerValue = computed({
  get() {
    let value = fieldValue.value;
    if (value === null || value === undefined) {
      value = attrs.value;
    }
    // Punkt inputs only accepts `String` as type for `modelValue`.
    if (
      value !== null &&
      value !== undefined &&
      ['PktSelect', 'PktTextinput', 'PktTextarea'].includes(component.value.type.name)
    ) {
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

const component = computed(() => {
  const { class: _, ...rest } = attrs;
  const config = { type: PktTextinput, props: rest };

  if (props.inputType === 'date') {
    config.type = DatePicker;
  } else if (props.inputType === 'textarea') {
    config.type = PktTextarea;
  } else if (props.inputType === 'switch') {
    config.type = PktCheckbox;
    config.props = {
      isSwitch: true,
      ...config.props,
    };
  } else if (props.inputType === 'select') {
    config.type = PktSelect;
  } else if (props.inputType === 'custom-select') {
    config.type = CustomSelect;
  } else if (props.inputType === 'radio-group') {
    config.type = RadioGroup;
  } else {
    config.props = {
      type: props.type,
      ...config.props,
    };
  }

  return config;
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
    <component
      :is="component.type"
      v-bind="component.props"
      :id="name"
      v-model="innerValue"
      :label="label"
      :name="name"
      :optional-tag="showOptionalTag && !isRequired"
      :has-error="formIsValidated && !!errorMessage"
      :error-message="errorMessage"
      :fullwidth="fullwidth"
    >
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
    top: 2.5rem;
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
