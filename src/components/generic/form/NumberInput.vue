<script setup>
import { computed } from 'vue';
import { PktTextinput } from '@oslokommune/punkt-vue';
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
  <PktTextinput v-model="innerValue" type="text" />
</template>
