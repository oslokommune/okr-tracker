<template>
  <main class="main--alt">
    <header>
      <h2 class="title-1">{{ kpi.name }}</h2>
      <p v-if="kpi.description">{{ kpi.description }}</p>
    </header>

    <widget-kpi-current-value
      v-if="kpi.valid"
      :latest-progress-record="latestProgressRecord"
      @show-value-modal="showValueModal = true"
    />

    <widget-kpi-progress-graph :kpi="kpi" :progress="progress" :goals="goals" />

    <widget-progress-history
      :progress="progress"
      :is-loading="isProgressLoading"
      :value-formatter="_formatKPIValue"
      :date-formatter="dateShort"
      :no-values-message="
        progressIsFiltered ? $t('empty.noKPIProgressInPeriod') : $t('empty.noKPIProgress')
      "
      @update-record="updateProgressRecord"
      @delete-record="deleteProgressRecord"
    />

    <progress-modal
      v-if="showValueModal"
      @create-record="createProgressRecord"
      @close="showValueModal = false"
    />
  </main>
</template>

<script>
import Progress from '@/db/Kpi/Progress';
import { dateShort } from '@/util';
import kpiProgress from '@/mixins/kpiProgress';
import WidgetKpiCurrentValue from '@/components/widgets/WidgetKpiCurrentValue.vue';
import WidgetKpiProgressGraph from '@/components/widgets/WidgetKpiProgressGraph.vue';
import WidgetProgressHistory from '@/components/widgets/WidgetProgressHistory/WidgetProgressHistory.vue';

export default {
  name: 'KpiDetails',

  components: {
    ProgressModal: () => import('@/components/modals/KPIProgressModal.vue'),
    WidgetKpiCurrentValue,
    WidgetKpiProgressGraph,
    WidgetProgressHistory,
  },

  mixins: [kpiProgress],

  props: {
    kpi: {
      type: Object,
      required: true,
    },
  },

  data: () => ({
    showValueModal: false,
  }),

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
    dateShort,

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

    _formatKPIValue(value) {
      return this.formatKPIValue(this.kpi, value);
    },
  },
};
</script>
