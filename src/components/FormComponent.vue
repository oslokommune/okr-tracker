<template>
  <validation-provider v-slot="{ errors }" :rules="rules" :name="name || label">
    <label
      :class="{
        'form-group': true,
        'form-group--error': errors.length,
      }"
    >
      <span
        :class="{
          'form-label': true,
          'form-label--hasPrimaryBackground': hasPrimaryBackground,
        }"
      >
        {{ label || name }}
        <span v-if="errors[0]" class="ods-badge ods-badge--danger">{{ errors[0] }}</span>
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
          :rows="rows"
          :data-cy="dataCy"
        />

        <v-select
          v-if="inputType === 'select'"
          v-model="innerValue"
          :name="name"
          :label="selectLabel"
          :options="selectOptions"
          :clearable="false"
          :reduce="selectReduce"
          :data-cy="dataCy"
          :append-to-body="true"
        >
          <template #option="option">
            {{ option[selectLabel] }}
            <span v-if="option.period && option.period.name">
              ({{ option.period.name }})
            </span>
          </template>
        </v-select>

        <flat-pickr
          v-if="inputType === 'date'"
          ref="datePicker"
          :value="value"
          :config="datePickerConfig"
          class="flatpickr-input"
          :placeholder="placeholder"
          :name="name"
          @on-close="updateDatePickerValue"
        />

        <button
          v-if="copyButton"
          v-tooltip="$t('tooltip.copyToClipboard')"
          class="btn btn--sec"
          @click="copyFieldText"
        >
          <i class="form-label__copy-button far fa-clone" />
        </button>
      </div>
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
        return ['url', 'text', 'password', 'tel', 'search', 'number', 'email'].includes(
          value
        );
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
      default: 'name',
    },
    selectReduce: {
      type: Function,
      required: false,
      default: (option) => option,
    },
    datePickerConfig: {
      type: Object,
      required: false,
      default: null,
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
    rows: {
      type: Number,
      required: false,
      default: 4,
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
      if (this.inputType === 'date') {
        this.updateDatePickerValue(val);
        return;
      }
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
    updateDatePickerValue(dates) {
      if (!dates) {
        this.innerValue = null;
      } else {
        const datePickerInstance = this.$refs.datePicker.fp;
        if (datePickerInstance.config.mode === 'range') {
          this.innerValue = dates.length === 2 ? dates : null;
        } else {
          this.innerValue = dates[0];
        }
      }
    },

    copyFieldText(e) {
      e.preventDefault();
      const inputWrapperElement = e.currentTarget.parentElement;
      const inputElement = inputWrapperElement.querySelector(this.inputType);
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
::v-deep .v-select {
  flex-grow: 1;
}
</style>
