<template>
  <nav-menu class="period-selector-menu">
    <nav-menu-text
      :text="`${$t('general.period')}:`"
      strong
      class="period-selector-menu__label pkt-show-tablet-up"
    />
    <nav-menu-item v-slot="{ close }" :text="periodLabel" dropdown>
      <period-selector
        v-model="period"
        :options="_predefinedPeriods"
        :max-months="3"
        class="period-selector-menu__dropdown"
        @input="close"
      />
    </nav-menu-item>
  </nav-menu>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { getPeriods } from '@/config/periods';
import NavMenu from '@/components/Navigation/navbar/NavMenu.vue';
import NavMenuItem from '@/components/Navigation/navbar/NavMenuItem.vue';
import NavMenuText from '@/components/Navigation/navbar/NavMenuText.vue';
import PeriodSelector from '@/components/period/PeriodSelector.vue';

export default {
  name: 'PeriodSelectorMenu',

  components: {
    NavMenu,
    NavMenuItem,
    NavMenuText,
    PeriodSelector,
  },

  computed: {
    ...mapState('okrs', { okrPeriod: 'selectedPeriod' }),
    ...mapState('kpis', { kpiPeriod: 'selectedPeriod' }),

    period: {
      get() {
        return this.isMeasurementsRoute ? this.kpiPeriod : this.okrPeriod;
      },
      set(value) {
        const setSelectedPeriod = this.isMeasurementsRoute
          ? this.setKpiPeriod
          : this.setOkrPeriod;
        setSelectedPeriod(value);
      },
    },

    periodLabel() {
      return this.period ? this.period.label : this.$t('period.choosePeriod');
    },

    _predefinedPeriods() {
      return Object.values(getPeriods());
    },

    isMeasurementsRoute() {
      return this.$route.name === 'ItemMeasurements';
    },
  },

  methods: {
    ...mapActions('okrs', { setOkrPeriod: 'setSelectedPeriod' }),
    ...mapActions('kpis', { setKpiPeriod: 'setSelectedPeriod' }),
  },
};
</script>

<style lang="scss" scoped>
@use '@oslokommune/punkt-css/dist/scss/abstracts/mixins/breakpoints' as *;

.period-selector-menu {
  &__dropdown {
    width: 100vw;

    @include bp('tablet-up') {
      width: unset;
      min-width: 10rem;
    }

    ::v-deep .period-selector__options button {
      min-height: 4rem;

      @media screen and (min-width: 0rem) and (max-width: 28rem) {
        width: 100%;
      }
    }
  }

  &__label {
    ::v-deep .nav-menu-text__inner {
      padding-right: 0;
    }
  }
}
</style>
