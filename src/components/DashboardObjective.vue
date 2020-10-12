<template>
  <div class="objective">
    <div class="objective__head">
      <i class="objective__icon fa fa-fw fa-trophy"></i>
      <div class="objective__name">
        {{ objective.name }}
      </div>
    </div>

    <!-- List key results for objective -->
    <div class="key-result panel" v-for="keyres in objective.keyResults" :key="keyres.id">
      <div class="key-result__description">
        {{ keyres.description }}
      </div>
      <div class="key-result__progress">
        <dashboard-progress-bar :keyres="keyres" :darkmode="true"></dashboard-progress-bar>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DashboardObjective',

  components: {
    DashboardProgressBar: () => import('@/components/DashboardProgressBar.vue'),
  },

  data: () => ({
    progression: null,
  }),

  props: {
    objective: {
      type: Object,
      required: true,
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/styles/_colors';

.objective {
  display: grid;
  grid-gap: 1em;
  grid-row: 1 / span 6;
  grid-template-rows: repeat(6, 1fr);
  justify-content: center;
  width: 100%;
  margin: 0;
  font-size: 0.9em;

  &__head {
    display: grid;
    grid-gap: 0.5em;
    grid-template-rows: 2.5em auto;
    align-content: center;
    text-align: center;
  }

  &__icon {
    display: flex;
    grid-row: 1;
    align-items: center;
    align-self: end;
    justify-content: center;
    justify-self: center;
    width: 2.5em;
    height: 2.5em;
    color: $color-purple;
    background: $color-yellow;
  }

  &__name {
    grid-row: 2;
    font-weight: 500;
    font-size: 1.2em;
  }

  &__tag {
    display: inline-block;
    padding: 0.25em 0.5em;
    color: $color-purple;
    font-weight: 500;
    background: white;
  }

  &__key-results {
    grid-row: 3;
  }
}

.panel {
  height: 100%;
  padding: 1em;
  background: rgba(black, 0.35);
  border-radius: 0.15em;

  &__header {
    margin-bottom: 0.5em;
    padding-bottom: 0.5em;
    color: $color-yellow;
    font-weight: 500;
    border-bottom: 1px solid rgba(white, 0.1);

    > .fa {
      margin-right: 0.5em;
    }
  }
}

.key-result {
  display: grid;
  grid-gap: 0.5em;
  grid-row: auto 3rem;
  grid-column: 1fr;
  padding-bottom: 0.5em;
  color: rgba(white, 0.85);
  font-weight: 300;

  &__progress {
    align-self: end;
    justify-content: end;
    // outline: 1px solid green;
  }
}
</style>
