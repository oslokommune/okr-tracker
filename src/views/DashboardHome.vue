<template>
  <div ref="dashboard" class="dashboard">
    <div class="dashboard__contentWrapper">
      <aside class="dashboard__aside">
        <!-- <widget-wrapper
          v-if="isPOCDepartment"
          :title="$t('dashboard.problemDescription')"
        >
          Tilgang på lokaler er en av de største utfordringene for
          frivilligheten i Oslo Stor konkurranse om lokalene og mange aktører
          som har behov for et sted å være Vanskelig å få oversikt over hvilke
          kommunale lokaler som er tilgjengelige Vanskelig å vite hvem man skal
          kontakte for å få tilgang til lokaler
        </widget-wrapper> -->
        <!-- <widget-wrapper
          v-if="isPOCDepartment"
          :title="$t('dashboard.targetAudience')"
        >
          Frivillige lag og organisasjoner som trenger lokaler til sin aktivitet
          Innbyggere som benytter seg av kommunens meråpne tjenester Ansatte i
          de meråpne tjenestene, samt ansatte i virksomheter som låner/leier ut
          lokaler
        </widget-wrapper> -->
        <widget-mission-statement />
        <!-- <widget-wrapper v-if="isPOCDepartment" :title="$t('dashboard.effect')">
          Forbedre og forenkle frivillighetens tilgang til kommunens lokaler
          Gjennom våre løsninger bidra til å øke antallet konsumerte kulturtimer
          i Oslo
        </widget-wrapper> -->
      </aside>
      <main class="dashboard__main">
        <section class="dashboard__section">
          <h2 class="title-2">Resultatindikator</h2>
          <ul class="dashboard__kpiList">
            <li v-for="kpi in kpis" :key="kpi.type">
              <KPI :kpi-type="kpi.type" :kpi="kpi" />
            </li>
          </ul>
        </section>
        <section class="dashboard__section">
          <h2 class="title-2">Områdets mål</h2>
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

export default {
  name: 'DashboardHome',

  components: {
    WidgetMissionStatement: () =>
      import('@/components/widgets/WidgetMissionStatement.vue'),
    // WidgetWrapper: () => import('@/components/widgets/WidgetWrapper.vue'),
    KPI: () => import('@/components/KPI.vue'),
    ObjectiveProgression: () =>
      import('@/components/widgets/ObjectiveProgression.vue'),
  },

  data: () => ({
    isPOCDepartment: false,
  }),

  computed: {
    ...mapState(['activeItem', 'objectives', 'kpis']),
  },

  watch: {
    activeItem: {
      immediate: true,
      handler(val) {
        if (val.slug === 'apen-by') {
          this.isPOCDepartment = true;
        }
      },
    },
  },

  mounted() {
    // this.enterFullscreen();
  },

  methods: {
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

  &__main {
    flex: 0 0 calc(80% - 1.25rem);
  }

  &__section {
    margin-bottom: 2rem;

    & .title-2 {
      margin: 0.5rem 0;
    }
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

    & .widget {
      align-self: stretch;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
  }
}
</style>
