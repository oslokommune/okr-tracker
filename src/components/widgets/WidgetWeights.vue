<template>
  <widget :widget-id="widgetId" :title="$t('weight.heading')">
    <div class="scales">
      <router-link
        v-for="{ id, weight, name } in weights"
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

export default {
  name: 'WidgetObjectiveWeights',

  components: {
    Widget: () => import('./Widget.vue'),
  },

  props: {
    widgetId: {
      type: String,
      required: true,
    },
    items: {
      type: Array,
      required: true,
    },
    activeItem: {
      type: Object,
      required: false,
      default: () => ({}),
    },
    type: {
      type: String,
      required: true,
    },
  },

  data: () => ({
    chart: null,
    scale: scaleLinear(),
  }),

  computed: {
    weights() {
      if (!this.activeItem) return [];

      let siblings = null;

      if (this.type === 'objective') {
        siblings = ({ period }) => period.split('/')[1] === this.activeItem.id;
      } else {
        siblings = ({ objective }) => objective.split('/')[1] === this.activeItem.id;
      }

      const processWeights = ({ weight, id, name }) => ({
        weight,
        id,
        name,
      });

      return this.items.filter(siblings).map(processWeights);
    },
  },

  watch: {
    weights: {
      immediate: true,
      handler(weights) {
        const maxValue = max([1.5, max(weights, ({ weight }) => weight)]);
        this.scale.domain([0, maxValue]);
      },
    },
  },

  mounted() {
    if (this.$refs.svg) this.init();
  },

  methods: {
    getHeight(weight) {
      return `${this.scale(weight) * 100}%`;
    },

    getToLink(id) {
      if (this.type === 'objective') {
        return { name: 'ObjectiveHome', params: { objectiveId: id } };
      }

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
  background: var(--color-secondary);
  border: 1px solid var(--color-secondary);

  &:hover {
    background: var(--color-secondary-light);
    border: 1px solid var(--color-secondary-light);
  }
}
</style>
