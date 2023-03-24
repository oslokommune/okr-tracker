<template>
  <div v-click-outside="hide" class="periodSelector">
    <button
      v-tooltip.bottom="$t('period.choosePeriod')"
      class="pkt-btn pkt-btn--secondary pkt-btn--small pkt-btn--icon"
      :class="{ 'pkt-btn--focus': isOpen }"
      @click="toggle"
    >
      <pkt-icon name="calendar" class="pkt-btn__icon" />
      <span class="pkt-btn__text pkt-show-phablet-up">{{ label }}</span>
    </button>
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
    },
    range: null,
    options: Object.values(getPeriods()),
  }),

  computed: {
    ...mapState(['selectedPeriod']),

    label() {
      if (this.selectedPeriod) {
        return this.selectedPeriod.label;
      }
      return this.$t('period.choosePeriod');
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
          this.$refs.datePicker.fp.l10n.rangeSeparator
        ),
      });
      this.hide();
    },
  },
};
</script>

<style lang="scss" scoped>
@use '@oslokommune/punkt-css/dist/scss/abstracts/mixins/breakpoints' as *;

.periodSelector {
  position: relative;
  display: inline-block;

  .pkt-btn {
    align-items: center;
    width: inherit;
    height: 100%;
    font-weight: 500;
    background-color: var(--color-blue-light);
    border-color: var(--color-blue-light);

    &--focus,
    &:active {
      color: var(--color-white);
      text-decoration: none;
      background-color: var(--color-hover);
      border-color: var(--color-hover);
    }

    @include bp('phablet-up') {
      .pkt-btn__icon {
        margin-right: 0.3125rem;
      }
    }
  }
}

.periodSelector__content {
  position: absolute;
  right: 0;
  z-index: 1;
  padding-bottom: 2px;
  background-color: var(--color-white);
  border: 1px solid var(--color-grayscale-10);

  ::v-deep .flatpickr {
    &-calendar {
      margin: 0 auto;
      border: 0;
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

  &:last-of-type {
    border-bottom: 1px solid var(--color-grayscale-10);
  }
}
</style>
