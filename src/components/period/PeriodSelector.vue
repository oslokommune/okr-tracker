<script setup>
import { computed, onMounted, ref } from 'vue';
import { endOfDay, startOfDay } from 'date-fns';
import { periodObjectFromDates } from '@/util';
import DatePicker from '@/components/generic/form/DatePicker.vue';
import PeriodShortcut from './PeriodShortcut.vue';

const props = defineProps({
  modelValue: {
    type: Object,
    required: false,
    default: null,
  },
  periodShortcuts: {
    type: Array,
    required: false,
    default: () => [],
  },
  maxMonths: {
    type: Number,
    required: false,
    default: 1,
  },
});

const emit = defineEmits(['update:modelValue', 'select']);

const showMonths = ref(1);

onMounted(() => {
  const calculatedMonthLimit = Math.floor(window.innerWidth / 380);
  if (calculatedMonthLimit === 0) {
    showMonths.value = 1;
    return;
  }
  showMonths.value =
    props.maxMonths > calculatedMonthLimit ? calculatedMonthLimit : props.maxMonths;
});

const calendarConfig = computed(() => ({
  inline: true,
  mode: 'range',
  minDate: null,
  maxDate: null,
  showMonths: showMonths.value,
}));

const range = computed({
  get() {
    if (!props.modelValue) {
      return [];
    }
    const { startDate, endDate } = props.modelValue;
    return startDate && endDate ? [startDate, endDate] : [];
  },
  set(value) {
    let [selectedStart, selectedEnd] = value;
    selectedStart = startOfDay(selectedStart);
    selectedEnd = endOfDay(selectedEnd);

    if (range.value) {
      const [currentStart, currentEnd] = range.value;
      if (
        selectedStart.getTime() === startOfDay(currentStart).getTime() &&
        selectedEnd.getTime() === endOfDay(currentEnd).getTime()
      ) {
        return;
      }
    }

    select(periodObjectFromDates(selectedStart, selectedEnd));
  },
});

function select(period) {
  emit('update:modelValue', period);
  emit('select', period);
}
</script>

<template>
  <div class="period-selector">
    <DatePicker
      id="period"
      v-model="range"
      :label="$t('period.choosePeriod')"
      :date-picker-config="calendarConfig"
    />

    <div v-if="periodShortcuts.length">
      <h3 class="pkt-txt-16-medium">
        {{ $t('general.shortcuts') }}
      </h3>
      <div class="period-selector__options">
        <PeriodShortcut
          v-for="period in periodShortcuts"
          v-bind="period"
          :key="period.key"
          :active="modelValue?.key === period.key"
          @click="select(period)"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.period-selector {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  padding: 1rem;

  &__section-title {
    margin-bottom: 0.5rem;
  }

  &__options {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }

  :deep(.flatpickr-calendar) {
    top: 0;
    margin: 0 auto;
    border: 0;
    border-radius: 0;
    box-shadow: none;

    svg {
      vertical-align: baseline;
    }
  }
}

:deep(.flatpickr-input) {
  display: none;
}
</style>
