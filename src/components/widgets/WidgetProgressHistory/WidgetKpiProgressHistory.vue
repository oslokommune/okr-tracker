<template>
  <widget :title="$t('widget.history.title')">
    <progress-history-table
      :history-records="historyRecords"
      :is-loading="isLoading"
      :is-limited="isLimited"
      :no-values-message="
        isFiltered ? $t('empty.noKPIProgressInPeriod') : $t('empty.noKPIProgress')
      "
      @edit-record="openValueModal"
      @delete-record="(record) => $emit('delete-record', record.id)"
      @load-more="loadAllRecords"
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
      :kpi="kpi"
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
    progressLimit: 10,
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

    isLimited() {
      return this.progressLimit && this.progressCollection.length === this.progressLimit;
    },
  },

  watch: {
    selectedPeriod: {
      immediate: true,
      handler: 'setProgress',
    },
    kpi: {
      immediate: true,
      handler: 'setProgress',
    },
  },

  methods: {
    formatKPIValue,
    dateShort,

    async setProgress(options) {
      this.isLoading = true;
      const { startDate, endDate } = this.selectedPeriod;

      let query = getKPIProgressQuery(this.kpi, startDate, endDate);
      if (this.progressLimit) {
        query = query.limit(this.progressLimit);
      }
      await this.$bind('progressCollection', query, options);

      // For now assume that the resulting dataset is limited if the document
      // count is equal to the query limit. This should be based on an actual
      // count, but "cheap" count aggregation is only available in a preview
      // release of the SDK and seemingly not for Web version 8.
      //  https://firebase.blog/posts/2022/12/introducing-firestore-count-ttl-scale
      //  https://firebase.google.com/docs/firestore/query-data/aggregation-queries
      this.isLoading = false;
    },

    loadAllRecords() {
      this.progressLimit = null;
      this.setProgress({ reset: false, wait: true });
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
