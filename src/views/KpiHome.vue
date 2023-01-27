<template>
  <div v-if="activeKpi" class="container">
    <div class="main">
      <div class="main__item">
        <h1 class="title-1">{{ activeKpi.name }}</h1>

        <p>{{ activeKpi.description }}</p>

        <div class="main-widgets">
          <div v-if="activeKpi.valid" class="main-widgets__current">
            <div>
              <h3 class="title-3">
                {{ $t('kpi.currentValue') }}
              </h3>
              <div class="main-widgets__current--value">
                {{
                  filteredProgress.length
                    ? formatKPIValue(activeKpi, filteredProgress[0].value)
                    : formatKPIValue(activeKpi)
                }}
              </div>
            </div>
            <div v-if="hasEditRights">
              <button
                class="btn btn--ter btn--icon btn--fw"
                @click="showValueModal = true"
              >
                <i class="icon fa fa-plus" />
                <span>{{ $t('kpi.newValue') }}</span>
              </button>
            </div>
          </div>

          <div class="main-widgets__graph">
            <h2 class="title-2">
              {{ $t('kpi.progress') }}
            </h2>

            <svg ref="graph" class="graph"></svg>
          </div>
        </div>

        <widget-progress-history
          :progress="filteredProgress"
          :is-loading="isLoading"
          :value-formatter="_formatKPIValue"
          :date-formatter="dateShort"
          :no-values-message="$t('empty.noKPIProgress')"
          @update-record="updateProgressRecord"
          @delete-record="deleteProgressRecord"
        />
      </div>

      <progress-modal
        v-if="showValueModal"
        @create-record="createProgressRecord"
        @close="showValueModal = false"
      />
    </div>

    <widgets-k-p-i-home
      v-if="filteredProgress.length"
      :range="range"
      :progress="progress"
      @listen="handleChange"
    />
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import { extent } from 'd3-array';
import { endOfDay } from 'date-fns';
import { db } from '@/config/firebaseConfig';
import Progress from '@/db/Kpi/Progress';
import LineChart from '@/util/LineChart';
import { dateShort, formatISOShort } from '@/util';
import { formatKPIValue } from '@/util/kpiHelpers';
import WidgetProgressHistory from '@/components/widgets/WidgetProgressHistory/WidgetProgressHistory.vue';

export default {
  name: 'KpiHome',

  components: {
    ProgressModal: () => import('@/components/modals/KPIProgressModal.vue'),
    WidgetsKPIHome: () => import('@/components/widgets/WidgetsKPIHome.vue'),
    WidgetProgressHistory,
  },

  data: () => ({
    progress: [],
    graph: null,
    range: '',
    startDate: null,
    endDate: null,
    filteredProgress: [],
    isFiltered: false,
    isLoading: false,
    showValueModal: false,
  }),

  computed: {
    ...mapState(['activeKpi']),
    ...mapGetters(['hasEditRights']),
  },

  watch: {
    activeKpi: {
      immediate: true,
      async handler({ id }) {
        this.isLoading = true;
        await this.$bind(
          'progress',
          db.collection(`kpis/${id}/progress`).orderBy('timestamp', 'desc')
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
      this.range = `${this.startDate} til ${this.endDate}`;
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
      const [startValue, targetValue] = extent(
        this.filteredProgress.map(({ value }) => value)
      );
      const [startDate, endDate] = extent(
        this.filteredProgress.map(({ timestamp }) => timestamp)
      );

      if (!this.graph || startValue === undefined || targetValue === undefined) {
        return;
      }

      this.graph.render({
        startValue,
        targetValue,
        startDate: startDate.toDate(),
        endDate: this.isFiltered ? endDate.toDate() : new Date(),
        progress: this.filteredProgress,
        kpi: this.activeKpi,
      });
    },

    filterProgress() {
      if (!this.startDate && !this.endDate) {
        this.filteredProgress = this.progress;
      } else {
        this.filteredProgress = this.progress.filter(
          (a) =>
            a.timestamp.toDate() > this.startDate && a.timestamp.toDate() < this.endDate
        );
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
      if (!range) {
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
      const parts = range.split(' til ').map((d) => new Date(d));
      if (parts.length === 1) {
        return;
      }
      this.dirty = true;
      const [startDate, endDate] = parts;
      this.startDate = startDate;
      this.endDate = endOfDay(endDate);
      this.isFiltered = true;

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

<style lang="scss" scoped>
.main-widgets {
  display: flex;
  flex-direction: column;
  margin-top: 1.5rem;
}

.main-widgets__current {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
  width: span(12);
  padding: 1rem;
  background: var(--color-secondary);
  box-shadow: 0 2px 3px rgba(black, 0.1);

  @media screen and (min-width: bp(s)) {
    flex-direction: row;
    justify-content: space-between;
  }
}

.main-widgets__current--value {
  color: var(--color-primary);
  font-weight: 700;
  font-size: 50px;
  word-wrap: break-word;
}

.main-widgets__graph {
  width: span(12);

  margin-top: 0.5rem;
  padding: 1rem;
  background: white;
}
</style>
