<template>
  <div class="grid" v-if="objectives.length">
    <template v-for="objective in objectives">
      <template v-for="keyres in objective.keyResults">
        <div class="outer" :key="keyres.id">
          <div class="inner" :style="getWidth(keyres)"></div>
        </div>
      </template>
    </template>
  </div>
</template>

<script>
import { scaleLinear } from 'd3';
import { serializeList } from '@/db/db';

export default {
  data: () => ({
    unsubscribe: null,
    currentPeriod: null,
    keyResults: [],
    objectives: [],
  }),

  props: {
    product: {
      type: Object,
      required: true,
    },
  },

  methods: {
    getWidth(keyres) {
      const scale = scaleLinear().clamp(true).domain([keyres.startValue, keyres.targetValue]);
      const progress = scale(keyres.currentValue) || 0;
      const purple = '#292858';
      const yellow = '#f8c66b';

      const color = progress === 1 ? purple : yellow;

      return `width: ${progress * 100}%; backgroundColor: ${color};`;
    },

    getObjectives() {
      if (!this.currentPeriod) return;
      this.unsubscribe = this.product.ref
        .collection('objectives')
        .where('archived', '==', false)
        .where('period', '==', this.currentPeriod.ref)
        .onSnapshot(snapshot => {
          this.objectives = snapshot.docs.map(d => ({ ref: d.ref, keyResults: [] }));
        });
    },
  },

  watch: {
    product() {
      if (this.unsubscribe) this.unsubscribe();
      this.getObjectives();
    },

    async currentPeriod() {
      this.getObjectives();
    },

    objectives(objectives) {
      objectives.forEach(async objective => {
        objective.ref
          .collection('keyResults')
          .where('archived', '==', false)
          .onSnapshot(snapshot => {
            objective.keyResults = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
          });
      });
    },
  },

  beforeDestroy() {
    if (this.unsubscribe) this.unsubscribe();
  },

  async created() {
    this.getObjectives();

    // Find the period in which is currently active
    const now = new Date();
    this.currentPeriod = await this.product.ref
      .collection('periods')
      .get()
      .then(serializeList)
      .then(docs => docs.filter(doc => doc.startDate.toDate() < now && doc.endDate.toDate() > now))
      .then(docs => (docs?.length ? docs[0] : false));
  },
};
</script>

<style lang="scss" scoped>
@import '../../../styles/_colors.scss';

.grid {
  display: grid;
  grid-gap: 6px;

  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
}

.outer {
  width: 100%;
  height: 6px;
  overflow: hidden;
  background: rgba(black, 0.075);
  border-radius: 3px;
}

.inner {
  position: relative;
  height: 100%;
}
</style>
