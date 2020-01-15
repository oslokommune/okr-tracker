<template>
  <div class="objective">
    <div class="item">
      <div class="icon" :class="`fas fa-fw fa-${objective.icon}`"></div>
      <div class="item__text">
        <h3 class="title-3">{{ objective.objective_title }}</h3>
        <p>{{ objective.objective_body }}</p>
      </div>
    </div>
    <div class="item__bars">
      <progressbar v-for="child in objective.children" :keyres="child" compressed :key="child.id"></progressbar>
    </div>
  </div>
</template>

<script>
import Progressbar from './ProgressBar.vue';

export default {
  components: {
    Progressbar,
  },
  props: {
    objective: {
      type: Object,
      required: true,
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../styles/colors';

.objective {
  max-width: 400px;
  margin-top: 1rem;
}

.item {
  display: grid;
  grid-gap: 1rem;
  grid-template-areas: 'icon text';
  grid-template-rows: 8em;
  grid-template-columns: 4rem 1fr;
  height: 100%;
  margin-bottom: 1rem;
  padding-right: 1rem;

  &__text {
    grid-area: text;
    padding-right: 1.5rem;

    h3 {
      margin: 0 0 0.25rem;
    }
  }

  &__bars {
    grid-area: bars;
    align-self: start;
    margin-bottom: 2em;
  }
}

.icon {
  display: flex;
  grid-area: icon;
  align-content: center;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  font-size: 1.75rem;
  background: $color-yellow;

  svg {
    width: 100%;
    fill: $color-purple;
  }
}
</style>
