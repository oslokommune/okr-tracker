<template>
  <main class="dashboard">
    <div class="dashboard__departmentInfo">
      <dashboard-section>
        <template #content>
          <div class="dashboard__departmentInfoWrapper">
            <div class="dashboard__departmentInfoBoxes">
              <h4 class="title-4">{{ $t('general.departmentAbout') }}</h4>
              <dashboard-department-info-box
                class="dashboard__departmentInfoBox"
                :title="$t('document.mission')"
              >
                <template #icon>
                  <pkt-icon name="hands-globe" />
                </template>
                <HTML-output :html="activeItem.missionStatement" />
              </dashboard-department-info-box>
              <dashboard-department-info-box
                class="dashboard__departmentInfoBox"
                :title="$t('dashboard.targetAudience')"
              >
                <template #icon>
                  <pkt-icon name="two-people-dancing" />
                </template>
                <HTML-output
                  v-if="activeItem.targetAudience"
                  :html="activeItem.targetAudience"
                />
              </dashboard-department-info-box>
            </div>
            <div class="dashboard__departmentInfoBoxes">
              <h4 class="title-4">{{ $t('general.products') }}</h4>
              <dashboard-department-info-box
                v-for="product in filteredProducts"
                :key="product.id"
                class="dashboard__departmentInfoBox"
                :title="product.name"
              >
                <HTML-output :html="product.missionStatement" />
              </dashboard-department-info-box>
            </div>
          </div>
        </template>
      </dashboard-section>
    </div>
    <dashboard-section>
      <template #title>
        <h2 class="title-1">
          {{ $t('general.resultIndicator') }}
        </h2>
      </template>
      <template #content>
        <dashboard-result-indicators-section />
      </template>
    </dashboard-section>
    <dashboard-section>
      <template #title>
        <h2 class="title-1">
          {{ $t('general.keyFigures') }}
        </h2>
      </template>
      <template #content>
        <ul v-if="keyFigures.length" class="dashboard__cardList">
          <li
            v-for="keyFigure in keyFigures"
            :key="keyFigure.id"
            class="dashboard__cardListItem dashboard__keyFigure"
          >
            <key-figure :key-figure="keyFigure" />
          </li>
        </ul>
        <empty-state
          v-else
          :icon="'exclamation'"
          :heading="$t('empty.noKPIs.heading')"
          :body="$t('empty.noKPIs.body')"
        >
          <router-link
            v-if="hasEditRights"
            :to="{ name: 'ItemAdmin', query: { tab: 'kpi' } }"
            class="btn btn--ter"
          >
            {{ $t('empty.noKPIs.linkText') }}
          </router-link>
        </empty-state>
      </template>
    </dashboard-section>
    <dashboard-section>
      <template #title>
        <h2 class="title-1">
          {{ $t('general.departmentObjectives') }}
        </h2>
      </template>
      <template #content>
        <ul class="dashboard__cardList">
          <li
            v-for="objective in objectives"
            :key="objective.id"
            class="dashboard__cardListItem dashboard__departmentObjective"
          >
            <objective-progression :objective="objective" />
          </li>
        </ul>
      </template>
    </dashboard-section>
  </main>
</template>

<script>
import { mapState, mapGetters } from 'vuex';

import getActiveItemType from '@/util/getActiveItemType';
import ObjectiveProgression from '@/components/widgets/ObjectiveProgression.vue';
import DashboardResultIndicatorsSection from '@/components/DashboardResultIndicatorsSection.vue';
import DashboardDepartmentInfoBox from '@/components/DashboardDepartmentInfoBox.vue';
import HTMLOutput from '@/components/HTMLOutput.vue';
import KeyFigure from '@/components/KeyFigure.vue';
import EmptyState from '@/components/EmptyState.vue';
import DashboardSection from '@/components/DashboardSection.vue';

export default {
  name: 'DashboardHome',
  components: {
    ObjectiveProgression,
    DashboardSection,
    DashboardResultIndicatorsSection,
    DashboardDepartmentInfoBox,
    HTMLOutput,
    KeyFigure,
    EmptyState,
  },

  data: () => ({
    activeItemType: null,
    filteredProducts: [],
  }),

  computed: {
    ...mapState([
      'kpis',
      'subKpis',
      'activeItem',
      'objectives',
      'departments',
      'products',
    ]),
    ...mapGetters(['hasEditRights']),
    keyFigures() {
      return [
        ...this.kpis.filter((kpi) => kpi.kpiType === 'keyfig'),
        ...this.subKpis.filter((kpi) => kpi.kpiType === 'keyfig'),
      ];
    },
  },

  watch: {
    activeItem: {
      immediate: true,
      handler(item) {
        this.activeItemType = getActiveItemType(item);
        this.filterProducts();
      },
    },
  },

  methods: {
    filterProducts() {
      if (this.activeItemType === 'department') {
        this.filteredProducts = this.products.filter(
          (product) => product.department.id === this.activeItem.id
        );
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.dashboard {
  padding-bottom: 5rem;

  &__cardList {
    display: flex;
    flex-wrap: wrap;
    margin: -0.5rem;
  }

  &__cardListItem {
    margin: 0.5rem;
    padding: 1rem;
    background: var(--color-white);
  }

  &__keyFigure {
    display: flex;
    flex: 0 0 calc(100% - 1rem);

    @media screen and (min-width: bp(xs)) {
      flex: 0 0 calc(50% - 1rem);
    }

    @media screen and (min-width: bp(s)) {
      flex: 0 0 calc(25% - 1rem);
    }

    @media screen and (min-width: bp(m)) {
      flex: 0 0 calc(20% - 1rem);
    }
  }

  &__departmentObjective {
    flex: 0 0 100%;
  }

  &__departmentInfo {
    overflow: auto;
    background: var(--color-blue-5);

    .dashboardSection {
      margin: 40px auto;
    }
  }

  &__departmentInfoWrapper {
    align-items: flex-start;
    justify-content: space-between;

    @media screen and (min-width: bp(l)) {
      display: flex;
    }
  }

  &__departmentInfoBoxes {
    flex: 0 0 calc(50% - 3rem);
    flex-wrap: wrap;
    justify-content: space-between;
    margin: 3.5rem 0;

    @media screen and (min-width: bp(s)) {
      display: flex;
      margin: 1rem 0;
    }

    @media screen and (min-width: bp(l)) {
      flex: 0 0 calc(50% - 4.25rem);
    }

    .title-4 {
      flex: 100%;
      margin-bottom: 1.5rem;
      color: var(--color-text);
    }
  }

  &__departmentInfoBox {
    margin-bottom: 2rem;
  }

  & > .dashboardSection:last-of-type {
    margin-bottom: 0;
  }
}
</style>
