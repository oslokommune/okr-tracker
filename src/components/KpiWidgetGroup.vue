<template>
  <div :class="['kpi-widget-group', { 'kpi-widget-group--compact': compact }]">
    <div class="kpi-widget-group__title">
      <h2>{{ title }}</h2>
      <template v-if="!compact">
        <span v-if="selectedPeriod.startDate && selectedPeriod.endDate">
          {{ $t('general.period') }}: {{ periodDates(selectedPeriod) }}
        </span>
        <span v-else>{{ $t('general.period') }}: {{ selectedPeriod.label }}</span>
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
    <div class="kpi-widget-group__kpis">
      <router-link
        v-for="kpi in kpis"
        :key="kpi.id"
        :to="{
          name: 'ItemMeasurements',
          params: { ...$route.params, kpiId: kpi.id },
          query: { resultIndicatorPeriod: selectedPeriod?.key },
        }"
        class="kpi-widget-group__link"
      >
        <widget-kpi-card :kpi="kpi" :compact="compact" />
      </router-link>
    </div>
  </div>
</template>

<script>
import html2canvas from 'html2canvas';
import { mapState } from 'vuex';
import { periodDates } from '@/util';
import { PktButton } from '@oslokommune/punkt-vue2';
import downloadFile from '@/util/downloadFile';
import { formatKPIValue } from '@/util/kpiHelpers';
import WidgetKpiCard from '@/components/widgets/WidgetKpiCard/WidgetKpiCard.vue';

export default {
  name: 'KpiWidgetGroup',

  components: {
    PktButton,
    WidgetKpiCard,
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
    ...mapState(['selectedPeriod']),

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
  },

  methods: {
    periodDates,
    formatKPIValue,

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
@use '@/styles/typography';

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
    color: var(--color-grayscale-40);

    h2 {
      flex-grow: 1;
      font-weight: 500;
      font-size: typography.$font-size-3;
    }

    span {
      font-size: typography.$font-size-1;
    }
  }

  &__kpis {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  &__link {
    text-decoration: none;
    border: 2px solid transparent;

    &.router-link-active {
      border-color: var(--color-hover);

      ::v-deep .widget__header h3 {
        color: var(--color-hover);
      }
    }

    .kpi-card-widget {
      &:hover {
        background: var(--color-gray-light);

        ::v-deep {
          .widget__header h3 {
            color: var(--color-hover);
          }

          .period-trend-tag__trend {
            &:before {
              border-left-color: var(--color-gray-light);
            }
            &:after {
              border-top-color: var(--color-gray-light);
              border-bottom-color: var(--color-gray-light);
            }
          }
        }
      }
    }
  }

  &--compact {
    gap: 0.5rem;
    margin-bottom: 1rem;

    .kpi-widget-group__title h2 {
      font-size: typography.$font-size-1;
    }

    .kpi-widget-group__kpis {
      gap: 0.5rem;
    }
  }
}
</style>
