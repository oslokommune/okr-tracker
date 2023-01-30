<template>
  <div class="tooltip">
    <div class="date">{{ formattedDate }}</div>
    <div class="value">{{ formattedValue }}</div>
    <div v-if="comment">{{ comment }}</div>
  </div>
</template>

<script>
import { dateShort } from '@/util';
import { formatKPIValue } from '@/util/kpiHelpers';

export default {
  name: 'IndicatorTooltip',
  props: {
    timestamp: {
      type: Date,
      required: true,
    },
    value: {
      type: Number,
      required: true,
    },
    kpi: {
      type: Object,
      required: true,
      default: null,
    },
    comment: {
      type: String,
      required: false,
      default: null,
    },
  },
  computed: {
    formattedDate() {
      return dateShort(this.timestamp);
    },
    formattedValue() {
      return formatKPIValue(this.kpi, this.value);
    },
  },
};
</script>

<style lang="scss" scoped>
@use '@/styles/typography';

.tooltip {
  > div {
    max-width: 200px;
    margin: 0.5rem 0;
    font-weight: 500;
    font-size: typography.$font-size-1;
    overflow-wrap: break-word;
  }

  .date {
    font-weight: 400;
  }

  .value {
    font-size: typography.$font-size-4;
  }
}
</style>
