<script setup>
import { computed, defineOptions, onMounted, ref, watch } from 'vue';
import FlatPickr from 'vue-flatpickr-component';
import { PktInputWrapper } from '@oslokommune/punkt-vue';
import 'flatpickr/dist/flatpickr.css';

defineOptions({
  inheritAttrs: false,
});

const props = defineProps({
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
});

const emit = defineEmits(['update:modelValue']);

const datePicker = ref(null);
const flatPickrValue = ref(null);
const defaultConfig = {
  mode: 'single',
  dateFormat: 'j M Y',
  allowInput: true,
};

const flatPickrInstance = computed(() => datePicker.value?.fp);
const config = computed(() => ({ ...defaultConfig, ...props.datePickerConfig }));
const isRangeMode = computed(() => config.value.mode === 'range');

watch(() => props.modelValue, setValue);
onMounted(() => setValue(props.modelValue));

function setValue(value) {
  const currentValue = flatPickrInstance.value.selectedDates;
  value = value instanceof Array ? value : [value];

  if (JSON.stringify(value) !== JSON.stringify(currentValue)) {
    flatPickrInstance.value.setDate(value, true);
  }
}

function onChange(dates) {
  let value = null;

  if (dates.length) {
    if (isRangeMode.value) {
      value = dates;
    } else {
      value = dates[0];
    }
  }

  if (isRangeMode.value && value && value.length === 1) {
    return;
  }

  emit('update:modelValue', value);
}

function onClose(dates) {
  if (isRangeMode.value && dates.length === 1) {
    setValue(props.modelValue);
  }
}
</script>

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

<style lang="scss" scoped>
.datepicker--inline {
  align-self: unset;
  width: auto !important;

  :deep(.flatpickr-input) {
    display: none;
  }
}
</style>
