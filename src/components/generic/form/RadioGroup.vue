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

<script>
import { PktRadiobutton, PktInputWrapper } from '@oslokommune/punkt-vue';

export default {
  compatConfig: { MODE: 3 },

  name: 'RadioGroup',

  components: {
    PktRadiobutton,
    PktInputWrapper,
  },

  props: {
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
  },

  emits: ['update:modelValue'],
};
</script>

<style lang="scss" scoped>
.pkt-input-check--fullwidth {
  :deep(.pkt-input-check__input-helptext) {
    max-width: unset;
  }
}
</style>
