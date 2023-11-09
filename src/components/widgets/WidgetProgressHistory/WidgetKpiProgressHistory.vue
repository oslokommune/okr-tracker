<template>
  <widget :title="$t('widget.history.title')">
    <template v-if="historyRecords.length" #title-actions>
      <pkt-button
        v-tooltip="$t('dashboard.downloadOptions.csv')"
        size="small"
        skin="tertiary"
        variant="icon-left"
        icon-name="download"
        :disabled="downloadInProgress"
        @onClick="download"
      >
        {{ $t('btn.download') }}
      </pkt-button>
    </template>

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
import { csvFormatBody, csvFormatRow } from 'd3-dsv';
import { mapState } from 'vuex';
import { PktButton } from '@oslokommune/punkt-vue2';
import i18n from '@/locale/i18n';
import { dateShort } from '@/util';
import {
  filterDuplicatedProgressValues,
  formatKPIValue,
  getKPIProgressQuery,
} from '@/util/kpiHelpers';
import downloadFile from '@/util/downloadFile';
import EditValueModal from '@/components/modals/KPIProgressModal.vue';
import ProgressHistoryTable from './ProgressHistoryTable.vue';
import WidgetWrapper from '../WidgetWrapper.vue';

export default {
  name: 'WidgetKpiProgressHistory',

  components: {
    Widget: WidgetWrapper,
    ProgressHistoryTable,
    EditValueModal,
    PktButton,
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
    downloadInProgress: false,
  }),

  computed: {
    ...mapState('kpis', ['selectedPeriod']),

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

    download() {
      const { startDate, endDate } = this.selectedPeriod;
      this.downloadInProgress = true;
      getKPIProgressQuery(this.kpi, startDate, endDate)
        .get()
        .then((snapshot) => {
          const progressRecords = filterDuplicatedProgressValues(
            snapshot.docs.map((doc) => doc.data())
          );

          const content = [
            csvFormatRow([
              i18n.t('fields.date'),
              i18n.t('fields.value'),
              i18n.t('fields.comment'),
            ]),
            csvFormatBody(
              progressRecords.map((d) => [
                d.timestamp.toDate().toISOString().slice(0, 10),
                d.value,
                d.comment,
              ])
            ),
          ].join('\n');

          downloadFile(content, this.kpi.name, '.csv');
          this.downloadInProgress = false;
        });
    },
  },
};
</script>
