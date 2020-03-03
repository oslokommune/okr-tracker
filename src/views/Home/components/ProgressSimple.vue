<template>
  <div class="progression__bar" :style="`width: ${progress * 100}%`"></div>
</template>

<script>
import { serializeDocument } from '@/db/db';

export default {
  name: 'ProgressSimple',

  data: () => ({
    progress: 0,
  }),

  props: {
    document: {
      type: Object,
      required: true,
    },
  },

  async created() {
    const now = new Date();
    const currentPeriodRef = await this.document.ref
      .collection('periods')
      .get()
      .then(snapshot => snapshot.docs.map(serializeDocument))
      .then(docs => docs.filter(doc => doc.startDate.toDate() < now && doc.endDate.toDate() > now))
      .then(docs => (docs.length ? docs[0].ref : false));

    if (!currentPeriodRef) {
      this.progress = 0;
    } else {
      currentPeriodRef.onSnapshot(snapshot => {
        this.progress = snapshot.data().progression;
      });
    }
  },
};
</script>
