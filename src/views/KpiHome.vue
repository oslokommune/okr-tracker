<template>
  <div v-if="activeKpi" class="container">
    <div class="widgets--left">
      <router-link
        class="btn widget__back-button"
        :to="{ name: 'ItemHome', params: { slug: activeItem.slug } }"
      >
        {{ $t('general.back') }}
        <i class="fa fa-chevron-left"></i>
      </router-link>

      <div class="aside--left">
        <div class="widgets">
          <widget-mission-statement />
          <widget-team />
        </div>
      </div>
    </div>

    <div class="main">
      <div class="main__item">
        <h1 class="title-1">{{ activeKpi.name }}</h1>

        <p>{{ activeKpi.description }}</p>

        <div class="main-widgets">
          <div v-if="activeKpi.valid" class="main-widgets__current">
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

          <div class="main-widgets__graph">
            <h2 class="title-2">
              {{ $t('kpi.progress') }}
            </h2>

            <svg ref="graph" class="graph"></svg>
          </div>
        </div>

        <widgets-k-p-i-home
          class="aside--middle"
          :range="range"
          :progress="progress"
          @listen="handleChange"
        />

        <widget-progress-history
          :progress="filteredProgress"
          :is-loading="isLoading"
          :value-formatter="_formatKPIValue"
          :no-values-message="$t('empty.noKPIProgress')"
          @update-record="updateHistoryRecord"
          @delete-record="deleteHistoryRecord"
        />
      </div>
    </div>

    <widgets-k-p-i-home
      class="aside--right"
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
import Progress from '@/db/Progress';
import LineChart from '@/util/LineChart';
import { dateTimeShort, formatISOShort } from '@/util';
import { formatKPIValue } from '@/util/kpiHelpers';
import WidgetMissionStatement from '@/components/widgets/WidgetMissionStatement.vue';
import WidgetTeam from '@/components/widgets/WidgetTeam/WidgetTeam.vue';
import WidgetProgressHistory from '@/components/widgets/WidgetProgressHistory/WidgetProgressHistory.vue';

export default {
  name: 'KpiHome',

  components: {
    WidgetsKPIHome: () => import('@/components/widgets/WidgetsKPIHome.vue'),
    WidgetMissionStatement,
    WidgetTeam,
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
  }),

  computed: {
    ...mapState(['activeKpi', 'activeItem', 'theme']),
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
      this.graph = new LineChart(this.$refs.graph, { theme: this.theme });
    }

    if (this.$route.query.startDate && this.$route.query.endDate) {
      this.startDate = this.$route.query.startDate;
      this.endDate = this.$route.query.endDate;
      this.range = `${this.startDate} til ${this.endDate}`;
    }
  },

  methods: {
    dateTimeShort,
    formatKPIValue,

    async updateHistoryRecord(id, data, modalCloseHandler) {
      // Check for existing value and update the recent-most entry. Delete
      // original record if changes overwrites value for another date.
      try {
        const kpiCollection = db.collection('kpis');
        const kpiId = this.activeKpi.id;
        const existingValueSnapshot = await Progress.get(
          kpiCollection,
          kpiId,
          data.timestamp
        );

        if (existingValueSnapshot && id !== existingValueSnapshot.id) {
          await Progress.update(
            kpiCollection,
            kpiId,
            existingValueSnapshot.id,
            data
          );
          await Progress.remove(kpiCollection, kpiId, id);
        } else {
          await Progress.update(kpiCollection, kpiId, id, data);
        }
        this.$toasted.show(this.$t('toaster.update.progress'));
      } catch {
        this.$toasted.error(this.$t('toaster.error.updateProgress'));
      } finally {
        modalCloseHandler();
      }
    },

    async deleteHistoryRecord(id) {
      try {
        await Progress.remove(db.collection('kpis'), this.activeKpi.id, id);
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

      if (
        !this.graph ||
        !startValue === undefined ||
        !targetValue === undefined
      )
        return;
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
            a.timestamp.toDate() > this.startDate &&
            a.timestamp.toDate() < this.endDate
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
      if (parts.length === 1) return;
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
  align-self: flex-start;
  width: span(12);

  padding: 1rem;
  background: var(--color-secondary);
  box-shadow: 0 2px 3px rgba(black, 0.1);
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
