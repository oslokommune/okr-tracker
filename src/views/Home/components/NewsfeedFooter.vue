<template>
  <div class="nf-card__footer">{{ timeString }} <i class="far fa-fw fa-history"></i></div>
</template>

<script>
import { timeFromNow } from '@/util/utils';

export default {
  name: 'NewsfeedFooter',

  data: () => ({
    timeString: null,
  }),

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
