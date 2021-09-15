<template>
  <div v-if="activeKpi" class="container">
    <div class="kpi">
      <h1 class="title-1">{{ activeKpi.name }}</h1>

      <p>{{ activeKpi.description }}</p>

      <div class="main-widgets">
        <div v-if="activeKpi.valid" class="main-widgets__current">
          <h3 class="main-widgets__title">
            <i class="fas fa-chart-line" />
            {{ $t('kpi.currentValue') }}
          </h3>
          <div class="main-widgets__current--value">
            {{
              filteredProgress.length
                ? formatKPIValue(filteredProgress[0].value)
                : formatKPIValue(activeKpi.currentValue)
            }}
          </div>
        </div>

        <div class="main-widgets__graph">
          <h3 class="main-widgets__title">
            <i class="fas fa-chart-line" />
            {{ $t('kpi.progresjon') }}
          </h3>

          <svg ref="graph" class="graph"></svg>
        </div>
      </div>

      <div class="history">
        <h2 class="title-2">{{ $t('keyResultPage.history') }}</h2>
        <empty-state
          v-if="!filteredProgress.length"
          :icon="'history'"
          :heading="$t('empty.kpiProgress.heading')"
          :body="$t('empty.kpiProgress.body')"
        />

        <table v-if="filteredProgress.length" class="table">
          <thead>
            <tr>
              <th>{{ $t('keyres.dateAndTime') }}</th>
              <th>{{ $t('keyResultPage.table.value') }}</th>
              <th v-if="hasEditRights"></th>
            </tr>
          </thead>
          <tbody></tbody>
          <tr v-for="{ timestamp, value, id } in filteredProgress" :key="id">
            <td>{{ dateTimeShort(timestamp.toDate()) }}</td>
            <td>{{ formatKPIValue(value) }}</td>
            <td v-if="hasEditRights">
              <v-popover offset="16" placement="top" show="true">
                <button class="btn btn--ter btn--icon">
                  <i class="icon far fa-trash-alt" />
                  {{ $t('btn.delete') }}
                </button>

                <template slot="popover">
                  <button class="btn btn--ter btn--negative" @click="remove(id)">
                    {{ $t('btn.confirmDeleteProgress') }}
                  </button>
                </template>
              </v-popover>
            </td>
          </tr>
        </table>
      </div>
    </div>

    <div class="aside">
      <div class="widgets__links">
        <router-link
          v-if="hasEditRights"
          v-tooltip="$t('tooltip.editKpi')"
          class="btn btn--ter btn--icon"
          :to="{ name: 'ItemAdminKPIs' }"
        >
          <i class="icon fa fa-cog" />
          {{ $t('kpi.edit') }}
        </router-link>
      </div>

      <h2 class="title-2">{{ $t('keyResultPage.filter') }}</h2>
      <label v-if="progress.length" class="form-field">
        <span class="form-label">{{ $t('period.dateRange') }}</span>
        <flat-pickr
          v-model="range"
          :config="flatPickerConfig"
          class="form-control cy-datepicker"
          name="date"
          placeholder="Velg start- og sluttdato"
        ></flat-pickr>
      </label>

      <button v-if="range" class="btn btn--icon btn--ghost" @click="range = null">
        <i class="icon fa fa-trash-restore-alt" /> {{ $t('btn.reset') }}
      </button>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import { extent } from 'd3';
import locale from 'flatpickr/dist/l10n/no';
import endOfDay from 'date-fns/endOfDay';
import { db } from '@/config/firebaseConfig';
import LineChart from '@/util/LineChart';
import { dateTimeShort, formatISOShort } from '@/util/formatDate';
import kpiTypes from '@/config/kpiTypes';

export default {
  name: 'KpiHome',

  components: {
    EmptyState: () => import('@/components/EmptyState.vue'),
  },

  data: () => ({
    progress: [],
    graph: null,
    flatPickerConfig: {
      altFormat: 'j M Y',
      altInput: true,
      minDate: null,
      mode: 'range',
      maxDate: null,
      locale: locale.no,
    },
    range: null,
    startDate: null,
    endDate: null,
    filteredProgress: [],
    isFiltered: false,
  }),

  computed: {
    ...mapState(['activeKpi']),
    ...mapGetters(['hasEditRights']),
  },

  watch: {
    activeKpi: {
      immediate: true,
      handler({ id }) {
        this.$bind('progress', db.collection(`kpis/${id}/progress`).orderBy('timestamp', 'desc'));
      },
    },
    progress() {
      this.filterProgress();
    },

    range(range) {
      if (!range) {
        this.$router
          .push({
            name: 'KpiHome',
            params: { slug: this.$route.params.slug, kpiId: this.$route.params.kpiId },
          })
          .catch((err) => console.log(err));
        this.startDate = null;
        this.endDate = null;
        this.filteredProgress = this.progress;
        this.filterProgress();
        return;
      }
      const parts = this.range.split(' til ').map((d) => new Date(d));
      if (parts.length === 1) return;
      this.dirty = true;
      const [startDate, endDate] = parts;
      this.startDate = startDate;
      this.endDate = endOfDay(endDate);
      this.isFiltered = true;

      this.$router
        .push({
          name: 'KpiHome',
          params: { slug: this.$route.params.slug, kpiId: this.$route.params.kpiId },
          query: { startDate: formatISOShort(this.startDate), endDate: formatISOShort(this.endDate) },
        })
        .catch((err) => console.log(err));

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
    dateTimeShort,

    async remove(id) {
      try {
        await db.doc(`kpis/${this.activeKpi.id}/progress/${id}`).delete();
        this.$toasted.show(this.$t('toaster.delete.progression'));
      } catch {
        this.$toasted.error(this.$t('toaster.error.deleteProgress'));
      }
    },

    renderGraph() {
      const [startValue, targetValue] = extent(this.filteredProgress.map(({ value }) => value));
      const [startDate, endDate] = extent(this.filteredProgress.map(({ timestamp }) => timestamp));

      if (!this.graph || !startValue || !targetValue) return;

      this.graph.render(
        {
          startValue,
          targetValue,
        },
        {
          endDate: this.isFiltered ? endDate : new Date(),
          startDate,
        },
        this.filteredProgress,
        this.activeKpi
      );
    },

    filterProgress() {
      if (!this.startDate && !this.endDate) {
        this.filteredProgress = this.progress;
      } else {
        this.filteredProgress = this.progress.filter(
          (a) => a.timestamp.toDate() > this.startDate && a.timestamp.toDate() < this.endDate
        );
      }
      this.renderGraph();
    },

    formatKPIValue(value) {
      if (kpiTypes[this.activeKpi.type].type === 'users') {
        return value;
      }
      return kpiTypes[this.activeKpi.type].formatValue(value);
    },
  },
};
</script>

<style lang="scss" scoped>
.kpi {
  width: span(12);
  padding: 1.5rem 0;

  @media screen and (min-width: bp(m)) {
    width: span(9);
    margin-right: span(0, 1);
  }
}

.history {
  margin: 2.5rem 0 1.5rem;
}
</style>
