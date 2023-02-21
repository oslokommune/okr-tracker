<template>
  <nav v-if="activeItem" class="tabs" role="tablist">
    <router-link
      v-for="(tab, index) in tabs"
      :key="index"
      :to="{ name: tab.route }"
      class="btn btn--sec tabs__tab"
      role="tab"
    >
      {{ tab.label }}
    </router-link>

    <router-link
      v-if="hasEditRights"
      :to="{ name: 'ItemAdmin', query: adminLinkQuery }"
      class="btn btn--sec tabs__tab tabs__tab--right"
      role="tab"
    >
      <pkt-icon name="cogwheel" /> {{ $t('general.admin') }}
    </router-link>
  </nav>
</template>

<script>
import { mapState, mapGetters } from 'vuex';

export default {
  name: 'ItemTabBar',

  computed: {
    ...mapState(['activeItem', 'activeObjective', 'activeKeyResult', 'activeKpi']),
    ...mapGetters(['hasEditRights']),

    tabs() {
      return [
        {
          route: 'ItemHome',
          label: this.$t('general.OKRsLong'),
        },
        {
          route: 'ItemMeasurements',
          label: this.$t('general.KPIs'),
        },
        {
          route: 'ItemAbout',
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
.tabs {
  position: sticky;
  top: 4rem;
  z-index: 20;
  display: flex;
  flex-grow: 1;
  box-sizing: border-box;
  padding: 0 1.5rem;
  background-color: var(--color-white);

  &__tab {
    padding: 1rem;
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
