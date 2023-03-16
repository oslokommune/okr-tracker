<template>
  <main class="main--alt">
    <header>
      <h2 class="title-1">{{ activeKpi.name }}</h2>
      <p v-if="activeKpi.description">{{ activeKpi.description }}</p>
    </header>

    <widget-kpi-current-value
      v-if="activeKpi.valid"
      :progress="filteredProgress"
      @show-value-modal="showValueModal = true"
    />

    <widget :title="$t('kpi.progress')">
      <svg ref="graph" class="graph"></svg>
    </widget>

    <widget-progress-history
      :progress="filteredProgress"
      :is-loading="isLoading"
      :value-formatter="_formatKPIValue"
      :date-formatter="dateShort"
      :no-values-message="
        isFiltered ? $t('empty.noKPIProgressInPeriod') : $t('empty.noKPIProgress')
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
import { mapGetters, mapState } from 'vuex';
import { extent, min } from 'd3-array';
import { endOfDay } from 'date-fns';
import { db } from '@/config/firebaseConfig';
import Progress from '@/db/Kpi/Progress';
import LineChart from '@/util/LineChart';
import { dateShort, formatISOShort } from '@/util';
import { formatKPIValue } from '@/util/kpiHelpers';
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

  props: {
    kpi: {
      type: Object,
      required: true,
    },
  },

  data: () => ({
    progress: [],
    graph: null,
    range: [],
    startDate: null,
    endDate: null,
    filteredProgress: [],
    isLoading: false,
    showValueModal: false,
  }),

  computed: {
    ...mapState(['activeKpi']),
    ...mapGetters(['hasEditRights']),

    isFiltered() {
      return this.startDate && this.endDate;
    },
  },

  watch: {
    activeKpi: {
      immediate: true,
      async handler(kpi) {
        if (!kpi) {
          return;
        }

        this.isLoading = true;
        await this.$bind(
          'progress',
          db.collection(`kpis/${kpi.id}/progress`).orderBy('timestamp', 'desc')
        );
        this.isLoading = false;
      },
    },
    progress() {
      this.filterProgress();
    },
  },

  mounted() {
    if (this.$refs.graph) {
      this.graph = new LineChart(this.$refs.graph);
    }

    if (this.$route.query.startDate && this.$route.query.endDate) {
      this.startDate = this.$route.query.startDate;
      this.endDate = this.$route.query.endDate;
      this.range = [this.startDate, this.endDate];
    }
  },

  methods: {
    dateShort,
    formatKPIValue,

    async createProgressRecord(data, modalCloseHandler) {
      try {
        await Progress.update(this.activeKpi.id, data);
        this.$toasted.show(this.$t('toaster.add.progress'));
      } catch (e) {
        this.$toasted.error(this.$t('toaster.error.addProgress'));
      } finally {
        modalCloseHandler();
      }
    },

    async updateProgressRecord(id, data, modalCloseHandler) {
      try {
        await Progress.update(this.activeKpi.id, data, id);
        this.$toasted.show(this.$t('toaster.update.progress'));
      } catch (e) {
        this.$toasted.error(this.$t('toaster.error.updateProgress'));
      } finally {
        modalCloseHandler();
      }
    },

    async deleteProgressRecord(id) {
      try {
        await Progress.remove(this.activeKpi.id, id);
        this.$toasted.show(this.$t('toaster.delete.progress'));
      } catch {
        this.$toasted.error(this.$t('toaster.error.deleteProgress'));
      }
    },

    _formatKPIValue(value) {
      return formatKPIValue(this.activeKpi, value);
    },

    renderGraph() {
      if (!this.graph) {
        return;
      }

      const [startValue, targetValue] = extent(
        this.filteredProgress.map(({ value }) => value)
      );

      let startDate = new Date();

      if (this.startDate) {
        startDate = this.startDate;
      } else if (this.filteredProgress.length) {
        startDate = min(this.filteredProgress.map((p) => p.timestamp)).toDate();
      }

      this.graph.render({
        startValue,
        targetValue,
        startDate,
        endDate: this.endDate || new Date(),
        progress: this.filteredProgress,
        kpi: this.activeKpi,
      });
    },

    filterProgress() {
      if (this.isFiltered) {
        this.filteredProgress = this.progress.filter(
          (a) =>
            a.timestamp.toDate() > this.startDate && a.timestamp.toDate() < this.endDate
        );
      } else {
        this.filteredProgress = this.progress;
      }

      // Filter out any duplicate measurement values for each date
      const seenDates = [];

      this.filteredProgress = this.filteredProgress.filter((a) => {
        const date = a.timestamp.toDate().toISOString().slice(0, 10);
        if (!seenDates.includes(date)) {
          seenDates.push(date);
          return true;
        }
        return false;
      });

      this.renderGraph();
    },

    handleChange(range) {
      if (!range.length) {
        this.$router
          .push({
            name: 'KpiHome',
            params: {
              slug: this.$route.params.slug,
              kpiId: this.$route.params.kpiId,
            },
          })
          .catch((err) => console.log(err));
        this.startDate = null;
        this.endDate = null;
        this.filteredProgress = this.progress;
        this.filterProgress();
        return;
      }
      if (range.length === 1) {
        return;
      }
      this.dirty = true;
      const [startDate, endDate] = range;
      this.startDate = startDate;
      this.endDate = endOfDay(endDate);

      this.$router
        .push({
          name: 'KpiHome',
          params: {
            slug: this.$route.params.slug,
            kpiId: this.$route.params.kpiId,
          },
          query: {
            startDate: formatISOShort(this.startDate),
            endDate: formatISOShort(this.endDate),
          },
        })
        .catch((err) => console.log(err));

      this.filterProgress();
    },
  },
};
</script>
