<template>
  <div ref="dashboard" class="dashboard">
    <div class="dashboard__contentWrapper">
      <aside class="dashboard__aside">
        <widget-mission-statement />
        <div>
          <widget-wrapper
            v-if="isPOCDepartment"
            :title="$t('dashboard.targetAudience')"
          >
            Frivillige lag og organisasjoner som trenger lokaler til sin
            aktivitet Innbyggere som benytter seg av kommunens meråpne tjenester
            Ansatte i de meråpne tjenestene, samt ansatte i virksomheter som
            låner/leier ut lokaler
          </widget-wrapper>

          <div
            v-if="filteredProducts.length > 0"
            class="dashboard__productSection"
          >
            <div class="title-3">{{ $t('general.products') }}</div>
            <widget-wrapper
              v-for="product in filteredProducts"
              :key="product.id"
              :title="product.name"
            >
              {{ product.missionStatement }}
            </widget-wrapper>
          </div>
        </div>
      </aside>
      <main class="dashboard__main">
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
              {{ $t('general.departmentObjectives') }}
            </h2>
          </template>
          <template #content>
            <ul class="dashboard__objectivesList">
              <li
                v-for="objective in objectives"
                :key="objective.id"
                class="dashboard__objective"
              >
                <objective-progression :objective="objective" />
              </li>
            </ul>
          </template>
        </dashboard-section>
      </main>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import getActiveItemType from '@/util/getActiveItemType';
import DashboardSection from './DashboardSection.vue';
import DashboardResultIndicatorsSection from '../components/DashboardResultIndicatorsSection.vue';

const POC_DEPARTMENTS = ['apen-by', 'origo'];

export default {
  name: 'DashboardHome',
  components: {
    WidgetMissionStatement: () =>
      import('@/components/widgets/WidgetMissionStatement.vue'),
    WidgetWrapper: () => import('@/components/widgets/WidgetWrapper.vue'),
    ObjectiveProgression: () =>
      import('@/components/widgets/ObjectiveProgression.vue'),
    DashboardSection,
    DashboardResultIndicatorsSection,
  },

  data: () => ({
    activeItemType: null,
    filteredProducts: [],
  }),

  computed: {
    ...mapState(['activeItem', 'objectives', 'departments', 'products']),
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
  padding: 1rem;

  &__contentWrapper {
    display: flex;
  }

  &__aside {
    margin-right: 2.5rem;
    flex: 0 0 calc(20% - 1.25rem);
  }

  &__productSection {
    margin-top: 1rem;

    & .title-2 {
      color: var(--color-text);
    }
  }

  &__main {
    flex: 0 0 calc(80% - 1.25rem);
  }

  &__section {
    margin-bottom: 2rem;
    padding: 1.5rem;
    background: var(--color-white);

    & .title-1,
    & .title-2 {
      color: var(--color-text);
      font-weight: 500;
    }
  }

  &__sectionHeader {
    display: flex;
    justify-content: space-between;

    & .v-select {
      min-width: 10rem;
    }
  }

  &__resultIndicators {
    & .title-1 {
      margin: 0 0 1.5rem 0;
    }
  }

  hr {
    margin: 1.75rem 0 2.5rem 0;
    border-top: 0.125rem solid #f2f2f2;
  }

  &__objectives {
    & .title-1 {
      margin: 0 0 1rem 0;
    }
  }

  &__container {
    margin-top: 1rem;
  }

  &__kpiList {
    display: grid;
    grid-gap: 0.25rem;

    @media screen and (min-width: bp(m)) {
      grid-template-columns: repeat(3, minmax(10rem, 1fr));
    }
  }

  &__objectivesList {
    margin: -0.5rem;
    display: flex;
    flex-wrap: wrap;
  }

  &__objective {
    margin: 0.5rem;
    padding: 1rem;
    display: flex;
    flex: 0 0 calc(25% - 1rem);
    background: var(--color-white);
  }
}
</style>
