<template>
  <div ref="dashboard" class="dashboard">
    <div class="dashboard__contentWrapper">
      <aside class="dashboard__aside">
        <widget-mission-statement />
        <div v-if="isPOCDepartment">
          <widget-wrapper :title="$t('dashboard.targetAudience')">
            Frivillige lag og organisasjoner som trenger lokaler til sin
            aktivitet Innbyggere som benytter seg av kommunens meråpne tjenester
            Ansatte i de meråpne tjenestene, samt ansatte i virksomheter som
            låner/leier ut lokaler
          </widget-wrapper>

          <div class="dashboard__productSection">
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
        <section
          v-if="resultIndicator"
          class="dashboard__section dashboard__resultIndicators"
        >
          <div class="dashboard__sectionHeader">
            <h2 class="title-1">{{ $t('general.resultIndicator') }}</h2>
            <div>
              <h3 class="title-2">Progressjon</h3>
              <v-select
                label="name"
                :options="resultIndicatorPeriods"
                :value="currentResultIndicatorPeriod"
                :components="{ Deselect: null }"
                @input="setCurrentResultIndicatorPeriod"
              />
            </div>
          </div>
          <hr />
          <div class="dashboard__container">
            <h3 class="title-3">{{ resultIndicator.name }}</h3>
            <svg ref="progressGraphSvg" />
          </div>
        </section>
        <section class="dashboard__section dashboard__objectives">
          <h2 class="title-1">Områdets mål</h2>
          <ul class="dashboard__objectivesList">
            <li
              v-for="objective in objectives"
              :key="objective.id"
              class="dashboard__objective"
            >
              <objective-progression :objective="objective" />
            </li>
          </ul>
        </section>
      </main>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { extent } from 'd3-array';
import { db } from '@/config/firebaseConfig';
import LineChart from '@/util/LineChart';

const getResultIndicatorPeriods = () => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();

  return {
    quarter: {
      name: '1. kvartal',
      value: 'quarter',
      startDate: new Date(currentYear, 0, 1),
      endDate: new Date(currentYear, 2, 31),
    },
    tertial: {
      name: 'tertial',
      value: 'tertial',
      startDate: new Date(currentYear, 0, 1),
      endDate: new Date(currentYear, 3, 30),
    },
    year: {
      name: 'hittil i år',
      value: 'year',
      startDate: new Date(currentYear, 0, 1),
      endDate: currentDate,
    },
  };
};

const RESULT_INDICATOR_PERIODS = getResultIndicatorPeriods();
const POC_DEPARTMENTS = ['apen-by', 'origo'];

export default {
  name: 'DashboardHome',

  components: {
    WidgetMissionStatement: () =>
      import('@/components/widgets/WidgetMissionStatement.vue'),
    WidgetWrapper: () => import('@/components/widgets/WidgetWrapper.vue'),
    ObjectiveProgression: () =>
      import('@/components/widgets/ObjectiveProgression.vue'),
  },

  data: () => ({
    resultIndicator: null,
    progressCollection: [],
    isPOCDepartment: false,
    resultIndicatorPeriods: Object.values(RESULT_INDICATOR_PERIODS).map(
      (period) => period
    ),
    currentResultIndicatorPeriod: RESULT_INDICATOR_PERIODS.quarter,
    filteredProducts: [],
  }),

  computed: {
    ...mapState([
      'activeItem',
      'objectives',
      'kpis',
      'theme',
      'departments',
      'products',
    ]),
  },

  watch: {
    $route: {
      immediate: true,
      async handler(current) {
        const { resultIndicatorPeriod } = current.query;

        if (resultIndicatorPeriod) {
          this.currentResultIndicatorPeriod =
            RESULT_INDICATOR_PERIODS[resultIndicatorPeriod];
        }
      },
    },
    currentResultIndicatorPeriod() {
      this.getProgressData(this.resultIndicator.id);
    },
    kpis: {
      immediate: true,
      async handler([resultIndicator]) {
        if (resultIndicator) {
          this.resultIndicator = resultIndicator;
        }
      },
    },
    resultIndicator: {
      immediate: true,
      handler(resultIndicator) {
        if (resultIndicator) {
          this.getProgressData();
        }
      },
    },
    progressCollection() {
      this.renderGraph();
    },
    activeItem: {
      immediate: true,
      handler({ slug }) {
        if (POC_DEPARTMENTS.includes(slug)) {
          this.isPOCDepartment = true;
          this.filterProducts();
        }
      },
    },
  },

  mounted() {
    // this.enterFullscreen();
  },

  methods: {
    setActiveTab(tabIndex) {
      this.activeTab = tabIndex;
    },
    filterProducts() {
      this.filteredProducts = this.products.filter(
        (product) => product.organization.id === this.activeItem.id
      );
    },
    async getProgressData() {
      const collection = db
        .collection(`kpis/${this.resultIndicator.id}/progress`)
        .where('timestamp', '>', this.currentResultIndicatorPeriod.startDate)
        .where('timestamp', '<', this.currentResultIndicatorPeriod.endDate)
        .orderBy('timestamp', 'desc');

      await this.$bind('progressCollection', collection);
    },
    setCurrentResultIndicatorPeriod(selectedPeriod) {
      this.currentResultIndicatorPeriod = selectedPeriod;
      this.$router.push({
        query: { resultIndicatorPeriod: selectedPeriod.value },
      });
    },
    renderGraph() {
      if (!this.graph) {
        this.graph = new LineChart(this.$refs.progressGraphSvg, {
          colorMode: this.theme,
        });
      }

      const [startValue, targetValue] = extent(
        this.progressCollection.map(({ value }) => value)
      );
      const [startDate, endDate] = extent(
        this.progressCollection.map(({ timestamp }) => timestamp)
      );

      this.graph.render({
        obj: {
          startValue,
          targetValue,
        },
        period: {
          startDate,
          endDate,
        },
        progressionList: this.progressCollection,
        item: this.kpis[0],
        theme: this.theme,
      });
    },
    enterFullscreen() {
      const elem = this.$refs.dashboard;

      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen();
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
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
    display: flex;
    margin-bottom: 0.5rem;
    flex: 0 0 calc(25% - 1rem);
    margin: 0.5rem;
    box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1);

    & .widget {
      align-self: stretch;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
  }
}
</style>
