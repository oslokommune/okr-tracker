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
                v-if="isPOCDepartment"
                class="dashboard__departmentInfoBox"
                :title="$t('dashboard.targetAudience')"
              >
                <template #icon>
                  <icon-two-people-dancing />
                </template>
                <div>
                  Frivillige lag og organisasjoner som trenger lokaler til sin
                  aktivitet Innbyggere som benytter seg av kommunens meråpne
                  tjenester Ansatte i de meråpne tjenestene, samt ansatte i
                  virksomheter som låner/leier ut lokaler
                </div>
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
    <dashboard-section class="dashboard__heyThereSection">
      <template #title>
        <h2 class="title-2">
          <icon-heart-hand />{{ $t('dashboard.heyThere') }}
        </h2>
      </template>
      <template #content>
        <div class="dashboard__contactUs">
          Dette dashboardet er et produkt under regi av team
          <strong>Dataspeilet</strong>, med hensikt å synliggjøre verdien av
          Origo. Dersom du har spørsmål, innspill eller tilbakemeldinger, er det
          bare å ta kontakt med vår teamlead
          <a href="mailto:charlotte.frisk@origo.oslo.kommune.no">
            <strong>Charlotte Frisk</strong>
          </a>
          eller skrive til oss i
          <a
            href="https://join.slack.com/share/enQtMzc0ODU4MzYyODg0OC1iY2MzZGI2YTVhMGJjZDQxN2Q4ZGY0NDMxNDNlZWYzYzg0NDRhZWM0NDgyZDkwZjVjNDEwMzA3NmYzNDAzM2Fm"
          >
            <strong>#origo-dataspeilet</strong> </a
          >.
        </div>
      </template>
    </dashboard-section>
  </main>
</template>

<script>
import { mapState } from 'vuex';
import getActiveItemType from '@/util/getActiveItemType';
import DashboardSection from './DashboardSection.vue';
import DashboardResultIndicatorsSection from '../components/DashboardResultIndicatorsSection.vue';
import DashboardDepartmentInfoBox from '../components/DashboardDepartmentInfoBox.vue';
import HTMLOutput from '../components/HTMLOutput.vue';
import IconHeartHand from '../components/IconHeartHand.vue';
import IconHandsGlobe from '../components/IconHandsGlobe.vue';
import IconTwoPeopleDancing from '../components/IconTwoPeopleDancing.vue';

const POC_DEPARTMENTS = ['apen-by', 'mayn-sitt-omrade'];

export default {
  name: 'DashboardHome',
  components: {
    ObjectiveProgression: () =>
      import('@/components/widgets/ObjectiveProgression.vue'),
    DashboardSection,
    DashboardResultIndicatorsSection,
    DashboardDepartmentInfoBox,
    HTMLOutput,
    IconHeartHand,
    IconHandsGlobe,
    IconTwoPeopleDancing,
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
  &__objectivesList {
    margin: -0.5rem;
    display: flex;
    flex-wrap: wrap;
  }

  &__objective {
    margin: 0.5rem;
    padding: 1rem;
    display: flex;
    flex: 0 0 calc(100% - 1rem);
    background: var(--color-white);

    @media screen and (min-width: bp(s)) {
      flex: 0 0 calc(50% - 1rem);
    }

    @media screen and (min-width: bp(m)) {
      flex: 0 0 calc(25% - 1rem);
    }
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

  &__heyThereSection {
    margin: 2.5rem auto 0;
    padding-bottom: 4rem;
    color: var(--color-text);
    font-weight: 500;
    line-height: 1.25rem;

    .title-2 {
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;

      svg {
        margin-right: 0.5rem;
      }
    }
  }

  &__contactUs {
    @media screen and (min-width: bp(m)) {
      width: 50%;
    }
  }
}
</style>
