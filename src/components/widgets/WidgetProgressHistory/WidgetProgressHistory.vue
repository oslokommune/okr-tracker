<template>
  <widget :title="$t('widget.history.title')">
    <progress-history-table
      :is-loading="isLoading"
      :history-records="progress"
      :no-values-message="$t('empty.noKeyResultProgress')"
      @edit-record="openValueModal"
      @delete-record="(record) => $emit('delete-record', record.id)"
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
import ProgressHistoryTable from './ProgressHistoryTable.vue';
import WidgetWrapper from '../WidgetWrapper.vue';

export default {
  name: 'WidgetProgressHistory',

  components: {
    Widget: WidgetWrapper,
    ProgressHistoryTable,
    EditValueModal: () => import('@/components/modals/ProgressModal.vue'),
  },

  props: {
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
    showValueModal: false,
    chosenProgressRecord: null,
  }),

  computed: {
    ...mapGetters(['hasEditRights']),

    historyRecords() {
      return [...this.progress].sort((a, b) =>
        a.timestamp.toDate() > b.timestamp.toDate() ? -1 : 1
      );
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
