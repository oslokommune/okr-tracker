<template>
  <div class="period-selector">
    <h2 class="pkt-txt-18-medium">{{ $t('period.choosePeriod') }}</h2>
    <flat-pickr
      :value="range"
      :config="calendarConfig"
      class="flatpickr-input"
      name="date"
      @on-change="(range) => setRange(range)"
    />

    <div v-if="options && options.length">
      <h3 class="pkt-txt-16-medium">
        {{ $t('general.shortcuts') }}
      </h3>
      <div class="period-selector__options">
        <period-shortcut
          v-for="rangeOption in options"
          :key="rangeOption.key"
          v-bind="rangeOption"
          :active="value && rangeOption.key === value.key"
          @click="$emit('input', rangeOption)"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { endOfDay, startOfDay } from 'date-fns';
import { periodObjectFromDates } from '@/util';
import PeriodShortcut from './PeriodShortcut.vue';

export default {
  name: 'PeriodSelector',

  components: {
    PeriodShortcut,
  },

  props: {
    value: {
      type: Object,
      required: false,
      default: null,
    },
    options: {
      type: Array,
      required: false,
      default: () => [],
    },
    maxMonths: {
      type: Number,
      required: false,
      default: 1,
    },
  },

  data: () => ({
    showMonths: 1,
  }),

  computed: {
    range() {
      if (!this.value) {
        return null;
      }

      const { startDate, endDate } = this.value;
      return startDate && endDate ? [startDate, endDate] : null;
    },

    calendarConfig() {
      return {
        inline: true,
        mode: 'range',
        minDate: null,
        maxDate: null,
        showMonths: this.showMonths,
      };
    },
  },

  mounted() {
    const calculatedMonthLimit = Math.floor(window.innerWidth / 380);
    if (calculatedMonthLimit === 0) {
      this.showMonths = 1;
      return;
    }
    this.showMonths =
      this.maxMonths > calculatedMonthLimit ? calculatedMonthLimit : this.maxMonths;
  },

  methods: {
    setRange(range) {
      if (range.length !== 2) {
        return;
      }

      let [selectedStart, selectedEnd] = range;
      selectedStart = startOfDay(selectedStart);
      selectedEnd = endOfDay(selectedEnd);

      if (this.range) {
        const [currentStart, currentEnd] = this.range;
        if (
          selectedStart.getTime() === startOfDay(currentStart).getTime() &&
          selectedEnd.getTime() === endOfDay(currentEnd).getTime()
        ) {
          return;
        }
      }

      this.$emit('input', periodObjectFromDates(selectedStart, selectedEnd));
    },
  },
};
</script>

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

  ::v-deep .flatpickr {
    &-calendar {
      top: 0;
      margin: 0 auto;
      border: 0;
      border-radius: 0;
      box-shadow: none;

      &::before,
      &::after {
        // Hide flatpickr arrow
        display: none;
      }

      svg {
        vertical-align: baseline;
      }
    }
    &-input {
      display: none;
    }
  }
}
</style>
