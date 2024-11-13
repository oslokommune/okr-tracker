<script setup>
import { watch } from 'vue';
import { scaleLinear } from 'd3-scale';
import { max } from 'd3-array';
import WidgetWrapper from './WidgetWrapper.vue';

const props = defineProps({
  objective: {
    type: Object,
    required: true,
  },
  keyResults: {
    type: Array,
    required: true,
  },
});

const scale = scaleLinear();

watch(
  props.keyResults,
  (keyResults) => {
    const maxValue = max([0, max(keyResults, ({ weight }) => weight)]);
    scale.domain([0, maxValue]);
  },
  { immediate: true }
);

function getHeight(weight) {
  return `${this.scale(weight) * 100}%`;
}

function getKeyResultRoute(id) {
  return { name: 'KeyResultHome', params: { keyResultId: id } };
}
</script>

<template>
  <WidgetWrapper :title="$t('weight.heading')" size="small" collapsable>
    <div class="scales">
      <RouterLink
        v-for="{ id, weight, name } in keyResults"
        :key="id"
        v-tooltip.bottom="name"
        :to="getKeyResultRoute(id)"
        class="bar"
        :style="{ height: getHeight(weight) }"
      >
        {{ weight }}
      </RouterLink>
    </div>
  </WidgetWrapper>
</template>

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
