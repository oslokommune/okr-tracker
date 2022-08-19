<template>
  <div class="tooltip">
    <div>
      <icon-calendar :height="15" :width="15"/>
      {{ formattedTimestamp }}
    </div>
    <div>
      <icon-graph :height="15" :width="15"/>
      {{ value }}
    </div>
    <div v-if="comment">
      <icon-comment :height="15" :width="15"/>
      {{ comment }}
    </div>
  </div>
</template>

<script>
import { dateShort } from '@/util';
import IconCalendar from './IconCalendar.vue';
import IconComment from './IconComment.vue';
import IconGraph from './IconGraph.vue';

export default {
  name: 'IndicatorTooltip',
  components: {
    IconCalendar,
    IconComment,
    IconGraph
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
    comment: {
      type: String,
      required: false,
    },
  },
  computed: {
    formattedTimestamp() {
      return dateShort(this.timestamp);
    }
  }
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
