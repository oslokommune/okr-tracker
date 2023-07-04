<template>
  <page-layout v-if="activeObjective">
    <template #default>
      <header>
        <span class="title-label">
          {{ $t('general.objective') }}
        </span>

        <div class="objective__heading">
          <h2 class="title-1">{{ activeObjective.name }}</h2>
          <div v-if="hasEditRights" class="objective__edit">
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
          <div
            v-if="hasEditRights && !activeObjective.archived"
            data-mode="dark"
            class="objective__add-key-res"
          >
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

      <archived-restore
        v-if="activeObjective.archived"
        :restore="restore"
        :object-type="$t('archived.objective')"
      />

      <section>
        <key-results-list
          v-if="objectiveKeyResults.length"
          :key-results="objectiveKeyResults"
        />
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
  <not-found-page
    v-else
    :heading="$t('notFound.objectiveHeading')"
    :body="$t('notFound.objectiveBody')"
    back-to="ItemHome"
    :back-text="$t('notFound.linkTextAlt', { page: activeItem.name })"
  />
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import NotFoundPage from '@/components/pages/NotFoundPage.vue';
import Objective from '@/db/Objective';
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
    NotFoundPage,
    Widget: WidgetWrapper,
    WidgetWeights,
    WidgetObjectiveDetails,
    ProgressionChart,
    EmptyState: () => import('@/components/EmptyState.vue'),
    PktButton,
    ObjectiveDrawer: () => import('@/components/drawers/EditObjective.vue'),
    KeyResultDrawer: () => import('@/components/drawers/EditKeyResult.vue'),
    ArchivedRestore: () => import('@/components/ArchivedRestore.vue'),
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
    showObjectiveDrawer: false,
    showKeyResultDrawer: false,
  }),

  computed: {
    ...mapState(['activeObjective', 'activeItem', 'keyResults']),
    ...mapGetters(['hasEditRights']),

    period() {
      if (this.activeObjective.startDate && this.activeObjective.endDate) {
        const { startDate, endDate } = this.activeObjective;
        return { startDate, endDate };
      }

      return this.activeObjective.period;
    },

    objectiveKeyResults() {
      return this.activeObjective
        ? this.keyResults.filter(
            (kr) => kr.objective === `objectives/${this.activeObjective.id}`
          )
        : [];
    },
  },

  watch: {
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

    async restore() {
      try {
        await Objective.restore(this.activeObjective.id);
      } catch {
        this.$toasted.error(
          this.$t('toaster.error.restore', { document: this.activeObjective.id })
        );
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
