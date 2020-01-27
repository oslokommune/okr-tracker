<template>
  <div class="nf-card__footer" :title="pretty" @click="showPretty = !showPretty">
    <div class="edited">
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
