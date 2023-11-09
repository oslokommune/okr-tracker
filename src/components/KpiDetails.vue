<template>
  <div class="kpi-details">
    <header class="kpi-details__header">
      <h2>{{ kpi.name }}</h2>
      <pkt-button
        v-if="hasEditRights"
        v-tooltip="$t('admin.measurement.change')"
        skin="tertiary"
        variant="icon-only"
        size="medium"
        icon-name="edit"
        @onClick="$emit('edit-kpi')"
      />
    </header>

    <HTML-output
      v-if="kpi.description"
      class="mb-size-32 pkt-txt-16-light"
      :html="kpi.description"
    />

    <pkt-alert
      v-if="hasEditRights && kpi.error && kpi.auto"
      skin="error"
      :close-alert="true"
      class="mb-size-16"
    >
      {{ $t('kpi.automation.error') }}
      <i18n path="kpi.automation.reviewSettings">
        <a href="#" @click="$emit('edit-kpi')">{{
          $t('kpi.automation.automationLink')
        }}</a>
      </i18n>
    </pkt-alert>

    <widget-kpi-progress-graph
      :kpi="kpi"
      :progress="progress"
      :goals="goals"
      @add-value="showValueModal = true"
      @set-goals="showEditGoalsModal = true"
    />

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

    <edit-goals-modal
      v-if="hasEditRights && showEditGoalsModal"
      :kpi="kpi"
      @close="showEditGoalsModal = false"
    />
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import { db } from '@/config/firebaseConfig';
import { PktAlert, PktButton } from '@oslokommune/punkt-vue2';
import {
  filterDuplicatedProgressValues,
  getCachedKPIProgress,
  getKPIProgressQuery,
} from '@/util/kpiHelpers';
import EditGoalsModal from '@/components/modals/EditGoalsModal.vue';
import HTMLOutput from '@/components/HTMLOutput.vue';
import Progress from '@/db/Kpi/Progress';
import ProgressModal from '@/components/modals/KPIProgressModal.vue';
import WidgetKpiProgressGraph from '@/components/widgets/WidgetKpiProgressGraph.vue';
import WidgetKpiProgressHistory from '@/components/widgets/WidgetProgressHistory/WidgetKpiProgressHistory.vue';
import WidgetKpiProgressStats from '@/components/widgets/WidgetKpiProgressStats.vue';

export default {
  name: 'KpiDetails',

  components: {
    PktAlert,
    PktButton,
    ProgressModal,
    HTMLOutput,
    EditGoalsModal,
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
    showEditGoalsModal: false,
  }),

  computed: {
    ...mapState('kpis', ['selectedPeriod']),
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
@use '@oslokommune/punkt-css/dist/scss/abstracts/mixins/typography' as *;

@include bp('laptop-up') {
  .kpi-details {
    margin-left: 3rem;
  }
}

.kpi-details__header {
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;

  h2 {
    @include get-text('pkt-txt-20');

    @include bp('tablet-up') {
      @include get-text('pkt-txt-22');
    }
  }
}
</style>
