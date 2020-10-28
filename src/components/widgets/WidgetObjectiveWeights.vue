<template>
  <Widget :widget-id="widgetId" :title="$t('weight.heading')" icon="balance-scale" :open="false">
    {{ $t('weight.keyresFor', { name: activeObjective.period.name }) }}
    <div class="scales">
      <router-link
        :to="{ params: { objectiveId: id } }"
        class="bar"
        v-for="{ id, weight, active, name } in weights"
        :key="id"
        :style="{ height: getHeight(weight) }"
        :class="{ active }"
        v-tooltip.bottom="name"
      >
        {{ weight }}
      </router-link>
    </div>
  </Widget>
</template>

<script>
import { mapState } from 'vuex';
import { scaleLinear, max } from 'd3';
import Widget from './Widget.vue';

export default {
  name: 'WidgetObjectiveWeights',

  data: () => ({
    chart: null,
    scale: scaleLinear(),
  }),

  computed: {
    ...mapState(['activeObjective', 'objectives']),
    weights() {
      const siblings = ({ period }) => period.split('/')[1] === this.activeObjective.period.id;

      const processWeights = ({ weight, id, name }) => ({
        weight,
        id,
        name,
        active: this.activeObjective.id === id,
      });

      return this.objectives.filter(siblings).map(processWeights);
    },
  },

  props: {
    widgetId: {
      type: String,
      required: true,
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

  components: {
    Widget,
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
  color: $color-purple;
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
    background: $color-yellow;
    border-color: $color-yellow;

    &:hover {
      background: darken($color-yellow, 10%);
      border-color: darken($color-yellow, 10%);
    }
  }
}
</style>
