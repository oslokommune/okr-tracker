<template>
  <widget :title="$t('widget.history.title')">
    <progress-history-table
      :is-loading="isLoading"
      :history-records="historyRecords"
      :no-values-message="
        isFiltered ? $t('empty.noKPIProgressInPeriod') : $t('empty.noKPIProgress')
      "
      @edit-record="openValueModal"
      @delete-record="(record) => $emit('delete-record', record.id)"
    >
      <template #value-cell="{ record }">
        {{ formatKPIValue(kpi, record.value) }}
      </template>
      <template #date-cell="{ record }">
        {{ dateShort(record.timestamp.toDate()) }}
      </template>
    </progress-history-table>

    <edit-value-modal
      v-if="showValueModal"
      :record="chosenProgressRecord"
      @close="closeValueModal"
      @update-record="(id, data, close) => $emit('update-record', id, data, close)"
    />
  </widget>
</template>

<script>
import { mapState } from 'vuex';
import { dateShort } from '@/util';
import {
  filterDuplicatedProgressValues,
  formatKPIValue,
  getKPIProgressQuery,
} from '@/util/kpiHelpers';
import ProgressHistoryTable from './ProgressHistoryTable.vue';
import WidgetWrapper from '../WidgetWrapper.vue';

export default {
  name: 'WidgetKpiProgressHistory',

  components: {
    Widget: WidgetWrapper,
    ProgressHistoryTable,
    EditValueModal: () => import('@/components/modals/KPIProgressModal.vue'),
  },

  props: {
    kpi: {
      type: Object,
      required: true,
    },
  },

  data: () => ({
    progressCollection: [],
    isLoading: false,
    showValueModal: false,
    chosenProgressRecord: null,
  }),

  computed: {
    ...mapState(['selectedPeriod']),

    historyRecords() {
      return filterDuplicatedProgressValues(this.progressCollection);
    },

    isFiltered() {
      return this.selectedPeriod?.key !== 'all';
    },
  },

  watch: {
    selectedPeriod: {
      immediate: true,
      handler: 'setProgress',
    },
  },

  methods: {
    formatKPIValue,
    dateShort,

    async setProgress() {
      const { startDate, endDate } = this.selectedPeriod;
      const query = getKPIProgressQuery(this.kpi, startDate, endDate);
      this.isLoading = true;
      this.$bind('progressCollection', query).then(() => {
        this.isLoading = false;
      });
    },

    openValueModal(record) {
      this.chosenProgressRecord = record;
      this.showValueModal = true;
    },

    closeValueModal() {
      this.showValueModal = false;
      this.chosenProgressRecord = null;
    },
  },
};
</script>
