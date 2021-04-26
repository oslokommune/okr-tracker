<template>
  <widget :widget-id="widgetId" :title="$t('weight.heading')" icon="balance-scale" :open="false">
    {{ $t('weight.keyresFor', { name: activeKeyResult.objective.name }) }}
    <div class="scales">
      <router-link
        v-for="{ id, weight, active, name } in weights"
        :key="id"
        v-tooltip.bottom="name"
        :to="{ name: 'KeyResultHome', params: { keyResultId: id } }"
        class="bar"
        :style="{ height: getHeight(weight) }"
        :class="{ active }"
      >
        {{ weight }}
      </router-link>
    </div>
  </widget>
</template>

<script>
import { mapState } from 'vuex';
import { scaleLinear, max } from 'd3';

export default {
  name: 'WidgetKeyResultWeights',

  components: {
    Widget: () => import('./Widget.vue'),
  },

  props: {
    widgetId: {
      type: String,
      required: true,
    },
  },

  data: () => ({
    chart: null,
    scale: scaleLinear(),
  }),

  computed: {
    ...mapState(['activeKeyResult', 'keyResults']),
    weights() {
      const siblings = ({ objective }) => objective.split('/')[1] === this.activeKeyResult.objective.id;

      const processWeights = ({ weight, id, name }) => ({
        weight,
        id,
        name,
        active: this.activeKeyResult.id === id,
      });

      return this.keyResults.filter(siblings).map(processWeights);
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
  },
};
</script>

<style lang="scss" scoped>
@import '@/styles/_colors.scss';

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
  background: $color-grey-100;
  border: 1px solid $color-grey-200;

  &:hover {
    background: $color-grey-200;
  }

  &.active {
    background: var(--color-primary);
    border-color: var(--color-primary);

    &:hover {
      background: darken($color-yellow, 10%);
      border-color: darken($color-yellow, 10%);
    }
  }
}
</style>
