<script setup>
import { computed } from 'vue';
import '@oslokommune/punkt-elements/dist/pkt-textinput.js';
import { isNumber } from '@/util';

const props = defineProps({
  modelValue: {
    type: [String, Number],
    required: false,
    default: null,
  },
});

const emit = defineEmits(['update:modelValue']);

const innerValue = computed({
  get() {
    const value = props.modelValue;

    if ([null, undefined, '', Number.NaN].includes(value)) {
      return null;
    }

    return String(value);
  },
  set(value) {
    if (isNumber(value)) {
      value = parseFloat(value.replace(',', '.'));
    }

    emit('update:modelValue', value);
  },
});
</script>

<template>
  <pkt-textinput
    type="text"
    :value="innerValue"
    @input="innerValue = $event.target.value"
  />
</template>
