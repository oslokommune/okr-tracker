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

<script>
import { useField } from 'vee-validate';
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

PktSelect.compatConfig = { MODE: 3 };
PktTextinput.compatConfig = { MODE: 3 };
PktTextarea.compatConfig = { MODE: 3 };
PktCheckbox.compatConfig = { MODE: 3 };

export default {
  compatConfig: { MODE: 3 },

  components: {
    PktButton,
    PktCheckbox,
    PktSelect,
    PktTextarea,
    PktTextinput,
    DatePicker,
    CustomSelect,
  },

  inject: {
    formIsValidated: {
      default: false,
    },
  },

  inheritAttrs: false,

  props: {
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
  },

  emits: ['update:modelValue'],

  setup(props) {
    const {
      value: fieldValue,
      errorMessage,
      handleChange: changeHandler,
    } = useField(props.name, props.rules, {
      syncVModel: true,
    });

    const handleChange = (value) => {
      if (value && props.type === 'number') {
        value = parseFloat(value);
      } else if (typeof value === 'string') {
        value = value.trim();
      }
      return changeHandler(value);
    };

    return { fieldValue, errorMessage, handleChange };
  },

  computed: {
    innerValue: {
      get() {
        let value = this.fieldValue;

        if (value === null || value === undefined) {
          value = this.$attrs.value;
        }

        // Punkt inputs only accepts `String` as type for `modelValue`.
        if (
          value !== null &&
          value !== undefined &&
          ['PktSelect', 'PktTextinput', 'PktTextarea'].includes(this.component.type.name)
        ) {
          value = String(value);
        }

        return value;
      },
      set(value) {
        this.handleChange(value);
      },
    },

    component() {
      const { class: _, ...props } = this.$attrs;
      const component = { type: PktTextinput, props };

      if (this.inputType === 'date') {
        component.type = DatePicker;
      } else if (this.inputType === 'textarea') {
        component.type = PktTextarea;
      } else if (this.inputType === 'switch') {
        component.type = PktCheckbox;
        component.props = {
          isSwitch: true,
          ...component.props,
        };
      } else if (this.inputType === 'select') {
        component.type = PktSelect;
      } else if (this.inputType === 'custom-select') {
        component.type = CustomSelect;
      } else if (this.inputType === 'radio-group') {
        component.type = RadioGroup;
      } else {
        component.props = {
          type: this.type,
          ...component.props,
        };
      }

      return component;
    },

    isRequired() {
      if (this.rules) {
        if (typeof this.rules === 'string') {
          return this.rules.split('|').includes('required');
        }
        if (typeof this.rules === 'object' && this.rules?.required === true) {
          return true;
        }
      }
      return false;
    },
  },

  methods: {
    copyFieldText() {
      const inputElement = this.$el.querySelector(this.inputType);
      if (inputElement) {
        navigator.clipboard.writeText(inputElement.value).then(() => {
          this.$toasted.show(this.$t('toaster.action.copiedToClipboard'));
        });
      }
    },
  },
};
</script>

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
