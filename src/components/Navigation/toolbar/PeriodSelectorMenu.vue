<script setup>
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useKpisStore } from '@/store/kpis';
import { useOkrsStore } from '@/store/okrs';
import { getPeriods } from '@/config/periods';
import PeriodSelector from '@/components/period/PeriodSelector.vue';
import { NavMenu, NavMenuItem, NavMenuText } from '../navbar';

const route = useRoute();
const i18n = useI18n();

const { period: kpiPeriod } = storeToRefs(useKpisStore());
const { period: okrPeriod } = storeToRefs(useOkrsStore());

const predefinedPeriods = computed(() => Object.values(getPeriods()));

const period = computed({
  get() {
    return route.name === 'ItemMeasurements' ? kpiPeriod.value : okrPeriod.value;
  },
  set(selectedPeriod) {
    if (route.name === 'ItemMeasurements') {
      kpiPeriod.value = selectedPeriod;
    } else {
      okrPeriod.value = selectedPeriod;
    }
  },
});

const periodLabel = computed(() =>
  period.value ? period.value.label : i18n.t('period.choosePeriod')
);
</script>

<template>
  <NavMenu class="period-selector-menu">
    <NavMenuText
      :text="`${$t('general.period')}:`"
      strong
      class="period-selector-menu__label pkt-show-tablet-up"
    />
    <NavMenuItem v-slot="{ close }" :text="periodLabel" dropdown>
      <PeriodSelector
        v-model="period"
        :period-shortcuts="predefinedPeriods"
        :max-months="3"
        class="period-selector-menu__dropdown"
        @select="close"
      />
    </NavMenuItem>
  </NavMenu>
</template>

<style lang="scss" scoped>
@use '@oslokommune/punkt-css/dist/scss/abstracts/mixins/breakpoints' as *;

.period-selector-menu {
  &__dropdown {
    width: 100vw;

    @include bp('tablet-up') {
      width: unset;
      min-width: 10rem;
    }

    :deep(.period-selector__options button) {
      min-height: 4rem;

      @media screen and (min-width: 0rem) and (max-width: 28rem) {
        width: 100%;
      }
    }
  }

  &__label {
    :deep(.nav-menu-text__inner) {
      padding-right: 0;
    }
  }
}
</style>
