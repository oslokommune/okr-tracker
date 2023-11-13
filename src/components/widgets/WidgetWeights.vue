<template>
  <widget :title="$t('weight.heading')" size="small" collapsable>
    <div class="scales">
      <router-link
        v-for="{ id, weight, name } in keyResults"
        :key="id"
        v-tooltip.bottom="name"
        :to="getToLink(id)"
        class="bar"
        :style="{ height: getHeight(weight) }"
      >
        {{ weight }}
      </router-link>
    </div>
  </widget>
</template>

<script>
import { scaleLinear } from 'd3-scale';
import { max } from 'd3-array';
import { db } from '@/config/firebaseConfig';
import Widget from './WidgetWrapper.vue';

export default {
  name: 'WidgetWeights',

  components: {
    Widget,
  },

  props: {
    objective: {
      type: Object,
      required: true,
    },
  },

  data: () => ({
    chart: null,
    scale: scaleLinear(),
    keyResults: [],
  }),

  watch: {
    keyResults: {
      immediate: true,
      handler(keyResults) {
        const maxValue = max([0, max(keyResults, ({ weight }) => weight)]);
        this.scale.domain([0, maxValue]);
      },
    },
  },

  async created() {
    const objectiveRef = await db.doc(`objectives/${this.objective.id}`);
    const keyResults = await db
      .collection('keyResults')
      .where('archived', '==', false)
      .where('objective', '==', objectiveRef)
      .orderBy('name');

    this.$bind('keyResults', keyResults);
  },

  mounted() {
    if (this.$refs.svg) {
      this.init();
    }
  },

  methods: {
    getHeight(weight) {
      return `${this.scale(weight) * 100}%`;
    },

    getToLink(id) {
      return { name: 'KeyResultHome', params: { keyResultId: id } };
    },
  },
};
</script>

<style lang="scss" scoped>
.scales {
  position: relative;
  display: grid;
  grid-gap: 0.5rem;
  grid-template-columns: repeat(auto-fit, minmax(1rem, 3rem));
  width: 100%;
  height: 6rem;
  margin-top: 1rem;
}

.bar {
  display: flex;
  flex-direction: column;
  align-self: end;
  justify-content: flex-end;
  padding-bottom: 0.15rem;
  color: var(--color-text);
  font-weight: 500;
  font-size: 0.85rem;
  text-align: center;
  text-decoration: none;
  background: var(--color-secondary-light);
  border: 1px solid var(--color-secondary-light);

  &:hover {
    color: var(--color-text-secondary);
    background: var(--color-hover);
    border: 1px solid var(--color-hover);
  }
}
</style>
