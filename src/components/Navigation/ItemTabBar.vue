<template>
  <div class="sub-navigation">
    <nav v-if="activeItem" class="tabs" role="tablist">
      <router-link
        v-for="(tab, index) in itemTabs"
        :key="index"
        :to="tab.route"
        class="btn btn--sec tabs__tab"
        role="tab"
      >
        {{ tab.label }}
      </router-link>

      <router-link
        v-if="hasEditRights"
        :to="{ name: 'ItemAdmin', query: adminLinkQuery }"
        class="btn btn--sec tabs__tab"
        role="tab"
      >
        {{ $t('general.admin') }}
      </router-link>
    </nav>

    <dashboard-period-selector v-if="$route.name === 'ItemMeasurements'" />
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import DashboardPeriodSelector from '@/components/DashboardPeriodSelector.vue';

export default {
  name: 'ItemTabBar',

  components: {
    DashboardPeriodSelector,
  },

  computed: {
    ...mapState(['activeItem', 'activeObjective', 'activeKeyResult', 'activeKpi']),
    ...mapGetters(['hasEditRights']),

    itemTabs() {
      return [
        {
          route: { name: 'ItemHome' },
          label: this.$t('general.OKRsLong'),
        },
        {
          route: { name: 'ItemMeasurements' },
          label: this.$t('general.KPIs'),
        },
        {
          route: { name: 'ItemAbout' },
          label: `${this.$t('about.about')} ${this.activeItem.name}`,
        },
      ];
    },

    adminLinkQuery() {
      switch (this.$route.name) {
        case 'ItemHome':
          return { tab: 'okr' };
        case 'ObjectiveHome':
          return { tab: 'okr', type: 'objective', id: this.activeObjective?.id };
        case 'KeyResultHome':
          return { tab: 'okr', type: 'keyResult', id: this.activeKeyResult?.id };
        case 'ItemMeasurements':
          return { tab: 'kpi' };
        case 'KpiHome':
          return { tab: 'kpi', id: this.activeKpi?.id };
        default:
          return {};
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.sub-navigation {
  position: sticky;
  top: 4rem;
  z-index: 20;
  display: flex;
}

.tabs {
  display: flex;
  flex-grow: 1;
  box-sizing: border-box;
  padding: 0 1.5rem;
  background-color: var(--color-white);

  &__tab {
    padding: 1.25rem 1rem;
    color: var(--color-grayscale-40);
    border: unset;

    > svg {
      --fg-color: var(--color-grayscale-40);
      height: 1rem;
      margin-right: 0.5rem;
    }

    &--right {
      margin-left: auto;
    }

    &.router-link-active {
      position: relative;
      color: var(--color-blue-dark);
      cursor: default;

      > svg {
        --fg-color: var(--color-blue-dark);
      }

      &::after {
        position: absolute;
        right: 0;
        bottom: 0;
        left: 0;
        height: 0.25rem;
        background-color: var(--color-active-light);
        content: '';
      }
    }

    &:hover:not(.router-link-active):not(:disabled) {
      position: relative;
      color: var(--color-blue-dark);
      background-color: var(--color-gray-light);
    }
  }
}
</style>
