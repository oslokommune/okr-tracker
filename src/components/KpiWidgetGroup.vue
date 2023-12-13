<template>
  <div :class="['kpi-widget-group', { 'kpi-widget-group--compact': compact }]">
    <div class="kpi-widget-group__title">
      <h2 class="pkt-txt-16">{{ title }}</h2>
      <template v-if="!compact">
        <span
          v-if="selectedPeriod.startDate && selectedPeriod.endDate"
          class="pkt-txt-14"
        >
          {{ $t('general.period') }}: {{ periodDates(selectedPeriod) }}
        </span>
        <span v-else class="pkt-txt-14"
          >{{ $t('general.period') }}: {{ selectedPeriod.label }}
        </span>
        <pkt-button
          v-if="!rendering && kpis.length"
          size="small"
          skin="tertiary"
          variant="icon-left"
          icon-name="download"
          @onClick="download($event)"
        >
          {{ $t('btn.download') }}
        </pkt-button>
      </template>
    </div>
    <draggable
      v-if="hasEditRights"
      v-model="orderedKpis"
      animation="300"
      handle=".drag-icon"
    >
      <transition-group class="kpi-widget-group__kpis">
        <kpi-widget-group-link
          v-for="kpi in orderedKpis"
          :key="kpi.id"
          :kpi="kpi"
          :compact="compact"
        />
      </transition-group>
    </draggable>
    <kpi-widget-group-link
      v-for="kpi in orderedKpis"
      v-else
      :key="kpi.id"
      :kpi="kpi"
      :compact="compact"
    />
  </div>
</template>

<script>
import draggable from 'vuedraggable';
import html2canvas from 'html2canvas';
import { mapGetters, mapState } from 'vuex';
import { periodDates } from '@/util';
import { PktButton } from '@oslokommune/punkt-vue2';
import downloadFile from '@/util/downloadFile';
import Kpi from '@/db/Kpi';
import KpiWidgetGroupLink from '@/components/KpiWidgetGroupLink.vue';
import { compareKPIs } from '@/util/kpiHelpers';

export default {
  name: 'KpiWidgetGroup',

  components: {
    draggable,
    KpiWidgetGroupLink,
    PktButton,
  },

  props: {
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
  },

  data: () => ({
    rendering: false,
  }),

  computed: {
    ...mapState(['activeItem']),
    ...mapState('kpis', ['selectedPeriod']),
    ...mapGetters(['hasEditRights']),

    itemSlug() {
      if (this.kpis.length && this.kpis[0]?.parent?.slug) {
        return this.kpis[0].parent.slug;
      }

      return null;
    },

    imageFilename() {
      const now = new Date();
      return [
        this.itemSlug ? this.itemSlug : '',
        ...this.title.toLowerCase().split(' '),
        now.toISOString().slice(0, 10),
      ].join('-');
    },

    orderedKpis: {
      get() {
        return this.kpis.map((kpi) => kpi).sort(compareKPIs(this.activeItem.id));
      },
      set(kpis) {
        kpis.forEach((kpi, i) => {
          const order = kpi.order ? kpi.order : {};

          if (order[this.activeItem.id] !== i) {
            order[this.activeItem.id] = i;
            Kpi.update(kpi.id, { order });
          }
        });
      },
    },
  },

  methods: {
    periodDates,

    download() {
      this.rendering = true;
      this.$nextTick(() => {
        html2canvas(this.$el).then((canvas) => {
          this.rendering = false;
          canvas.toBlob((blob) => {
            downloadFile(blob, this.imageFilename, '.png');
          });
        });
      });
    },
  },
};
</script>

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

::v-deep .kpi-widget-group-link.sortable-ghost * {
  color: var(--color-grayscale-10) !important;
  background: var(--color-grayscale-10) !important;
  border-color: var(--color-grayscale-10) !important;
  fill: var(--color-grayscale-10);
  stroke: var(--color-grayscale-10);

  & .period-trend-tag__trend {
    &::after,
    &::before {
      border-color: var(--color-grayscale-10);
    }
  }
}
</style>
