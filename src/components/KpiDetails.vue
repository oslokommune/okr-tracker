<template>
  <main class="main--alt kpi-details">
    <header class="kpi-details__header">
      <div>
        <h2 class="title-1">{{ kpi.name }}</h2>
        <button
          v-if="hasEditRights"
          class="btn btn--ter btn--icon btn--fw"
          @click="showValueModal = true"
        >
          <i class="icon fa fa-plus" />
          <span>{{ $t('kpi.newValue') }}</span>
        </button>
      </div>
      <p v-if="kpi.description" class="description">{{ kpi.description }}</p>
    </header>

    <widget-kpi-progress-graph :kpi="kpi" :progress="progress" :goals="goals" />

    <widget-kpi-progress-stats
      :kpi="kpi"
      :progress="progress"
      :goals="goals"
      :latest-progress-record="latestProgressRecord"
    />

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
      v-if="hasEditRights && showValueModal"
      @create-record="createProgressRecord"
      @close="showValueModal = false"
    />
  </main>
</template>

<script>
import { mapGetters } from 'vuex';
import Progress from '@/db/Kpi/Progress';
import { dateShort } from '@/util';
import kpiProgress from '@/mixins/kpiProgress';
import WidgetKpiProgressGraph from '@/components/widgets/WidgetKpiProgressGraph.vue';
import WidgetKpiProgressStats from '@/components/widgets/WidgetKpiProgressStats.vue';
import WidgetProgressHistory from '@/components/widgets/WidgetProgressHistory/WidgetProgressHistory.vue';

export default {
  name: 'KpiDetails',

  components: {
    ProgressModal: () => import('@/components/modals/KPIProgressModal.vue'),
    WidgetKpiProgressGraph,
    WidgetKpiProgressStats,
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

  computed: {
    ...mapGetters(['hasEditRights']),
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

<style lang="scss" scoped>
.kpi-details__header {
  gap: 0.25rem;

  > div {
    display: flex;
    align-items: center;

    button {
      flex: 0;
    }

    @media screen and (min-width: bp(s)) {
      flex-direction: row;
      justify-content: space-between;
    }
  }
}
</style>
