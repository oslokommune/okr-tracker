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
            v-for="rangeOption in _periods"
            :key="rangeOption.value"
            class="period-selector-menu__period-option"
            :text="rangeOption.label"
            :active="selectedPeriod && rangeOption.key === selectedPeriod.key"
            @click="selectRangeOption(rangeOption, close)"
          />
        </nav-menu>

        <div v-if="isMeasurementsView" class="period-selector-menu__separator"></div>

        <flat-pickr
          v-if="isMeasurementsView"
          ref="datePicker"
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
import { dateLongCompact } from '@/util';
import getPeriods from '@/config/periods';
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

  props: {
    showDatePicker: {
      type: Boolean,
      required: false,
      default: false,
    },
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
    ...mapState(['periods', 'selectedPeriod']),

    periodLabel() {
      if (this.selectedPeriod) {
        return this.selectedPeriod.label;
      }
      return this.$t('period.choosePeriod');
    },

    _periods() {
      if (this.$route.name === 'ItemHome') {
        return this.periods.map((p) => ({
          label: p.name,
          key: p.id,
          id: p.id,
          startDate: p.startDate.toDate(),
          endDate: p.endDate.toDate(),
        }));
      }
      if (this.isMeasurementsView) {
        return Object.values(getPeriods());
      }
      return [];
    },

    isMeasurementsView() {
      return ['ItemMeasurements', 'ItemMeasurementsList'].includes(this.$route.name);
    },
  },

  methods: {
    ...mapActions(['setSelectedPeriod']),

    onOpen() {
      // Reset the internal range property to the currenct period selection when
      // toggling the picker. This to ensure that no invalid (incomplete) range
      // selections are kept in the component state, and that the range is set
      // correctly when navigation back to the parent view.
      const { startDate, endDate } = this.selectedPeriod;
      this.range = startDate && endDate ? [startDate, endDate] : null;
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
      this.setSelectedPeriod({
        startDate: range[0],
        endDate: endOfDay(range[1]),
        label: [...new Set(range.map(dateLongCompact))].join(
          this.$refs.datePicker.fp.l10n.rangeSeparator
        ),
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

    ::v-deep .nav-menu-item__content {
      border: 1px solid red;
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
