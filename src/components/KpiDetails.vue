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

    <widget :title="$t('kpi.progress')">
      <svg ref="graph" class="graph"></svg>
    </widget>

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
import { extent, min } from 'd3-array';
import Progress from '@/db/Kpi/Progress';
import LineChart from '@/util/LineChart';
import { dateShort } from '@/util';
import kpiProgress from '@/mixins/kpiProgress';
import WidgetWrapper from '@/components/widgets/WidgetWrapper.vue';
import WidgetKpiCurrentValue from '@/components/widgets/WidgetKpiCurrentValue.vue';
import WidgetProgressHistory from '@/components/widgets/WidgetProgressHistory/WidgetProgressHistory.vue';

export default {
  name: 'KpiDetails',

  components: {
    ProgressModal: () => import('@/components/modals/KPIProgressModal.vue'),
    Widget: WidgetWrapper,
    WidgetKpiCurrentValue,
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
    graph: null,
    showValueModal: false,
  }),

  watch: {
    kpi: {
      immediate: true,
      async handler() {
        this.setProgress().then(() => {
          this.renderGraph();
        });
      },
    },
    selectedPeriod: {
      immediate: false,
      async handler() {
        this.setProgress().then(() => {
          this.renderGraph();
        });
      },
    },
  },

  mounted() {
    if (this.$refs.graph) {
      this.graph = new LineChart(this.$refs.graph);
    }
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

    renderGraph() {
      if (!this.graph) {
        return;
      }

      const [startValue, targetValue] = extent(this.progress.map(({ value }) => value));

      let startDate = new Date();

      if (this.progress.length) {
        startDate = min(this.progress.map((p) => p.timestamp)).toDate();
      }

      this.graph.render({
        startValue,
        targetValue,
        startDate,
        endDate: new Date(),
        progress: this.progress,
        kpi: this.kpi,
      });
    },
  },
};
</script>
