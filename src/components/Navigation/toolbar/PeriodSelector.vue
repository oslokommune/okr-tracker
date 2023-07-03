<template>
  <nav-menu class="period-selector-menu">
    <nav-menu-text
      :text="`${$t('general.period')}:`"
      strong
      class="period-selector-menu__label pkt-show-phablet-up"
    />
    <nav-menu-item v-slot="{ close }" :text="periodLabel" dropdown @open="onOpen">
      <div class="period-selector-menu__dropdown-wrapper">
        <nav-menu vertical>
          <nav-menu-item
            v-for="rangeOption in _predefinedPeriods"
            :key="rangeOption.value"
            class="period-selector-menu__period-option"
            :text="rangeOption.label"
            :active="selectedPeriod && rangeOption.key === selectedPeriod.key"
            @click="selectRangeOption(rangeOption, close)"
          />
        </nav-menu>

        <div class="period-selector-menu__separator"></div>

        <flat-pickr
          v-model="range"
          :config="flatPickerConfig"
          class="form-control flatpickr-input"
          name="date"
          @on-change="(range) => selectCustomRange(range, close)"
        />
      </div>
    </nav-menu-item>
  </nav-menu>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import endOfDay from 'date-fns/endOfDay';
import { periodDates } from '@/util';
import { getPeriods } from '@/config/periods';
import NavMenu from '@/components/Navigation/navbar/NavMenu.vue';
import NavMenuItem from '@/components/Navigation/navbar/NavMenuItem.vue';
import NavMenuText from '@/components/Navigation/navbar/NavMenuText.vue';

export default {
  name: 'PeriodSelector',

  components: {
    NavMenu,
    NavMenuItem,
    NavMenuText,
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
  }),

  computed: {
    ...mapState(['selectedPeriod']),

    periodLabel() {
      if (this.selectedPeriod) {
        return this.selectedPeriod.label;
      }
      return this.$t('period.choosePeriod');
    },

    _predefinedPeriods() {
      return Object.values(getPeriods());
    },
  },

  methods: {
    ...mapActions(['setSelectedPeriod']),

    onOpen() {
      // Reset the internal range property to the currenct period selection when
      // toggling the picker. This to ensure that no invalid (incomplete) range
      // selections are kept in the component state, and that the range is set
      // correctly when navigation back to the parent view.
      if (this.selectedPeriod) {
        const { startDate, endDate } = this.selectedPeriod;
        this.range = startDate && endDate ? [startDate, endDate] : null;
      } else {
        this.range = null;
      }
    },

    selectRangeOption(rangeOption, afterSelection) {
      this.range = [rangeOption.startDate, rangeOption.endDate];
      this.setSelectedPeriod(rangeOption);
      if (afterSelection) {
        afterSelection();
      }
    },

    selectCustomRange(range, afterSelection) {
      if (range.length !== 2) {
        return;
      }
      const [startDate, endDate] = range;
      this.setSelectedPeriod({
        startDate,
        endDate: endOfDay(endDate),
        label: periodDates({ startDate, endDate }),
      });
      if (afterSelection) {
        afterSelection();
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@use '@oslokommune/punkt-css/dist/scss/abstracts/mixins/breakpoints' as *;

.period-selector-menu {
  &__dropdown-wrapper {
    width: 100vw;
    .nav-menu {
      width: inherit;
    }

    @include bp('phablet-up') {
      width: unset;
      min-width: 10rem;
    }
  }

  &__label {
    ::v-deep .nav-menu-text__inner {
      padding-right: 0;
    }
  }

  &__period-option {
    ::v-deep .nav-menu-item__inner--active {
      background-color: var(--color-gray-light);
    }
  }

  &__no-periods {
    ::v-deep .nav-menu-text__inner {
      color: var(--color-grayscale-40);
      font-style: italic;
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
