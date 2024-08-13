<template>
  <PktInputWrapper
    :for-id="$attrs.id"
    :label="$attrs.label"
    :optional-tag="optionalTag"
    :has-error="hasError"
    :error-message="errorMessage"
    :disabled="$attrs.disabled"
  >
    <div
      :class="{
        'pkt-input__container': true,
        datepicker: true,
        'datepicker--inline': config.inline,
      }"
    >
      <FlatPickr
        v-bind="$attrs"
        ref="datePicker"
        v-model="flatPickrValue"
        :class="{
          'pkt-input': true,
          'pkt-input--fullwidth': $attrs.fullwidth,
        }"
        :config="config"
        @on-change="onChange"
        @on-close="onClose"
      />

      <PktIcon v-if="!config.inline" class="pkt-input-icon" name="calendar" />
    </div>
  </PktInputWrapper>
</template>

<script>
import FlatPickr from 'vue-flatpickr-component';
import { PktInputWrapper } from '@oslokommune/punkt-vue';
import 'flatpickr/dist/flatpickr.css';

FlatPickr.compatConfig = { MODE: 3 };

export default {
  compatConfig: { MODE: 3 },

  components: {
    PktInputWrapper,
    FlatPickr,
  },

  inheritAttrs: false,

  props: {
    modelValue: {
      type: [String, Array, Date],
      required: false,
      default: null,
    },
    datePickerConfig: {
      type: Object,
      required: false,
      default: null,
    },
    optionalTag: {
      type: Boolean,
      required: false,
      default: false,
    },
    hasError: {
      type: Boolean,
      required: false,
    },
    errorMessage: {
      type: String,
      required: false,
      default: null,
    },
  },

  emits: ['update:modelValue'],

  data: () => ({
    flatPickrValue: null,
    defaultConfig: {
      mode: 'single',
      dateFormat: 'j M Y',
      allowInput: true,
    },
  }),

  computed: {
    flatPickrInstance() {
      return this.$refs.datePicker?.fp;
    },

    config() {
      return { ...this.defaultConfig, ...this.datePickerConfig };
    },
  },

  watch: {
    modelValue: {
      handler: 'setValue',
    },
  },

  mounted() {
    this.setValue(this.modelValue);
  },

  methods: {
    setValue(value) {
      const currentValue = this.flatPickrInstance.selectedDates;
      const val = value instanceof Array ? value : [value];

      if (JSON.stringify(val) !== JSON.stringify(currentValue)) {
        this.flatPickrInstance.setDate(val, true);
      }
    },

    onChange(dates) {
      let value = null;

      if (dates.length) {
        if (this.config.mode === 'range') {
          value = dates;
        } else {
          value = dates[0];
        }
      }

      if (this.config.mode === 'range' && value && value.length === 1) {
        return;
      }

      this.$emit('update:modelValue', value);
    },

    onClose(dates) {
      if (this.config.mode === 'range' && dates.length === 1) {
        this.setValue(this.modelValue);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.datepicker--inline {
  align-self: unset;
  width: auto !important;

  :deep(.flatpickr-input) {
    display: none;
  }
}
</style>
