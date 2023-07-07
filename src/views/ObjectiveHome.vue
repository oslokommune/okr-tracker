<template>
  <page-layout v-if="activeObjective">
    <template #default>
      <header>
        <span class="title-label">
          {{ $t('general.objective') }}
        </span>

        <div class="objective__heading">
          <h2 class="title-1">{{ activeObjective.name }}</h2>
          <div class="objective__edit">
            <pkt-button
              v-tooltip="$t('objective.change')"
              icon-name="edit"
              :text="$t('objective.change')"
              :variant="'icon-only'"
              skin="tertiary"
              @onClick="showObjectiveDrawer = true"
            />
          </div>
        </div>
        <div class="objective__description">
          <p v-if="activeObjective.description" class="description">
            {{ activeObjective.description }}
          </p>
          <div data-mode="dark" class="objective__add-key-res">
            <pkt-button
              v-tooltip="$t('btn.createKeyResult')"
              :text="$t('btn.createKeyResult')"
              skin="primary"
              variant="icon-left"
              icon-name="plus-sign"
              @onClick="showKeyResultDrawer = true"
            />
          </div>
        </div>
      </header>

      <section>
        <key-results-list v-if="keyRes.length" :key-results="keyRes" />

        <empty-state
          v-else
          :heading="$t('empty.noKeyResults.heading')"
          :body="$t('empty.noKeyResults.body')"
        />
      </section>

      <objective-drawer
        :visible="showObjectiveDrawer"
        :objective="activeObjective"
        @close="showObjectiveDrawer = false"
      />

      <key-result-drawer
        :visible="showKeyResultDrawer"
        :objective="activeObjective"
        @close="closeKeyResultDrawer"
      />
    </template>

    <template #sidebar>
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
    </template>
  </page-layout>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import routerGuard from '@/router/router-guards/objectiveHome';
import WidgetWrapper from '@/components/widgets/WidgetWrapper.vue';
import WidgetObjectiveDetails from '@/components/widgets/WidgetObjectiveDetails.vue';
import WidgetWeights from '@/components/widgets/WidgetWeights.vue';
import ProgressionChart from '@/components/ProgressionChart.vue';
import { PktButton } from '@oslokommune/punkt-vue2';

export default {
  name: 'ObjectiveHome',

  components: {
    KeyResultsList: () => import('@/components/KeyResultsList.vue'),
    Widget: WidgetWrapper,
    WidgetWeights,
    WidgetObjectiveDetails,
    ProgressionChart,
    EmptyState: () => import('@/components/EmptyState.vue'),
    PktButton,
    ObjectiveDrawer: () => import('@/components/drawers/EditObjective.vue'),
    KeyResultDrawer: () => import('@/components/drawers/EditKeyResult.vue'),
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
    showObjectiveDrawer: false,
    showKeyResultDrawer: false,
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
    keyResults: {
      immediate: true,
      handler() {
        this.keyRes = this.keyResults.filter(
          (keyRes) => keyRes.objective === `objectives/${this.activeObjective.id}`
        );
      },
    },
    '$route.query': {
      immediate: true,
      async handler(query) {
        this.showKeyResultDrawer = query?.createKeyResult === '1';
      },
    },
  },

  methods: {
    closeKeyResultDrawer() {
      this.showKeyResultDrawer = false;
      const { query } = this.$route;
      if (query?.createKeyResult) {
        this.$router.replace({ query: { ...query, createKeyResult: undefined } });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.objective__heading {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.objective__heading-text {
  max-width: 46rem;
  margin-right: 2.5rem;
}

.objective__description {
  display: flex;
  flex-direction: row;
  align-items: self-end;
  justify-content: space-between;
  padding-bottom: 1rem;
}

.objective__add-key-res {
  margin-left: auto;
}

.key-results-list {
  margin-top: 1.5rem;
}
</style>
