<script setup>
import '@oslokommune/punkt-elements/dist/pkt-input-wrapper.js';
import '@oslokommune/punkt-elements/dist/pkt-radiobutton.js';

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

defineEmits(['update:modelValue']);
</script>

<template>
  <pkt-input-wrapper
    :forId="name"
    :label="label"
    :optionalTag="optionalTag"
    :hasError="hasError"
    :errorMessage="errorMessage"
    :hasFieldset="true"
  >
    <pkt-radiobutton
      v-for="option in options"
      :id="option.id"
      :key="option.id"
      :name="name"
      :value="option.id"
      :label="option.label"
      :checkHelptext="option.helptext"
      :checked="modelValue === option.id"
      :class="{
        'pkt-input-check--fullwidth': $attrs.fullwidth,
      }"
      @value-change="$event.detail && $emit('update:modelValue', option.id)"
    />
  </pkt-input-wrapper>
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
