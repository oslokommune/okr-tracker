<template>
  <widget :title="title ? title : $t('widget.history.title')">
    <template #title-actions><slot name="title-actions" /></template>
    <progress-history-table
      :history-records="historyRecords"
      :is-loading="isLoading"
      :is-limited="isLimited"
      :no-values-message="$t('empty.noKeyResultProgress')"
      @edit-record="openValueModal"
      @delete-record="(record) => $emit('delete-record', record.id)"
      @load-more="progressLimit = null"
    >
      <template #value-cell="{ record }">{{ formatValue(record.value) }}</template>
      <template #date-cell="{ record }">
        {{ dateTimeShort(record.timestamp.toDate()) }}
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
import { mapGetters } from 'vuex';
import { dateTimeShort } from '@/util';
import { formatValue } from '@/util/keyResultProgress';
import EditValueModal from '@/components/modals/ProgressModal.vue';
import ProgressHistoryTable from './ProgressHistoryTable.vue';
import WidgetWrapper from '../WidgetWrapper.vue';

export default {
  name: 'WidgetProgressHistory',

  components: {
    Widget: WidgetWrapper,
    ProgressHistoryTable,
    EditValueModal,
  },

  props: {
    title: {
      type: String,
      required: false,
      default: null,
    },
    isLoading: {
      type: Boolean,
      required: true,
    },
    progress: {
      type: Array,
      required: true,
    },
  },

  data: () => ({
    progressLimit: 10,
    showValueModal: false,
    chosenProgressRecord: null,
  }),

  computed: {
    ...mapGetters(['hasEditRights']),

    historyRecords() {
      const records = [...this.progress].sort((a, b) =>
        a.timestamp.toDate() > b.timestamp.toDate() ? -1 : 1
      );
      return this.progressLimit ? records.slice(0, this.progressLimit) : records;
    },

    isLimited() {
      return this.progressLimit && this.progress.length > this.progressLimit;
    },
  },

  methods: {
    formatValue,
    dateTimeShort,

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
