<script setup>
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useCollection } from 'vuefire';
import { useI18n } from 'vue-i18n';
import { computedAsync, useLocalStorage } from '@vueuse/core';
import { csvFormatBody, csvFormatRow } from 'd3-dsv';
import {
  collection,
  query,
  orderBy,
  getDocs,
  getCountFromServer,
} from 'firebase/firestore';
import { useAuthStore } from '@/store/auth';
import { useActiveKpiStore } from '@/store/activeKpi';
import { dateShort } from '@/util';
import { db } from '@/config/firebaseConfig';
import {
  filterDuplicatedProgressValues,
  formatKPIValue,
  getKPIProgressConstraints,
} from '@/util/kpiHelpers';
import downloadFile from '@/util/downloadFile';
import { PktButton, PktCheckbox, PktLoader } from '@oslokommune/punkt-vue';
import EmptyState from '@/components/EmptyState.vue';
import ProfileModal from '@/components/modals/ProfileModal.vue';
import FadeTransition from '@/components/generic/transitions/FadeTransition.vue';
import UserLink from '@/components/UserLink.vue';
import WidgetWrapper from '../WidgetWrapper.vue';

const i18n = useI18n();

const { kpi, kpiRef, period } = storeToRefs(useActiveKpiStore());
const { hasEditRights } = storeToRefs(useAuthStore());

const showComments = useLocalStorage('show-kpi-progress-comments', true);
const listLimit = ref(10);
const chosenUserId = ref(null);
const isExporting = ref(false);

function getProgressSource(kpiPath, periodFilter, limitFilter) {
  const { startDate, endDate } = periodFilter;
  return query(
    collection(db, kpiPath, 'progress'),
    ...getKPIProgressConstraints(startDate, endDate, limitFilter),
    orderBy('timestamp', 'desc')
  );
}

const { data: _progress, pending: isLoading } = useCollection(
  computed(
    () =>
      kpiRef.value && getProgressSource(kpiRef.value.path, period.value, listLimit.value)
  ),
  { ssrKey: `progress_${kpiRef.value.id}`, reset: false }
);

const progress = computed(
  () => _progress.value && filterDuplicatedProgressValues(_progress.value)
);

const totalProgressCount = computedAsync(async () => {
  // TODO: Duplicates gets counted here.
  return getCountFromServer(getProgressSource(kpiRef.value.path, period.value)).then(
    (snapshot) => snapshot.data().count
  );
}, null);
const isFiltered = computed(() => period.value?.key !== 'all');
const isLimited = computed(() => totalProgressCount.value > progress.value.length);

async function download() {
  isExporting.value = true;

  getDocs(getProgressSource(kpiRef.value.path, period.value)).then((snapshot) => {
    const progressRecords = filterDuplicatedProgressValues(
      snapshot.docs.map((document) => document.data())
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

    downloadFile(content, kpi.value.name, '.csv');
  });

  isExporting.value = false;
}

function toggleListLimit() {
  listLimit.value = listLimit.value ? null : 10;
}
</script>

<template>
  <WidgetWrapper :title="$t('widget.history.title')" class="progress-history">
    <template #title-actions>
      <PktCheckbox
        id="showComments"
        v-model="showComments"
        class="pkt-input-check--small"
        is-switch
        :label="$t('widget.history.showComments')"
      />
      <div class="separator"></div>
      <PktButton
        v-tooltip="$t('dashboard.downloadOptions.csv')"
        size="small"
        skin="tertiary"
        variant="icon-left"
        icon-name="download"
        :disabled="isLoading || isExporting"
        @on-click="download"
      >
        {{ $t('btn.download') }}
      </PktButton>
    </template>

    <FadeTransition>
      <div v-if="progress.length" class="progress-history__table">
        <table class="table">
          <thead>
            <tr>
              <th>{{ $t('widget.history.date') }}</th>
              <th>{{ $t('widget.history.value') }}</th>
              <th>{{ $t('widget.history.changedBy') }}</th>
              <th v-if="showComments">{{ $t('widget.history.comment') }}</th>
              <th v-if="hasEditRights" style="width: 3rem"></th>
            </tr>
          </thead>

          <TransitionGroup name="table" tag="tbody">
            <tr v-for="record in progress" :key="record.id">
              <td>{{ dateShort(record.timestamp.toDate()) }}</td>
              <td>{{ formatKPIValue(kpi, record.value) }}</td>
              <td>
                <UserLink
                  v-if="record.editedBy || record.createdBy"
                  :user="record.editedBy || record.createdBy"
                  @activate="chosenUserId = $event"
                />
              </td>
              <td v-if="showComments" style="max-width: 200px; padding: 0.25rem 0.5rem">
                <span v-if="record.comment" class="record__comment">
                  {{ record.comment }}
                </span>
              </td>
              <td v-if="hasEditRights">
                <div class="record__actions">
                  <PktButton
                    v-tooltip.left="$t('tooltip.editProgress')"
                    size="small"
                    skin="tertiary"
                    variant="icon-only"
                    icon-name="edit"
                    @on-click="$emit('edit-record', record)"
                  />
                </div>
              </td>
            </tr>
          </TransitionGroup>
        </table>
      </div>

      <EmptyState
        v-else-if="!isLoading"
        icon="history"
        :heading="$t('widget.history.empty.heading')"
        :body="isFiltered ? $t('empty.noKPIProgressInPeriod') : $t('empty.noKPIProgress')"
      />
    </FadeTransition>

    <div v-if="isLoading" class="progress-history__loading">
      <PktLoader
        :message="$t('general.loading')"
        size="large"
        variant="blue"
        :delay="500"
        inline
      />
    </div>

    <div class="progress-history__footer">
      <PktButton
        v-if="!isLoading && isLimited"
        skin="secondary"
        size="small"
        @on-click="toggleListLimit"
      >
        {{ $t(listLimit ? 'btn.showMore' : 'btn.showLess') }}
      </PktButton>
    </div>

    <ProfileModal
      v-if="!!chosenUserId"
      :user-id="chosenUserId"
      @close="chosenUserId = null"
    />
  </WidgetWrapper>
</template>

<style lang="scss" scoped>
@use '@oslokommune/punkt-css/dist/scss/abstracts/mixins/typography' as *;

.progress-history {
  &__loading {
    padding: 0.65rem 0;
    text-align: center;
  }

  &__footer {
    text-align: center;
  }
}

.record__comment {
  white-space: pre-line;
}

.record__actions {
  display: flex;
}

td {
  @include get-text('pkt-txt-14');
  overflow-wrap: break-word;
}

.pkt-input-check--small {
  :deep(.pkt-input-check__input) {
    align-items: center;
  }

  :deep(input[type='checkbox'][role='switch']) {
    width: 1.75rem;
    height: calc(1rem + 2px);

    &:after {
      width: 1rem;
    }
  }
  :deep(label) {
    @include get-text('pkt-txt-14');
  }
}

.table-enter-active,
.table-leave-active {
  transition: all 0.25s ease-in-out;
}
.table-enter-from,
.table-leave-to {
  opacity: 0;
}
</style>
