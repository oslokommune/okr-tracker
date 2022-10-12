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
                :icon="() => null"
                :title="$t('document.mission')"
              >
                <template #icon>
                  <icon-hands-globe />
                </template>
                <HTML-output :html="activeItem.missionStatement" />
              </dashboard-department-info-box>
              <dashboard-department-info-box
                class="dashboard__departmentInfoBox"
                :title="$t('dashboard.targetAudience')"
              >
                <template #icon>
                  <icon-two-people-dancing />
                </template>
                <HTML-output v-if="activeItem.targetAudience" :html="activeItem.targetAudience" />
              </dashboard-department-info-box>
            </div>
            <div class="dashboard__departmentInfoBoxes">
              <h4 class="title-4">{{ $t('general.products') }}</h4>
              <dashboard-department-info-box
                v-for="product in filteredProducts"
                class="dashboard__departmentInfoBox"
                :key="product.id"
                :icon="() => null"
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
        <dashboard-result-indicators-section
          :isPOCDepartment="isPOCDepartment"
        />
      </template>
    </dashboard-section>
    <dashboard-section v-if="isPOCDepartment">
      <template #title>
        <h2 class="title-1">
          {{ $t('general.keyFigures') }}
        </h2>
      </template>
      <template #content>
        <ul class="dashboard__cardList">
          <li
            v-for="keyFigure in keyFigures"
            :key="keyFigure.id"
            class="dashboard__cardListItem dashboard__keyFigure"
          >
            <key-figure :keyFigure="keyFigure" />
          </li>
        </ul>
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
import { mapState } from 'vuex';

import getActiveItemType from '@/util/getActiveItemType';
import ObjectiveProgression from '@/components/widgets/ObjectiveProgression.vue';
import DashboardResultIndicatorsSection from '@/components/DashboardResultIndicatorsSection.vue';
import DashboardDepartmentInfoBox from '@/components/DashboardDepartmentInfoBox.vue';
import HTMLOutput from '@/components/HTMLOutput.vue';
import IconHeartHand from '@/components/IconHeartHand.vue';
import IconHandsGlobe from '@/components/IconHandsGlobe.vue';
import IconTwoPeopleDancing from '@/components/IconTwoPeopleDancing.vue';
import KeyFigure from '@/components/KeyFigure.vue';

import DashboardSection from './DashboardSection.vue';
import { KEY_FIGURES, POC_DEPARTMENTS } from './data/staticData';

export default {
  name: 'DashboardHome',
  components: {
    ObjectiveProgression,
    DashboardSection,
    DashboardResultIndicatorsSection,
    DashboardDepartmentInfoBox,
    HTMLOutput,
    IconHeartHand,
    IconHandsGlobe,
    IconTwoPeopleDancing,
    KeyFigure,
  },

  data: () => ({
    isPOCDepartment: false,
    activeItemType: null,
    filteredProducts: [],
  }),

  computed: {
    ...mapState(['activeItem', 'objectives', 'departments', 'products']),
    keyFigures() {
      return KEY_FIGURES;
    },
  },

  watch: {
    activeItem: {
      immediate: true,
      handler(item) {
        const { slug } = item;

        this.activeItemType = getActiveItemType(item);
        this.filterProducts();

        if (POC_DEPARTMENTS.includes(slug)) {
          this.isPOCDepartment = true;
        }
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
    margin: -0.5rem;
    display: flex;
    flex-wrap: wrap;
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
    background: #f1fdff;

    .dashboardSection {
      margin: 40px auto;
    }
  }

  &__departmentInfoWrapper {
    justify-content: space-between;
    align-items: flex-start;

    @media screen and (min-width: bp(l)) {
      display: flex;
    }
  }

  &__departmentInfoBoxes {
    margin: 3.5rem 0;
    flex-wrap: wrap;
    justify-content: space-between;
    flex: 0 0 calc(50% - 3rem);

    @media screen and (min-width: bp(s)) {
      margin: 1rem 0;
      display: flex;
    }

    @media screen and (min-width: bp(l)) {
      flex: 0 0 calc(50% - 4.25rem);
    }

    .title-4 {
      margin-bottom: 1.5rem;
      flex: 100%;
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
