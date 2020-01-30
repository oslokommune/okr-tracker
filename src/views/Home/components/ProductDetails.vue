<template>
  <div class="grid" v-if="objectives.length">
    <template v-for="objective in objectives">
      <template v-for="keyres in objective.keyResults">
        <div class="foo" :key="keyres.id">
          <div class="inner" :style="getWidth(keyres)"></div>
        </div>
      </template>
    </template>
  </div>
</template>

<script>
import { scaleLinear } from 'd3';
import { mapState } from 'vuex';

export default {
  data: () => ({
    unsubscribe: null,
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
      const scale = scaleLinear()
        .clamp(true)
        .domain([keyres.startValue, keyres.targetValue]);
      const progress = scale(keyres.currentValue) || 0;
      const purple = '#292858';
      const yellow = '#f8c66b';

      const color = progress === 1 ? purple : yellow;

      return `width: ${progress * 100}%; backgroundColor: ${color};`;
    },

    listen() {
      this.unsubscribe = this.product.ref
        .collection('objectives')
        .where('archived', '==', false)
        .onSnapshot(snapshot => {
          this.objectives = snapshot.docs.map(d => ({ ref: d.ref, keyResults: [] }));
        });
    },
  },

  computed: {
    ...mapState(['quarters']),
  },

  watch: {
    product() {
      if (this.unsubscribe) this.unsubscribe();
      this.listen();
    },

    objectives(objectives) {
      objectives.forEach(async objective => {
        const q = await objective.ref.get().then(d => d.data().quarter);
        if (q !== this.quarters[0].name) return;

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

  created() {
    this.listen();
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

.foo {
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
