<script setup>
import { computed, nextTick, ref } from 'vue';
import { storeToRefs } from 'pinia';
import html2canvas from 'html2canvas';
import { doc, writeBatch } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import metadata from '@/db/common/util/metadata';
import { PktButton } from '@oslokommune/punkt-vue';
import downloadFile from '@/util/downloadFile';
import { periodDates } from '@/util';
import { compareKPIs } from '@/util/kpiHelpers';
import { useAuthStore } from '@/store/auth';
import { useActiveItemStore } from '@/store/activeItem';
import { useKpisStore } from '@/store/kpis';
import KpiWidgetGroupLink from '@/components/KpiWidgetGroupLink.vue';
import SortableList from '@/components/SortableList.vue';

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  kpis: {
    type: Array,
    required: true,
  },
  compact: {
    type: Boolean,
    required: false,
    default: false,
  },
});

const { hasEditRights } = storeToRefs(useAuthStore());
const { item } = storeToRefs(useActiveItemStore());
const { period } = storeToRefs(useKpisStore());

const widget = ref(null);
const rendering = ref(false);

const orderedKpis = computed({
  get() {
    return props.kpis.map((kpi) => kpi).sort(compareKPIs(item.value.id));
  },
  async set(kpis) {
    const batch = writeBatch(db);

    kpis.forEach((kpi, i) => {
      const order = kpi.order ? kpi.order : {};

      if (order[item.value.id] !== i) {
        order[item.value.id] = i;
        batch.update(doc(db, kpi.path), { order, ...metadata.edited() });
      }
    });

    await batch.commit();
  },
});

const imageFilename = computed(() =>
  [
    item.value ? item.value.slug : '',
    ...props.title.toLowerCase().split(' '),
    new Date().toISOString().slice(0, 10),
  ].join('-')
);

async function download() {
  rendering.value = true;
  await nextTick();
  html2canvas(widget.value).then((canvas) => {
    rendering.value = false;
    canvas.toBlob((blob) => {
      downloadFile(blob, imageFilename.value, '.png');
    });
  });
}
</script>

<template>
  <div
    ref="widget"
    :class="['kpi-widget-group', { 'kpi-widget-group--compact': compact }]"
  >
    <div class="kpi-widget-group__title">
      <h2 class="pkt-txt-16">{{ title }}</h2>
      <template v-if="!compact">
        <span v-if="period.startDate && period.endDate" class="pkt-txt-14">
          {{ $t('general.period') }}: {{ periodDates(period) }}
        </span>
        <span v-else class="pkt-txt-14">
          {{ $t('general.period') }}: {{ period.label }}
        </span>
        <PktButton
          v-if="!rendering && kpis.length"
          size="small"
          skin="tertiary"
          variant="icon-left"
          icon-name="download"
          @on-click="download"
        >
          {{ $t('btn.download') }}
        </PktButton>
      </template>
    </div>

    <SortableList
      v-if="hasEditRights"
      v-model="orderedKpis"
      class="kpi-widget-group__kpis"
      handle=".drag-icon"
    >
      <KpiWidgetGroupLink
        v-for="{ id } in orderedKpis"
        :key="id"
        :kpi-id="id"
        :compact="compact"
      />
    </SortableList>

    <KpiWidgetGroupLink
      v-for="{ id } in orderedKpis"
      v-else
      :key="id"
      :kpi-id="id"
      :compact="compact"
    />
  </div>
</template>

<style lang="scss" scoped>
@use '@oslokommune/punkt-css/dist/scss/abstracts/mixins/typography' as *;

.kpi-widget-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 4rem;

  &__title {
    display: flex;
    gap: 0.75rem;
    align-items: center;
    justify-content: space-between;
    color: var(--color-grayscale-60);

    h2 {
      flex-grow: 1;
    }
  }

  &__kpis {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  &--compact {
    gap: 0.125rem;
    margin-bottom: 1rem;

    .kpi-widget-group__title h2 {
      @include get-text('pkt-txt-14');
    }
  }
}

:deep(.kpi-widget-group-link.sortable-ghost) {
  border-color: transparent;

  * {
    color: var(--color-grayscale-10) !important;
    background: var(--color-grayscale-10) !important;
    border-color: var(--color-grayscale-10) !important;
    fill: var(--color-grayscale-10);
    stroke: var(--color-grayscale-10);
  }

  .period-trend-tag__trend::before,
  .period-trend-tag__trend::after {
    border-color: var(--color-grayscale-10) !important;
  }
}
</style>
