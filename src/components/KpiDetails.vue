<template>
  <div class="kpi-details">
    <header class="kpi-details__header">
      <div>
        <h2 class="title-1">{{ kpi.name }}</h2>
        <pkt-button
          v-if="hasEditRights"
          skin="tertiary"
          variant="icon-left"
          icon-name="plus-sign"
          @onClick="showValueModal = true"
        >
          {{ $t('kpi.newValue') }}
        </pkt-button>
      </div>
      <p v-if="kpi.description" class="kpi-details__description">{{ kpi.description }}</p>
    </header>

    <widget-kpi-progress-graph :kpi="kpi" :progress="progress" :goals="goals" />

    <widget-kpi-progress-stats :kpi="kpi" :progress="progress" :goals="goals" />

    <widget-kpi-progress-history
      :kpi="kpi"
      @update-record="updateProgressRecord"
      @delete-record="deleteProgressRecord"
    />

    <progress-modal
      v-if="hasEditRights && showValueModal"
      :kpi="kpi"
      @create-record="createProgressRecord"
      @close="showValueModal = false"
    />
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import { db } from '@/config/firebaseConfig';
import { PktButton } from '@oslokommune/punkt-vue2';
import Progress from '@/db/Kpi/Progress';
import {
  filterDuplicatedProgressValues,
  getCachedKPIProgress,
  getKPIProgressQuery,
} from '@/util/kpiHelpers';
import WidgetKpiProgressGraph from '@/components/widgets/WidgetKpiProgressGraph.vue';
import WidgetKpiProgressStats from '@/components/widgets/WidgetKpiProgressStats.vue';
import WidgetKpiProgressHistory from '@/components/widgets/WidgetProgressHistory/WidgetKpiProgressHistory.vue';

export default {
  name: 'KpiDetails',

  components: {
    PktButton,
    ProgressModal: () => import('@/components/modals/KPIProgressModal.vue'),
    WidgetKpiProgressGraph,
    WidgetKpiProgressHistory,
    WidgetKpiProgressStats,
  },

  props: {
    kpi: {
      type: Object,
      required: true,
    },
  },

  data: () => ({
    progressCollection: [],
    goals: [],
    showValueModal: false,
  }),

  computed: {
    ...mapState(['selectedPeriod']),
    ...mapGetters(['hasEditRights']),

    progress() {
      return filterDuplicatedProgressValues(this.progressCollection);
    },
  },

  watch: {
    kpi: {
      immediate: true,
      handler() {
        this.setProgress();
        this.setGoals();
      },
    },
    selectedPeriod: {
      immediate: false,
      handler: 'setProgress',
    },
  },

  methods: {
    async setProgress() {
      const { startDate, endDate } = this.selectedPeriod;
      this.progressCollection = getCachedKPIProgress(this.kpi, startDate, endDate);

      if (!this.progressCollection.length) {
        const query = getKPIProgressQuery(this.kpi, startDate, endDate);
        await this.$bind('progressCollection', query);
      }
    },

    async setGoals() {
      await this.$bind(
        'goals',
        db
          .collection(`kpis/${this.kpi.id}/goals`)
          .where('archived', '==', false)
          .orderBy('toDate', 'desc')
      );
    },

    async createProgressRecord(data, modalCloseHandler) {
      try {
        await Progress.update(this.kpi.id, data);
        this.$toasted.show(this.$t('toaster.add.progress'));
      } catch (e) {
        this.$toasted.error(this.$t('toaster.error.addProgress'));
      } finally {
        modalCloseHandler();
      }
    },

    async updateProgressRecord(id, data, modalCloseHandler) {
      try {
        await Progress.update(this.kpi.id, data, id);
        this.$toasted.show(this.$t('toaster.update.progress'));
      } catch (e) {
        this.$toasted.error(this.$t('toaster.error.updateProgress'));
      } finally {
        modalCloseHandler();
      }
    },

    async deleteProgressRecord(id) {
      try {
        await Progress.remove(this.kpi.id, id);
        this.$toasted.show(this.$t('toaster.delete.progress'));
      } catch {
        this.$toasted.error(this.$t('toaster.error.deleteProgress'));
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@use '@/styles/typography';

.kpi-details {
  margin-left: 3rem;
}

.kpi-details__header {
  gap: 0.25rem;
  margin-bottom: 1rem;

  > div {
    display: flex;
    align-items: center;

    button {
      flex: 0;
      white-space: nowrap;
    }

    .title-1 {
      margin: 0;
      font-weight: 400;
      font-size: typography.$font-size-6;
    }

    @include bp('phablet-up') {
      flex-direction: row;
      justify-content: space-between;
    }
  }
}

.kpi-details__description {
  font-size: typography.$font-size-1;
}
</style>
