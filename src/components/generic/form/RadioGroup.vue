<script setup>
import { PktRadiobutton, PktInputWrapper } from '@oslokommune/punkt-vue';

defineProps({
  modelValue: {
    type: [String, Array, Date],
    required: false,
    default: null,
  },
  name: {
    type: String,
    required: true,
  },
  options: {
    type: Array,
    required: true,
  },
  label: {
    type: String,
    required: true,
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
});
</script>

<template>
  <PktInputWrapper
    :label="label"
    :for-id="name"
    :optional-tag="optionalTag"
    :has-error="hasError"
    :error-message="errorMessage"
    has-fieldset
  >
    <PktRadiobutton
      v-for="option in options"
      :id="option.id"
      :key="option.id"
      :value="option.id"
      :model-value="modelValue"
      :label="option.label"
      :check-helptext="option.helptext"
      :name="name"
      :class="{
        'pkt-input-check--fullwidth': $attrs.fullwidth,
      }"
      @update:model-value="$emit('update:modelValue', $event)"
    />
  </PktInputWrapper>
</template>

<style lang="scss" scoped>
.pkt-input-check--fullwidth {
  :deep(.pkt-input-check__input-helptext) {
    max-width: unset;
  }
}
:deep(.pkt-inputwrapper__legend) {
  margin-bottom: 1rem;
}
</style>
