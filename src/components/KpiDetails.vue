<script setup>
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useToast } from 'vue-toast-notification';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/store/auth';
import { useActiveKpiStore } from '@/store/activeKpi';
import { PktAlert, PktButton } from '@oslokommune/punkt-vue';
import EditGoalsModal from '@/components/modals/EditGoalsModal.vue';
import HTMLOutput from '@/components/HTMLOutput.vue';
import Progress from '@/db/Kpi/Progress';
import ProgressModal from '@/components/modals/ProgressModal/KPIProgressModal.vue';
import WidgetKpiProgressGraph from '@/components/widgets/WidgetKpiProgressGraph.vue';
import WidgetKpiProgressHistory from '@/components/widgets/WidgetKpiProgressHistory.vue';
import WidgetKpiProgressStats from '@/components/widgets/WidgetKpiProgressStats.vue';

const i18n = useI18n();
const toast = useToast();

const { hasEditRights } = storeToRefs(useAuthStore());
const { kpi } = storeToRefs(useActiveKpiStore());

const showValueModal = ref(false);
const chosenProgressRecord = ref(null);
const showEditGoalsModal = ref(false);

function openValueModal(record) {
  showValueModal.value = true;
  chosenProgressRecord.value = record;
}

function closeValueModal() {
  showValueModal.value = false;
  chosenProgressRecord.value = null;
}

async function createProgressRecord(data, modalCloseHandler) {
  try {
    await Progress.update(kpi.value.id, data);
    toast.success(i18n.t('toaster.add.progress'));
  } catch (e) {
    toast.error(i18n.t('toaster.error.addProgress'));
  } finally {
    modalCloseHandler();
  }
}

async function updateProgressRecord(id, data, modalCloseHandler) {
  try {
    await Progress.update(kpi.value.id, data, id);
    toast.success(i18n.t('toaster.update.progress'));
  } catch (e) {
    toast.error(i18n.t('toaster.error.updateProgress'));
  } finally {
    modalCloseHandler();
  }
}

async function deleteProgressRecord(id, modalCloseHandler) {
  try {
    await Progress.remove(kpi.value.id, id);
    toast.success(i18n.t('toaster.delete.progress'));
    modalCloseHandler();
  } catch {
    toast.error(i18n.t('toaster.error.deleteProgress'));
  }
}
</script>

<template>
  <div class="kpi-details">
    <header class="kpi-details__header">
      <h2>{{ kpi.name }}</h2>
      <PktButton
        v-if="hasEditRights"
        v-tooltip="{ content: $t('admin.measurement.change'), placement: 'left' }"
        skin="tertiary"
        variant="icon-only"
        size="medium"
        icon-name="edit"
        @on-click="$emit('edit-kpi')"
      />
    </header>

    <HTMLOutput
      v-if="kpi.description"
      class="mb-size-32 pkt-txt-16-light"
      :html="kpi.description"
    />

    <PktAlert v-if="kpi.archived" skin="warning" class="mb-size-24">
      {{ $t('kpi.archived') }}
    </PktAlert>

    <WidgetKpiProgressGraph
      @add-value="showValueModal = true"
      @set-goals="showEditGoalsModal = true"
    />

    <WidgetKpiProgressStats />

    <WidgetKpiProgressHistory
      @edit-record="openValueModal"
      @delete-record="deleteProgressRecord"
    />

    <ProgressModal
      v-if="hasEditRights && showValueModal"
      :kpi="kpi"
      :record="chosenProgressRecord"
      @create-record="createProgressRecord"
      @update-record="updateProgressRecord"
      @delete-record="deleteProgressRecord"
      @close="closeValueModal"
    />

    <EditGoalsModal
      v-if="hasEditRights && showEditGoalsModal"
      :kpi="kpi"
      @close="showEditGoalsModal = false"
    />
  </div>
</template>

<style lang="scss" scoped>
@use '@oslokommune/punkt-css/dist/scss/abstracts/mixins/typography' as *;

.kpi-details__header {
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;

  h2 {
    @include get-text('pkt-txt-20');

    @include bp('tablet-up') {
      @include get-text('pkt-txt-22');
    }
  }
}
</style>
