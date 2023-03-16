<template>
  <widget :title="$t('kpi.currentValue')" class="kpi-current-value-widget">
    <div class="kpi-current-value-widget__inner">
      <div class="kpi-current-value-widget__value">
        {{ kpiValue }}
      </div>

      <div v-if="hasEditRights">
        <button class="btn btn--ter btn--icon btn--fw" @click="$emit('show-value-modal')">
          <i class="icon fa fa-plus" />
          <span>{{ $t('kpi.newValue') }}</span>
        </button>
      </div>
    </div>
  </widget>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import { formatKPIValue } from '@/util/kpiHelpers';

export default {
  name: 'WidgetKeyResultDetails',

  components: {
    Widget: () => import('./WidgetWrapper.vue'),
  },

  props: {
    latestProgressRecord: {
      type: Object,
      required: false,
      default: null,
    },
  },

  computed: {
    ...mapState(['activeKpi']),
    ...mapGetters(['hasEditRights']),

    kpiValue() {
      return this.latestProgressRecord
        ? formatKPIValue(this.activeKpi, this.latestProgressRecord.value)
        : formatKPIValue(this.activeKpi);
    },
  },

  methods: {
    formatKPIValue,
  },
};
</script>

<style lang="scss" scoped>
.kpi-current-value-widget {
  background: var(--color-secondary);

  &__inner {
    display: flex;
    flex-direction: column;
    gap: 1rem;

    @media screen and (min-width: bp(s)) {
      flex-direction: row;
      justify-content: space-between;
    }
  }

  &__value {
    color: var(--color-primary);
    font-weight: 700;
    font-size: 50px;
    word-wrap: break-word;
  }
}
</style>
