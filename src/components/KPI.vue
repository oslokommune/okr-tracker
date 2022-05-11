<template>
  <div :class="{ kpi: true, 'kpi--isEmpty': !kpi }">
    <div class="kpi__name">{{ kpiName(kpiType, kpi) }}</div>
    <div v-if="kpi" class="kpi__value">
      <span v-if="kpi.error || !kpi.valid">–––</span>
      <span v-else>{{ formatKPIValue(kpi.currentValue) }}</span>
    </div>
    <i class="kpi__icon far" :class="kpiIcon()" />
  </div>
</template>

<script>
import { numberLocale } from '@/util';
import { kpiName } from '@/util/kpiHelpers';

export default {
  name: 'KPI',

  props: {
    kpiType: {
      type: String,
      required: true,
    },
    kpi: {
      type: Object,
      required: false,
      default: null,
    },
  },

  methods: {
    kpiName,
    kpiIcon() {
      switch (this.kpiType) {
        case 'users': {
          return 'fa-user';
        }
        case 'satisfaction': {
          return 'fa-smile';
        }
        default: {
          return 'fa-check-square';
        }
      }
    },
    formatKPIValue(value) {
      switch (this.kpiType) {
        case 'users': {
          return numberLocale.format(',')(value);
        }
        case 'satisfaction':
        case 'conversion': {
          return numberLocale.format('.2p')(value);
        }
        default: {
          return '---';
        }
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.kpi {
  position: relative;
  height: 8rem;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
  color: var(--color-text);
  font-weight: 500;
  background: var(--color-secondary-light);

  &--isEmpty {
    color: rgba(var(--color-purple-rgb), 0.25);
    background: rgba(var(--color-grey-100-rgb), 0.5);

    & > .kpi__icon {
      opacity: 0.25;
    }
  }

  &__value {
    font-weight: 900;
    font-size: 3rem;
    line-height: 1em;
  }

  &__icon {
    position: absolute;
    right: -1rem;
    bottom: -1rem;
    font-size: 8rem;
    opacity: 0.15;
  }
}
</style>
