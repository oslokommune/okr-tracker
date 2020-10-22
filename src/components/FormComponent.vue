<template>
  <validation-provider :rules="rules" :name="name || label" v-slot="{ errors }">
    <label class="form-group">
      <span class="form-label">{{ label || name }}</span>
      <slot name="help"></slot>
      <input v-if="inputType === 'input'" :type="type" :disabled="disabled" class="form__field" v-model="innerValue" />

      <textarea v-if="inputType === 'textarea'" class="form__field" v-model="innerValue" rows="4" />

      <v-select
        v-if="inputType === 'select'"
        :label="selectLabel"
        :options="selectOptions"
        :clearable="false"
        v-model="innerValue"
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
