<template>
  <div v-if="activeObjective" class="container">
    <main class="main">
      <header>
        <span class="title-label">{{ $t('general.objective') }}</span>
        <h2 class="title-1">{{ activeObjective.name }}</h2>
        <p v-if="activeObjective.description" class="description">
          {{ activeObjective.description }}
        </p>
      </header>

      <section>
        <empty-state
          v-if="!keyRes.length"
          :icon="'poop'"
          :heading="$t('empty.noKeyResults.heading')"
          :body="$t('empty.noKeyResults.body')"
        >
          <router-link
            v-if="hasEditRights"
            :to="{ name: 'ItemAdmin', query: { tab: 'okr' } }"
            class="btn btn--ter"
          >
            {{ $t('empty.noKeyResults.linkText') }}
          </router-link>
        </empty-state>

        <div class="key-results__list">
          <key-result-row
            v-for="keyResult in keyRes"
            :key="keyResult.id"
            :key-result="keyResult"
            :force-expanded="true"
            class="key-results__list--row"
          />
        </div>
      </section>
    </main>

    <aside v-if="activeObjective" class="aside widgets">
      <widget
        v-if="typeof activeObjective.progression === 'number'"
        :title="$t('widget.progression.objective')"
        size="small"
      >
        <progression-chart :progression="activeObjective.progression" :period="period" />
      </widget>
      <widget-weights
        type="keyResult"
        :active-item="activeObjective"
        :items="keyResults"
      />
      <widget-objective-details />
    </aside>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import routerGuard from '@/router/router-guards/objectiveHome';
import WidgetWrapper from '@/components/widgets/WidgetWrapper.vue';
import WidgetObjectiveDetails from '@/components/widgets/WidgetObjectiveDetails.vue';
import WidgetWeights from '@/components/widgets/WidgetWeights.vue';
import ProgressionChart from '@/components/ProgressionChart.vue';

export default {
  name: 'ObjectiveHome',

  components: {
    KeyResultRow: () => import('@/components/KeyResultRow.vue'),
    Widget: WidgetWrapper,
    WidgetWeights,
    WidgetObjectiveDetails,
    ProgressionChart,
    EmptyState: () => import('@/components/EmptyState.vue'),
  },

  beforeRouteUpdate: routerGuard,

  async beforeRouteLeave(to, from, next) {
    try {
      await this.$store.dispatch('set_active_key_result', null);
      next();
    } catch (error) {
      console.error(error);
      next(false);
    }
  },

  data: () => ({
    keyRes: [],
  }),

  computed: {
    ...mapState(['activeObjective', 'keyResults']),
    ...mapGetters(['hasEditRights']),

    period() {
      if (this.activeObjective.startDate && this.activeObjective.endDate) {
        const { startDate, endDate } = this.activeObjective;
        return { startDate, endDate };
      }

      return this.activeObjective.period;
    },
  },

  watch: {
    activeObjective: {
      immediate: true,
      handler(objective) {
        if (!objective) {
          return;
        }

        this.keyRes = this.keyResults.filter(
          (keyRes) => keyRes.objective === `objectives/${objective.id}`
        );
      },
    },
  },
};
</script>

<style lang="scss" scoped>
.key-results__list {
  margin: 1.5rem 0;
}

.key-results__list--row {
  margin-top: 4px;

  &:first-child {
    margin-top: 0;
  }
}

.objective__heading {
  display: flex;
}

.objective__heading-text {
  max-width: 46rem;
  margin-right: 2.5rem;
}
</style>
