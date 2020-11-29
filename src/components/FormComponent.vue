<template>
  <validation-provider v-slot="{ errors }" :rules="rules" :name="name || label">
    <label class="form-group">
      <span class="form-label">{{ label || name }}</span>
      <slot name="help"></slot>
      <input
        v-if="inputType === 'input'"
        v-model="innerValue"
        :type="type"
        :disabled="disabled"
        class="form__field"
        :data-cy="dataCy"
      />

      <textarea v-if="inputType === 'textarea'" v-model="innerValue" class="form__field" rows="4" :data-cy="dataCy" />

      <v-select
        v-if="inputType === 'select'"
        v-model="innerValue"
        :label="selectLabel"
        :options="selectOptions"
        :clearable="false"
        :data-cy="dataCy"
      >
        <template #option="option">
          {{ option.name }}
          <span v-if="option.period && option.period.name"> ({{ option.period.name }}) </span>
        </template>
      </v-select>
      <span v-if="errors[0]" class="form-field--error">{{ errors[0] }}</span>
    </label>
  </validation-provider>
</template>

<script>
export default {
  name: 'FormComponent',

  props: {
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
        return ['url', 'text', 'password', 'tel', 'search', 'number', 'email'].includes(value);
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
    dataCy: {
      type: String,
      required: false,
      default: '',
    },
  },

  data: () => ({
    innerValue: '',
  }),

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
};
</script>

<style scoped></style>
