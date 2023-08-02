<template>
  <div class="period-selector">
    <template v-if="options && options.length">
      <nav-menu vertical>
        <nav-menu-item
          v-for="rangeOption in options"
          :key="rangeOption.value"
          class="period-selector__period-option"
          :text="rangeOption.label"
          :active="value && rangeOption.key === value.key"
          @click="$emit('input', rangeOption)"
        />
      </nav-menu>

      <div class="period-selector__separator"></div>
    </template>

    <flat-pickr
      :value="range"
      :config="flatPickerConfig"
      class="form-control flatpickr-input"
      name="date"
      @on-change="(range) => setRange(range)"
    />
  </div>
</template>

<script>
import { endOfDay, startOfDay } from 'date-fns';
import { periodDates } from '@/util';
import NavMenu from '@/components/Navigation/navbar/NavMenu.vue';
import NavMenuItem from '@/components/Navigation/navbar/NavMenuItem.vue';

export default {
  name: 'PeriodSelector',

  components: {
    NavMenu,
    NavMenuItem,
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
  },

  data: () => ({
    flatPickerConfig: {
      inline: true,
      mode: 'range',
      minDate: null,
      maxDate: null,
    },
  }),

  computed: {
    range() {
      if (!this.value) {
        return null;
      }

      const { startDate, endDate } = this.value;
      return startDate && endDate ? [startDate, endDate] : null;
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
@use '@oslokommune/punkt-css/dist/scss/abstracts/mixins/breakpoints' as *;

.period-selector {
  width: 100%;

  .nav-menu {
    width: inherit;
  }

  &__period-option {
    ::v-deep .nav-menu-item__inner--active {
      background-color: var(--color-gray-light);
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

  &__separator {
    width: 100%;
    height: 1px;
    background: var(--color-grayscale-10);
  }
}
</style>
