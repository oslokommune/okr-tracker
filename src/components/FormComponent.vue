<template>
  <validation-provider v-slot="{ errors }" :rules="rules" :name="name || label">
    <label class="form-group">
      <span
        :class="{
          'form-label': true,
          'form-label--hasPrimaryBackground': hasPrimaryBackground,
        }"
      >
        {{ label || name }}
      </span>

      <slot name="help"></slot>

      <div class="form-input__wrapper">
        <input
          v-if="inputType === 'input'"
          v-model="innerValue"
          :type="type"
          :name="name"
          :disabled="disabled"
          :readonly="readonly"
          :placeholder="placeholder"
          :class="fieldClass"
          :data-cy="dataCy"
          step="any"
        />

        <textarea
          v-if="inputType === 'textarea'"
          v-model="innerValue"
          :disabled="disabled"
          :name="name"
          :readonly="readonly"
          :placeholder="placeholder"
          :class="fieldClass"
          rows="4"
          :data-cy="dataCy"
        />

        <v-select
          v-if="inputType === 'select'"
          v-model="innerValue"
          :name="name"
          :label="selectLabel"
          :options="selectOptions"
          :clearable="false"
          :data-cy="dataCy"
        >
          <template #option="option">
            {{ option.name }}
            <span v-if="option.period && option.period.name">
              ({{ option.period.name }})
            </span>
          </template>
        </v-select>

        <button
          v-if="copyButton"
          v-tooltip="$t('tooltip.copyToClipboard')"
          class="btn btn--sec"
          @click="copyFieldText"
        >
          <i class="form-label__copy-button far fa-clone" />
        </button>
      </div>

      <span v-if="errors[0]" class="form-field--error">{{ errors[0] }}</span>
    </label>
  </validation-provider>
</template>

<script>
export default {
  name: 'FormComponent',

  props: {
    hasPrimaryBackground: {
      type: Boolean,
      required: false,
      default: false,
    },
    name: {
      type: String,
      required: false,
      default: '',
    },
    label: {
      type: String,
      required: false,
      default: '',
    },
    rules: {
      type: [Object, String],
      required: false,
      default: '',
    },
    type: {
      type: String,
      required: false,
      default: 'text',
      validator(value) {
        return [
          'url',
          'text',
          'password',
          'tel',
          'search',
          'number',
          'email',
        ].includes(value);
      },
    },
    value: {
      type: null,
      required: false,
      default: '',
    },
    inputType: {
      type: String,
      required: true,
    },
    selectOptions: {
      type: Array,
      required: false,
      default: () => [],
    },
    selectLabel: {
      type: String,
      required: false,
      default: '',
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false,
    },
    readonly: {
      type: Boolean,
      required: false,
      default: false,
    },
    placeholder: {
      type: String,
      required: false,
      default: null,
    },
    copyButton: {
      type: Boolean,
      required: false,
      default: false,
    },
    dataCy: {
      type: String,
      required: false,
      default: '',
    },
  },

  data: () => ({
    innerValue: '',
  }),

  computed: {
    fieldClass() {
      return ['form-input', { 'form-input--readonly': this.readonly }];
    },
  },

  watch: {
    innerValue(value) {
      this.$emit('input', value);
    },

    value(val) {
      if (val !== this.innerValue) {
        this.innerValue = val;
      }
    },
  },

  created() {
    if (this.value !== undefined) {
      this.innerValue = this.value;
    }
  },

  methods: {
    copyFieldText(e) {
      e.preventDefault();
      const inputWrapperElement = e.currentTarget.parentElement;
      const inputElement = inputWrapperElement.querySelector('input');
      if (inputElement) {
        navigator.clipboard.writeText(inputElement.value).then(() => {
          this.$toasted.show(this.$t('toaster.action.copiedToClipboard'));
        });
      }
    },
  },
};
</script>
