<template>
  <page-layout>
    <template #default>
      <header>
        <h2 class="title-1">{{ $t('general.OKRsLong') }}</h2>
      </header>

      <section>
        <content-loader-action-bar
          v-if="dataLoading"
          class="itemHome__header--content-loader"
        ></content-loader-action-bar>
        <action-bar v-else-if="periodObjectives.length" />
        <content-loader-item v-if="dataLoading"></content-loader-item>
        <empty-state
          v-else-if="!periodObjectives.length && !dataLoading"
          :icon="'exclamation'"
          :heading="$t('empty.noPeriods.heading')"
          :body="$t('empty.noPeriods.body')"
        >
        </empty-state>
        <div v-if="periodObjectives.length && !dataLoading">
          <ul v-if="['compact', 'details'].includes(view)">
            <li
              v-for="objective in periodObjectives"
              :key="objective.id"
              class="itemHome__objectives--item"
            >
              <objective-row :objective="objective" :show-description="true">
              </objective-row>
              <ul v-if="objective.keyResults.length">
                <li
                  v-for="keyResult in objective.keyResults"
                  :key="keyResult.id"
                  class="keyResultRow"
                  :class="{ 'keyResultRow--isCompact': view === 'compact' }"
                >
                  <key-result-row :key-result="keyResult"></key-result-row>
                </li>
              </ul>
            </li>
          </ul>
          <gantt-chart
            v-else-if="view === 'timeline'"
            :objectives="periodObjectives"
            :item="activeItem"
          />
        </div>
        <div :data-mode="!periodObjectives.length && !dataLoading ? 'dark' : ''">
          <pkt-button
            v-tooltip="$t('btn.createObjective')"
            :text="$t('btn.createObjective')"
            :skin="!periodObjectives.length && !dataLoading ? 'primary' : 'tertiary'"
            variant="icon-left"
            icon-name="plus-sign"
            @onClick="$emit('click', openObjectiveDrawer())"
          />
        </div>
      </section>
    </template>

    <template v-if="selectedPeriod?.id && activeItem" #sidebar>
      <widget
        v-if="activePeriod && activePeriod.progression"
        :title="$t(`widget.progression.period`)"
        size="small"
      >
        <progression-chart
          :progression="activePeriod.progression"
          :period="activePeriod"
        />
      </widget>
      <widget-weights
        v-if="periodObjectives.length"
        type="objective"
        :active-item="activeItem"
        :items="periodObjectives"
      />
    </template>
  </page-layout>
</template>

<script>
import { mapGetters, mapState, mapActions, mapMutations } from 'vuex';
import { isBefore, addDays, isWithinInterval } from 'date-fns';
import { objectiveInPeriod } from '@/util/okr';
import { periodDates } from '@/util';
import ContentLoaderItem from '@/components/ContentLoader/ContentLoaderItem.vue';
import ContentLoaderActionBar from '@/components/ContentLoader/ContentLoaderActionBar.vue';
import WidgetWrapper from '@/components/widgets/WidgetWrapper.vue';
import WidgetWeights from '@/components/widgets/WidgetWeights.vue';
import ProgressionChart from '@/components/ProgressionChart.vue';
import { PktButton } from '@oslokommune/punkt-vue2';

export default {
  name: 'ItemHome',

  components: {
    ActionBar: () => import('@/components/ActionBar.vue'),
    GanttChart: () => import('@/components/GanttChart.vue'),
    ObjectiveRow: () => import('@/components/ObjectiveRow.vue'),
    KeyResultRow: () => import('@/components/KeyResultRow.vue'),
    EmptyState: () => import('@/components/EmptyState.vue'),
    Widget: WidgetWrapper,
    WidgetWeights,
    ProgressionChart,
    ContentLoaderItem,
    ContentLoaderActionBar,
    PktButton,
  },

  data: () => ({
    activeTab: 0,
  }),

  computed: {
    ...mapState([
      'activeItem',
      'activePeriod',
      'dataLoading',
      'keyResults',
      'objectives',
      'periods',
      'selectedPeriod',
      'user',
    ]),
    ...mapGetters(['hasEditRights']),

    view() {
      return this.user.preferences.view;
    },

    filteredPeriods() {
      if (this.hasEditRights) {
        return this.periods;
      }
      const daysInAdvance = 7; // Prior to period start

      return this.periods.filter(({ startDate }) =>
        isBefore(startDate.toDate(), addDays(new Date(), daysInAdvance))
      );
    },

    periodObjectives() {
      if (!this.selectedPeriod) {
        return [];
      }

      return this.objectives
        .filter((o) => objectiveInPeriod(this.selectedPeriod, o))
        .map((o) => ({
          ...o,
          id: o.id,
          keyResults: this.keyResults.filter(
            (kr) => kr.objective === `objectives/${o.id}`
          ),
        }));
    },
  },

  watch: {
    selectedPeriod: {
      immediate: true,
      handler() {
        if (this.selectedPeriod && this.selectedPeriod.id) {
          this.setPeriod(this.selectedPeriod.id, false);
        }
      },
    },
  },

  created() {
    if (this.filteredPeriods.length > 0) {
      const defaultPeriodIndex = this.getCurrentPeriodIndex() || 0;
      this.setPeriod(this.filteredPeriods[defaultPeriodIndex].id, true);
    } else {
      this.setPeriod(null, false);
    }
  },

  methods: {
    ...mapActions(['set_active_period_and_data', 'setDataLoading', 'setSelectedPeriod']),
    ...mapMutations(['TOGGLE_DRAWER']),

    openObjectiveDrawer() {
      this.TOGGLE_DRAWER({
        type: 'objective',
        show: 'true',
        content: null,
      });
    },

    async setPeriod(activePeriodId, setSelectedPeriod) {
      try {
        await this.setDataLoading(true);
        await this.set_active_period_and_data(activePeriodId);
        if (setSelectedPeriod) {
          await this.setSelectedPeriod({
            label: this.activePeriod.name,
            key: this.activePeriod.id,
            id: this.activePeriod.id,
            startDate: this.activePeriod.startDate.toDate(),
            endDate: this.activePeriod.endDate.toDate(),
          });
        }
      } catch (e) {
        console.log(e);
      } finally {
        await this.setDataLoading(false);
      }
    },

    periodDates,

    getCurrentPeriodIndex() {
      const now = new Date();

      for (const [index, period] of this.filteredPeriods.entries()) {
        if (
          period.startDate &&
          period.endDate &&
          isWithinInterval(now, {
            start: period.startDate.toDate(),
            end: period.endDate.toDate(),
          })
        ) {
          return index;
        }
      }
      return null;
    },
  },
};
</script>

<style lang="scss" scoped>
.keyResultRow {
  &:not(:first-child) {
    margin-top: 4px;
  }

  &--isCompact {
    @media screen and (min-width: bp(s)) {
      &:not(:first-child) {
        margin-top: 1px;
      }
    }
  }
}

.itemHome__objectives--item {
  margin-bottom: 1rem;
  border: 2px solid var(--color-border);

  > ul {
    padding-bottom: 0.5rem;
  }
}
</style>
