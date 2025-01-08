<script setup>
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toast-notification';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/store/auth';
import { useActiveItemStore } from '@/store/activeItem';
import { useActiveObjectiveStore } from '@/store/activeObjective';
import { useActiveKeyResultStore } from '@/store/activeKeyResult';
import { max, min } from 'd3-array';
import { collection } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import Progress from '@/db/Progress';
import { getKeyResultProgressDetails } from '@/util/keyResultProgress';
import { getComputedStyleVariable, DEFAULT_SERIES_OPTIONS } from '@/util/chart';
import { PktAlert, PktBreadcrumbs, PktButton } from '@oslokommune/punkt-vue';
import PaneWrapper from '@/components/panes/PaneWrapper.vue';
import LineChart from '@/components/generic/LineChart.vue';
// import WidgetKeyResultNotes from '@/components/widgets/WidgetKeyResultNotes.vue';
import WidgetKeyResultDetails from '@/components/widgets/WidgetKeyResultDetails.vue';
import KeyResultValuesList from '@/components/KeyResultValuesList.vue';
import HTMLOutput from '@/components/HTMLOutput.vue';
import ProgressModal from '@/components/modals/ProgressModal/ProgressModal.vue';
import ProgressBar from '@/components/ProgressBar.vue';
import EmptyState from '@/components/EmptyState.vue';
import FadeTransition from '@/components/generic/transitions/FadeTransition.vue';

const router = useRouter();
const i18n = useI18n();
const toast = useToast();

const { user, isSuperAdmin, isAdminOfCurrentItemOrganization } = storeToRefs(
  useAuthStore()
);
const { item } = storeToRefs(useActiveItemStore());
const { objective, objectivePeriod } = storeToRefs(useActiveObjectiveStore());
const {
  keyResult,
  isLoading: keyResultIsLoading,
  progress,
} = storeToRefs(useActiveKeyResultStore());

const renderProgressValues = ref(false);
const renderWidgets = ref(false);

const breadcrumbs = computed(() => [
  { text: item.value.name, href: { name: 'ItemHome' } },
  {
    text: objective.value.name,
    href: {
      name: 'ObjectiveHome',
      params: { objectiveId: objective.value.id },
    },
  },
  { text: keyResult.value.name },
]);

const isMemberOfKeyResultParent = computed(() =>
  keyResult.value.parent.team?.includes(user.value.path)
);

const canEdit = computed(
  () =>
    isSuperAdmin.value ||
    isAdminOfCurrentItemOrganization.value ||
    isMemberOfKeyResultParent.value
);

const chartOptions = computed(() => {
  let xMin = objectivePeriod.value.startDate;
  let xMax = objectivePeriod.value.endDate;

  if (progress.value.length) {
    // Ensure that the x axis includes all progress values.
    const progressTimestamps = [
      ...progress.value.map((record) => record.timestamp.toDate()),
    ];
    const progressMin = min(progressTimestamps);
    const progressMax = max(progressTimestamps);

    if (progressMin < xMin) {
      xMin = progressMin;
    }
    if (progressMax > xMax) {
      xMax = progressMax;
    }
  }

  const { startValue, targetValue } = keyResult.value;
  const progressValues = progress.value.map((record) => record.value);
  const yMin = min(progressValues) > startValue ? startValue : null;
  const yMax = max(progressValues) < targetValue ? targetValue : null;
  return { xMin, xMax, yMin, yMax };
});

const chartMarkArea = computed(() => {
  // Annotate the graph area in case values are recorded outside defined
  // objective period.
  const areas = [];

  if (chartOptions.value.xMin < objectivePeriod.value.startDate) {
    areas.push([
      { xAxis: chartOptions.value.xMin },
      { xAxis: objectivePeriod.value.startDate },
    ]);
  }

  if (chartOptions.value.xMax > objectivePeriod.value.endDate) {
    areas.push([
      { xAxis: objectivePeriod.value.endDate },
      { xAxis: chartOptions.value.xMax },
    ]);
  }

  return {
    silent: true,
    itemStyle: {
      color: getComputedStyleVariable('--pkt-color-brand-dark-blue-1000'),
      opacity: 0.05,
    },
    data: areas,
  };
});

const chartSeries = computed(() => [
  {
    ...DEFAULT_SERIES_OPTIONS,
    data: progress.value.length
      ? [
          [chartOptions.value.xMin, keyResult.value.startValue],
          ...progress.value.map((r) => [
            r.timestamp.toDate().toISOString(),
            r.value,
            r.comment,
          ]),
        ]
      : [],
    color: getComputedStyleVariable('--color-blue-light'),
    markArea: chartMarkArea.value,
    areaStyle: { opacity: 0.25 },
  },
]);

const showValueModal = ref(false);
const chosenProgressRecord = ref(null);

const progression = computed(() => {
  const progressDetails = getKeyResultProgressDetails(keyResult.value);
  return progressDetails.percentageCompleted / 100;
});

function valueSelect(e) {
  if (e?.dataIndex > 0) {
    openValueModal(progress.value[e.dataIndex - 1]);
  }
}

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
    await Progress.create(collection(db, 'keyResults'), keyResult.value.id, data);
    toast.success(i18n.t('toaster.add.progress'));
  } catch {
    toast.error(i18n.t('toaster.error.addProgress'));
  } finally {
    modalCloseHandler();
  }
}

async function updateProgressRecord(id, data, modalCloseHandler) {
  try {
    await Progress.update(collection(db, 'keyResults'), keyResult.value.id, id, data);
    toast.success(i18n.t('toaster.update.progress'));
  } catch {
    toast.error(i18n.t('toaster.error.updateProgress'));
  } finally {
    modalCloseHandler();
  }
}

async function deleteProgressRecord(id, modalCloseHandler) {
  try {
    await Progress.remove(collection(db, 'keyResults'), keyResult.value.id, id);
    toast.success(i18n.t('toaster.delete.progress'));
  } catch {
    toast.error(i18n.t('toaster.error.deleteProgress'));
  } finally {
    modalCloseHandler();
  }
}
</script>

<template>
  <PaneWrapper
    ref="pane"
    class="key-result-pane"
    closable
    @close="router.push({ name: 'ObjectiveHome', params: { objectiveId: objective.id } })"
  >
    <template #title>
      <PktBreadcrumbs
        v-if="objective && keyResult"
        class="pkt-hide-laptop-up"
        navigation-type="router"
        :breadcrumbs="breadcrumbs"
      />
    </template>

    <h1 class="key-result-pane__title pkt-txt-18-medium">
      {{ $t('general.keyResult') }}
    </h1>

    <PktAlert v-if="keyResult && keyResult.archived" skin="warning" compact>
      {{ $t('archived.heading') }}
    </PktAlert>

    <FadeTransition :duration="100" @after-enter="renderProgressValues = true">
      <div v-if="!keyResultIsLoading && keyResult" class="key-result-pane__details">
        <div class="key-result-pane__header">
          <h2 class="pkt-txt-18-medium">{{ keyResult.name }}</h2>

          <PktButton
            v-if="canEdit"
            v-tooltip="$t('btn.updateKeyResult')"
            skin="tertiary"
            size="small"
            variant="icon-only"
            icon-name="edit"
            @on-click="$emit('edit-key-result')"
          />
        </div>

        <HTMLOutput
          v-if="keyResult.description"
          class="key-result-pane__description"
          :html="keyResult.description"
        />

        <div class="key-result-pane__progression">
          <h4 class="pkt-txt-14-medium">{{ $t('keyResult.progression') }}</h4>
          <PktButton
            v-if="canEdit"
            :text="$t('widget.history.value')"
            skin="primary"
            size="small"
            variant="icon-left"
            icon-name="plus-sign"
            @on-click="openValueModal(null)"
          />
        </div>

        <LineChart
          class="key-result-pane__graph"
          v-bind="chartOptions"
          :series="chartSeries"
          @click="valueSelect"
        />

        <ProgressBar :progression="progression" :show-min-max-indicators="true" />
      </div>
    </FadeTransition>

    <FadeTransition :duration="100" @after-enter="renderWidgets = true">
      <div v-if="renderProgressValues" class="key-result-pane__values">
        <h3 class="pkt-txt-16-medium">{{ $t('keyResult.registeredValues') }}</h3>

        <KeyResultValuesList
          v-if="progress.length"
          :progress="progress"
          :can-edit="canEdit"
          class="key-result-pane__table"
          @edit-value="openValueModal"
          @delete-value="(record) => deleteHistoryRecord(record.id)"
        />

        <EmptyState
          v-else
          icon="history"
          :heading="$t('widget.history.empty.heading')"
          :body="$t('empty.noKeyResultProgress')"
          skin="dim"
        />
      </div>
    </FadeTransition>

    <FadeTransition :duration="150">
      <div v-if="keyResult && renderWidgets" class="key-result-pane__widgets">
        <!--
        Hide notes widget for now. This one needs work separately. We give the
        impression that these notes are secret to the team, which is really not
        the case currently.
      -->
        <!-- <WidgetKeyResultNotes :key-result="keyResult" /> -->
        <WidgetKeyResultDetails :key-result="keyResult" />
      </div>
    </FadeTransition>

    <ProgressModal
      v-if="showValueModal"
      :record="chosenProgressRecord"
      :unit="keyResult.unit"
      @create-record="createProgressRecord"
      @update-record="updateProgressRecord"
      @delete-record="deleteProgressRecord"
      @close="closeValueModal"
    />
  </PaneWrapper>
</template>

<style lang="scss" scoped>
.key-result-pane {
  background-color: var(--color-gray);

  &__details {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1.5rem;
    background-color: var(--color-white);
    border-left: 0.25rem solid var(--color-blue-dark);
  }

  &__header {
    display: flex;
    justify-content: space-between;
    text-wrap: balance;

    .pkt-btn {
      margin: -0.5rem -0.5rem 0 0;
    }
  }

  &__progression {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 0.5rem;
  }

  &__graph {
    height: 250px;
  }

  &__values {
    margin-top: 3rem;
  }

  &__table {
    margin-top: 1rem;
  }

  &__widgets {
    margin-top: 3rem;

    :deep(.widget) {
      padding: 0;
      border: 0;
    }
  }
}

.pkt-breadcrumbs {
  display: flex;

  :deep(.pkt-breadcrumbs--mobile) {
    width: 100%;

    .pkt-breadcrumbs__text {
      white-space: nowrap;
    }
  }
}
</style>
