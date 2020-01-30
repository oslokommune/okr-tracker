<template>
  <div class="nf-card__footer foo" @click="showPretty = !showPretty">
    <div class="edited" v-tooltip.top-start="{ content: pretty, delay: { show: 400, hide: 50 } }">
      {{ showPretty ? pretty : timeString }}
    </div>
  </div>
</template>

<script>
import { timeFromNow, datePretty } from '../../../util/utils';

export default {
  name: 'NewsfeedFooter',

  data: () => ({
    timeString: null,
    showPretty: false,
  }),

  computed: {
    pretty() {
      return datePretty(this.data.timestamp.toDate());
    },
  },

  props: {
    data: {
      type: Object,
      required: true,
    },
  },

  created() {
    this.timeString = timeFromNow(this.data.timestamp.toDate());

    setInterval(() => {
      this.timeString = timeFromNow(this.data.timestamp.toDate());
    }, 15000);
  },
};
</script>
