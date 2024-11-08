<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useKpisStore } from '@/store/kpis';
import { NavMenu, NavMenuItem, NavMenuText } from '../navbar';

const route = useRoute();
const i18n = useI18n();

const views = computed(() => {
  const { name, params } = route;

  if (name === 'ItemMeasurements') {
    const kpisStore = useKpisStore();

    if (kpisStore.kpis.length) {
      return [
        {
          key: 'list',
          name: i18n.t('view.list'),
          icon: 'list',
          route: {
            name: 'ItemMeasurements',
            query: {
              resultIndicatorPeriod: kpisStore?.key,
            },
          },
          active: name === 'ItemMeasurements' && !params?.kpiId,
        },
        {
          key: 'details',
          name: i18n.t('view.details'),
          icon: 'graph',
          route: {
            name: 'ItemMeasurements',
            params: {
              kpiId: kpisStore.kpis[0].id,
            },
            query: {
              resultIndicatorPeriod: kpisStore.period?.key,
            },
          },
          active: name === 'ItemMeasurements' && !!params?.kpiId,
        },
      ];
    }
  }

  return [];
});

const currentView = computed(() => {
  const { name, params } = route;
  if (name === 'ItemMeasurements') {
    return !params?.kpiId ? i18n.t('view.list') : i18n.t('view.details');
  }
  return null;
});
</script>

<template>
  <NavMenu v-if="views.length" class="view-toggle-menu" toggles>
    <NavMenuText class="pkt-show-phablet-up">
      <span class="view-toggle-menu__label">{{ $t('general.view') }}:</span>
      {{ currentView }}
    </NavMenuText>
    <NavMenuItem
      v-for="view in views"
      v-bind="view"
      :key="view.key"
      v-tooltip="$t('tooltip.changeView', { view: view.name })"
      :aria="{
        label: $t('tooltip.changeView', { view: view.name }),
        checked: view.active,
      }"
      role="menuitemradio"
    />
  </NavMenu>
</template>

<style lang="scss" scoped>
.view-toggle-menu {
  &__label {
    font-weight: 500;
  }
}
</style>
