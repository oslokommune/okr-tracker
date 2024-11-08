<script setup>
import { computed, defineOptions } from 'vue';
import Multiselect from '@vueform/multiselect';
import { PktInputWrapper } from '@oslokommune/punkt-vue';

defineOptions({
  inheritAttrs: false,
});

const props = defineProps({
  modelValue: {
    type: [String, Number, Array, Object],
    required: false,
    default: null,
  },
  options: {
    type: Array,
    required: true,
  },
  selectMode: {
    type: String,
    required: false,
    default: 'single',
    validator: (value) => ['single', 'multiple', 'tags'].includes(value),
  },
  valueProp: {
    type: String,
    required: false,
    default: 'value',
  },
  labelProp: {
    type: String,
    required: false,
    default: 'label',
  },
  tagProp: {
    type: String,
    required: false,
    default: 'label',
  },
  optionLabel: {
    type: Function,
    required: false,
    default: null,
  },
  tagLabel: {
    type: Function,
    required: false,
    default: null,
  },
  storeObject: {
    type: Boolean,
    required: false,
    default: false,
  },
  helptext: {
    type: String,
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
});

const emit = defineEmits(['update:modelValue']);

const value = computed({
  get() {
    return props.modelValue;
  },
  set(newValue) {
    emit('update:modelValue', newValue);
  },
});

function getOptionLabel(option) {
  return props.optionLabel ? props.optionLabel(option) : option[props.labelProp];
}

function getTagLabel(option) {
  return props.tagLabel
    ? props.tagLabel(option)
    : option[props.tagProp] || getOptionLabel(option);
}
</script>

<template>
  <PktInputWrapper
    :for-id="$attrs.id"
    :label="$attrs.label"
    :helptext="helptext"
    :optional-tag="optionalTag"
    :has-error="hasError"
    :error-message="errorMessage"
  >
    <Multiselect
      v-bind="$attrs"
      v-model="value"
      :mode="selectMode"
      :searchable="true"
      :value-prop="valueProp"
      :label="labelProp"
      :options="options"
      :object="storeObject"
      :no-results-text="$t('general.noResults')"
      :classes="{ option: 'multiselect-option ignore-click-outside' }"
    >
      <template #caret="{ isOpen }">
        <div :class="['multiselect__toggle', { 'multiselect__toggle--open': isOpen }]">
          <PktIcon :name="isOpen ? 'chevron-thin-up' : 'chevron-thin-down'" />
        </div>
      </template>

      <template #clear="{ clear }">
        <div class="multiselect__clear" @mousedown="clear">
          <PktIcon name="close" />
        </div>
      </template>

      <template #option="{ option }">
        {{ getOptionLabel(option) }}
      </template>

      <template #tag="{ option, handleTagRemove, disabled }">
        <span class="pkt-tag pkt-tag--small">
          {{ getTagLabel(option) }}
          <span v-if="!disabled" @click="handleTagRemove(option, $event)">
            <PktIcon class="pkt-tag__close-btn" name="close" />
          </span>
        </span>
      </template>
    </Multiselect>
  </PktInputWrapper>
</template>
