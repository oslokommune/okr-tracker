<template>
  <div class="period-selector">
    <h2 class="pkt-txt-18-medium">
      {{ $t('period.choosePeriod') }}
    </h2>
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
        <span
          v-for="rangeOption in options"
          :key="rangeOption.value"
          :class="[
            'pkt-tag',
            'pkt-tag--large',
            'pkt-tag--thin-text',
            'pkt-tag--grey',
            'period-selector__option',
            { 'period-selector__option--active': value && rangeOption.key === value.key },
          ]"
          @click="$emit('input', rangeOption)"
        >
          {{ rangeOption.label }}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import { endOfDay, startOfDay } from 'date-fns';
import { periodDates } from '@/util';

export default {
  name: 'PeriodSelector',

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
    months: {
      type: Number,
      required: false,
      default: 1,
    },
  },

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
        showMonths: this.months,
      };
    },
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

      this.$emit('input', {
        startDate: selectedStart,
        endDate: selectedEnd,
        label: periodDates({ startDate: selectedStart, endDate: selectedEnd }),
      });
    },
  },
};
</script>

<style lang="scss" scoped>
@use '@oslokommune/punkt-css/dist/scss/abstracts/mixins/typography' as *;

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

  &__option {
    @include get-text('pkt-txt-16-light');
    white-space: nowrap;

    &--active {
      background-color: var(--color-blue-light);
    }

    &:hover {
      background-color: var(--color-beige-light);
      cursor: pointer;
    }
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
    }
    &-input {
      display: none;
    }
  }
}
</style>
