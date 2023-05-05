<template>
  <div class="sub-navigation">
    <nav v-if="activeItem" class="sub-navigation__menu">
      <template v-for="(tabMenu, tabMenuIndex) in itemTabs">
        <menu
          v-if="tabMenu.show === undefined ? true : tabMenu.show"
          :key="`item_tabs_${tabMenuIndex}`"
          :class="['tabs', { 'tabs--right': tabMenu.right }]"
          role="tablist"
        >
          <li
            v-for="(tabItem, tabItemIndex) in tabMenu.items"
            :key="`item_tab_${tabItemIndex}`"
            class="tabs__tab-wrapper"
            role="tab"
          >
            <router-link
              v-slot="{ href, navigate, isExactActive }"
              :to="tabItem.route"
              custom
            >
              <a
                v-tooltip.bottom="tabItem.tooltip"
                :href="href"
                :class="[
                  'tabs__tab',
                  { 'tabs__tab--toggle': tabMenu.type },
                  {
                    'tabs__tab--active': tabItem.activeMatchOverride || isExactActive,
                  },
                ]"
                @click="navigate"
              >
                <pkt-icon v-if="tabItem.icon" :name="tabItem.icon" />
                <template v-if="tabItem.label && tabItem.type !== 'toggle'">
                  <span class="pkt-show-tablet-big-up">{{ tabItem.label }}</span>
                  <span class="pkt-hide-tablet-big-up">
                    {{ tabItem.shortLabel || tabItem.label }}
                  </span>
                </template>
              </a>
            </router-link>
          </li>
        </menu>
      </template>
    </nav>

    <period-selector
      v-if="_periods.length"
      class="sub-navigation__period"
      :periods="_periods"
      :show-date-picker="isMeasurementsView"
    />
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import PeriodSelector from '@/components/PeriodSelector.vue';
import getPeriods from '@/config/periods';

export default {
  name: 'ItemTabBar',

  components: {
    PeriodSelector,
  },

  computed: {
    ...mapState([
      'activeItem',
      'activeKeyResult',
      'activeKpi',
      'activeObjective',
      'periods',
      'selectedPeriod',
    ]),
    ...mapGetters(['hasEditRights']),

    itemTabs() {
      const { name, query } = this.$route;

      return [
        {
          items: [
            {
              route: { name: 'ItemHome' },
              label: this.$t('general.OKRsLong'),
              shortLabel: this.$t('general.OKRs'),
            },
            {
              route: { name: 'ItemMeasurements' },
              label: this.$t('general.KPIs'),
              activeMatchOverride: name === 'ItemMeasurements',
            },
            {
              route: { name: 'ItemAbout' },
              label: `${this.$t('about.about')} ${this.activeItem.name}`,
              shortLabel: this.$t('about.about'),
            },
            {
              show: this.hasEditRights,
              route: { name: 'ItemAdmin', query: this.adminLinkQuery },
              label: this.$t('general.admin'),
            },
          ],
        },
        {
          show: this.isMeasurementsView,
          right: true,
          type: 'toggle',
          items: [
            {
              route: {
                name: 'ItemMeasurements',
                query: {
                  resultIndicatorPeriod: this.selectedPeriod?.key,
                },
              },
              activeMatchOverride: name === 'ItemMeasurements' && query?.view !== 'list',
              icon: 'graph',
              tooltip: this.$t('tooltip.changeView', {
                view: this.$t('view.details'),
              }),
            },
            {
              route: {
                name: 'ItemMeasurements',
                query: {
                  view: 'list',
                  resultIndicatorPeriod: this.selectedPeriod?.key,
                },
              },
              icon: 'list',
              tooltip: this.$t('tooltip.changeView', {
                view: this.$t('view.list'),
              }),
            },
          ],
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
        default:
          return {};
      }
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
};
</script>

<style lang="scss" scoped>
.sub-navigation {
  position: sticky;
  top: 4rem;
  z-index: 20;
  display: flex;
  background-color: var(--color-white);
  border-bottom: 1px solid var(--color-grayscale-10);

  &__menu {
    display: flex;
    flex-grow: 1;
  }

  &__period {
    padding-left: 2rem;
  }
}

.tabs {
  display: flex;
  list-style: none;

  &--right {
    margin-left: auto;
  }

  &__tab {
    $tab-selector: &;
    $tab-line-height: 1.25rem;

    &-wrapper {
      display: flex;
      align-items: center;
    }

    display: flex;
    gap: 0.5rem;
    align-items: center;
    color: var(--color-grayscale-40);
    font-weight: 500;
    line-height: $tab-line-height;
    text-decoration: none;

    svg {
      --fg-color: var(--color-grayscale-40);
      height: $tab-line-height;
    }

    &--active,
    &:hover {
      color: var(--color-blue-dark);

      svg {
        --fg-color: var(--color-blue-dark);
      }
    }

    &:not(#{$tab-selector}--toggle) {
      position: relative;
      padding: 1rem;

      &#{$tab-selector}--active {
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

      &:hover:not(#{$tab-selector}--active) {
        background-color: var(--color-gray-light);
      }
    }

    &--toggle {
      margin: 0 0.15rem;
      padding: 0.5rem;
      border-radius: 50%;

      &#{$tab-selector}--active {
        background-color: var(--color-beige-light);
      }

      &:hover:not(#{$tab-selector}--active) {
        background-color: var(--color-gray-light);
      }
    }
  }
}
</style>
