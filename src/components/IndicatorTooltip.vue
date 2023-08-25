<template>
  <div class="tooltip">
    <div class="date">{{ formattedDate }}</div>
    <div class="value pkt-txt-20">{{ formattedValue }}</div>
    <div v-if="comment">{{ comment }}</div>
  </div>
</template>

<script>
import { dateShort } from '@/util';
import { formatValue } from '@/util/keyResultProgress';
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
      required: false,
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
      if (this.kpi) {
        return formatKPIValue(this.kpi, this.value);
      }
      return formatValue(this.value);
    },
  },
};
</script>

<style lang="scss" scoped>
.tooltip {
  > div {
    max-width: 200px;
    margin: 0.5rem 0;
    font-weight: 500;
    overflow-wrap: break-word;
  }

  .date {
    font-weight: 400;
  }
}
</style>
