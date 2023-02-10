<template>
  <div v-click-outside="hide" class="periodSelector">
    <div
      class="periodSelector__input"
      :class="{ 'periodSelector__input--active': isOpen }"
      tabindex="0"
      @click="toggle"
      @keyup.enter="toggle"
    >
      <span class="periodSelector__input-value">
        {{ label }}
      </span>
      <pkt-icon name="calendar" />
    </div>
    <div v-if="isOpen" class="periodSelector__content">
      <button
        v-for="rangeOption in options"
        :key="rangeOption.value"
        class="periodSelector__option"
        :class="{
          'periodSelector__option--active':
            selectedPeriod && rangeOption.key === selectedPeriod.key,
        }"
        @click="selectRangeOption(rangeOption)"
      >
        {{ rangeOption.label }}
      </button>
      <flat-pickr
        ref="datePicker"
        v-model="range"
        :config="flatPickerConfig"
        class="form-control flatpickr-input"
        name="date"
        @on-change="selectCustomRange"
      />
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import ClickOutside from 'vue-click-outside';
import locale from 'flatpickr/dist/l10n/no';
import endOfDay from 'date-fns/endOfDay';
import { dateLongCompact } from '@/util';
import getPeriods from '@/config/periods';

export default {
  name: 'DashboardPeriodSelector',

  directives: {
    ClickOutside,
  },

  data: () => ({
    isOpen: false,
    flatPickerConfig: {
      inline: true,
      mode: 'range',
      minDate: null,
      maxDate: null,
      locale: locale.no,
    },
    range: null,
    options: Object.values(getPeriods()),
  }),

  computed: {
    ...mapState(['selectedPeriod']),

    label() {
      if (!this.selectedPeriod) {
        return this.$t('period.choosePeriod');
      }
      if (!this.selectedPeriod.label) {
        if (Array.isArray(this.range) && this.range.filter((d) => d).length === 2) {
          return [...new Set(this.range.map(dateLongCompact))].join(
            this.flatPickerConfig.locale.rangeSeparator
          );
        }
      }
      return this.selectedPeriod.label;
    },
  },

  watch: {
    isOpen() {
      // Reset the internal range property to the currenct period selection when
      // toggling the picker. This to ensure that no invalid (incomplete) range
      // selections are kept in the component state, and that the range is set
      // correctly when navigation back to the parent view.
      const { startDate, endDate } = this.selectedPeriod;
      this.range = startDate && endDate ? [startDate, endDate] : null;
    },
  },

  methods: {
    ...mapActions(['setSelectedPeriod']),

    toggle() {
      this.isOpen = !this.isOpen;
    },
    hide() {
      this.isOpen = false;
    },
    selectRangeOption(rangeOption) {
      this.range = [rangeOption.startDate, rangeOption.endDate];
      this.setSelectedPeriod(rangeOption);
      this.hide();
    },
    selectCustomRange(range) {
      if (range.length !== 2) {
        return;
      }
      this.setSelectedPeriod({
        startDate: range[0],
        endDate: endOfDay(range[1]),
        label: [...new Set(range.map(dateLongCompact))].join(
          this.flatPickerConfig.locale.rangeSeparator
        ),
      });
      this.hide();
    },
  },
};
</script>

<style lang="scss" scoped>
.periodSelector {
  position: relative;
  display: inline-block;
}

.periodSelector__input {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  padding: 0.75rem;
  white-space: nowrap;
  border: 1px solid var(--color-grayscale-10);
  cursor: pointer;

  > svg {
    height: 1.25rem;
  }

  &:hover:not(&--active) {
    background: var(--color-gray-light);
    border-color: var(--color-gray-light);
  }

  &--active {
    background-color: var(--color-secondary-light);
    border-color: var(--color-secondary-light);
  }

  &-value {
    color: var(--color-text);
    font-weight: 500;
    font-size: 1rem;
  }
}

.periodSelector__content {
  position: absolute;
  right: 0;
  z-index: 1;
  border: 1px solid var(--color-grayscale-10);

  ::v-deep .flatpickr {
    &-calendar {
      margin-top: -3px;
      border: 1px solid var(--color-grayscale-10);
      border-right: 0;
      border-left: 0;
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

.periodSelector__option {
  width: 100%;
  margin: 0;
  padding: 1rem;
  color: var(--color-grayscale-40);
  font-weight: 500;
  font-size: 1rem;
  text-align: left;
  background: var(--color-white);
  border: 0;
  cursor: pointer;

  &:hover,
  &--active {
    color: var(--color-text);
    background: var(--color-gray-light);
  }
}
</style>
