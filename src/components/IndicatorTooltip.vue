<template>
  <div class="tooltip">
    <div>
      <icon-calendar :height="15" :width="15" />
      {{ formattedTimestamp }}
    </div>
    <div>
      <icon-graph :height="15" :width="15" />
      {{ formattedValue }}
    </div>
    <div v-if="comment">
      <icon-comment :height="15" :width="15" />
      {{ comment }}
    </div>
  </div>
</template>

<script>
import { dateShort } from '@/util';
import { formatKPIValue } from '@/util/kpiHelpers';
import IconCalendar from './IconCalendar.vue';
import IconComment from './IconComment.vue';
import IconGraph from './IconGraph.vue';

export default {
  name: 'IndicatorTooltip',
  components: {
    IconCalendar,
    IconComment,
    IconGraph,
  },
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
    formattedTimestamp() {
      return dateShort(this.timestamp);
    },
    formattedValue() {
      return formatKPIValue(this.kpi, this.value, { compact: false })
    },
  },
};
</script>

<style lang="scss" scoped>
.tooltip > div {
  display: flex;
  font-size: 0.75rem;
  margin: 0.5rem 0;
  max-width: 200px;

  > svg {
    flex-shrink: 0;
    margin-right: 0.5rem;
  }
}
</style>
