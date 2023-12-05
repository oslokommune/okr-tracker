<template>
  <validation-provider v-slot="{ errors }" :rules="rules" :name="name || label">
    <div
      :class="{
        'pkt-form-group': true,
        'pkt-form-group--error': errors.length,
      }"
    >
      <label v-if="label" class="pkt-form-label" :for="name">
        {{ label }}
        <span v-if="isOptionalField && !disabled && !readonly" class="pkt-badge">
          {{ $t('validation.optional') }}
        </span>
      </label>

      <div v-if="$slots.help" class="pkt-form-help">
        <slot name="help"></slot>
      </div>

      <div
        :class="['form-input__wrapper', { 'form-input__wrapper--copiable': copyButton }]"
      >
        <input
          v-if="inputType === 'input'"
          :id="name"
          v-model="innerValue"
          :type="type"
          :name="name"
          :disabled="disabled"
          :readonly="readonly"
          :placeholder="placeholder"
          class="pkt-form-input"
          :data-cy="dataCy"
          step="any"
        />

        <textarea
          v-if="inputType === 'textarea'"
          :id="name"
          v-model="innerValue"
          :disabled="disabled"
          :name="name"
          :readonly="readonly"
          :placeholder="placeholder"
          class="pkt-form-textarea"
          :rows="rows"
          :data-cy="dataCy"
        />

        <v-select
          v-if="inputType === 'select'"
          v-model="innerValue"
          :name="name"
          :label="selectLabel"
          :options="selectOptions"
          :clearable="selectClearable"
          :reduce="selectReduce"
          :disabled="disabled"
          :data-cy="dataCy"
          :append-to-body="true"
          @input="$emit('select', $event)"
        >
          <template #search="{ attributes, events }">
            <input :id="name" v-bind="attributes" class="vs__search" v-on="events" />
          </template>
          <template #option="option">
            {{ option[selectLabel] }}
            <span v-if="option.period && option.period.name">
              ({{ option.period.name }})
            </span>
          </template>
        </v-select>

        <flat-pickr
          v-if="inputType === 'date'"
          :id="name"
          ref="datePicker"
          :value="value"
          :config="datePickerConfig"
          :disabled="disabled"
          class="pkt-form-input flatpickr-input"
          :placeholder="placeholder"
          :name="name"
          @on-close="updateDatePickerValue"
        />

        <pkt-button
          v-if="copyButton"
          v-tooltip="$t('tooltip.copyToClipboard')"
          skin="tertiary"
          variant="icon-only"
          icon-name="copy"
          class="form-input__copy-button"
          @onClick="copyFieldText"
        />
      </div>

      <div v-if="$slots.sub" class="pkt-form-help">
        <slot name="sub"></slot>
      </div>

      <pkt-alert v-if="errors[0]" skin="error">{{ errors[0] }}</pkt-alert>
    </div>
  </validation-provider>
</template>

<script>
import { PktAlert, PktButton } from '@oslokommune/punkt-vue2';

export default {
  name: 'FormComponent',

  components: {
    PktAlert,
    PktButton,
  },

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
    selectClearable: {
      type: Boolean,
      required: false,
      default: false,
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
    isOptionalField() {
      if (typeof this.rules === 'object') {
        return !Object.keys(this.rules).includes('required');
      }
      return !this.rules.includes('required');
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

  mounted() {
    if (this.inputType === 'date' && this.name && this.datePickerConfig?.altInput) {
      // Attach a custom event handler to the date picker label when `altInput`
      // is used. This in order to focus the alternative input when the label
      // is clicked (as the `id` attribute is attached to a hidden element).
      const datePickerInstance = this.$refs.datePicker;
      const labelEl = document.querySelector(
        `label[for='${datePickerInstance.$attrs.id}']`
      );
      if (labelEl) {
        labelEl.addEventListener('click', () => {
          datePickerInstance.fpInput().focus();
        });
      }
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
::v-deep .v-select {
  flex-grow: 1;
}
</style>
