<template>
  <nav-menu class="period-selector-menu">
    <nav-menu-text
      :text="`${$t('general.period')}:`"
      strong
      class="period-selector-menu__label pkt-show-phablet-up"
    />
    <nav-menu-item v-slot="{ close }" :text="periodLabel" dropdown>
      <period-selector
        v-model="period"
        :options="_predefinedPeriods"
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
    ...mapState(['selectedPeriod']),

    period: {
      get() {
        return this.selectedPeriod;
      },
      set(value) {
        this.setSelectedPeriod(value);
      },
    },

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
  },
};
</script>

<style lang="scss" scoped>
@use '@oslokommune/punkt-css/dist/scss/abstracts/mixins/breakpoints' as *;

.period-selector-menu {
  &__dropdown {
    width: 100vw;

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
}
</style>
