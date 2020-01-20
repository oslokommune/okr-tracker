<template>
  <div class="objective">
    <div class="item">
      <div class="icon" :class="`fas fa-fw fa-${objective.icon}`"></div>
      <div class="item__text">
        <h3 class="title-3">
          {{ objective.objective_title }}
          <span v-if="objective.progression">({{ objective.progression * 100 }}%)</span>
        </h3>
        <p>{{ objective.objective_body }}</p>
        <p></p>

        <div class="section content content--padding">
          <h4 class="title-4">Nøkkelresultater</h4>
          <TheKeyResult v-for="keyres in key_results" :key="keyres.id" :keyres="keyres"></TheKeyResult>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { serializeDocument } from '../../util/db';
import TheKeyResult from '@/components/KeyRes/TheKeyResult.vue';

export default {
  data: () => ({
    key_results: [],
  }),
  props: {
    objective: {
      type: Object,
      required: true,
    },
  },

  components: {
    TheKeyResult,
  },

  mounted() {
    this.objective.ref
      .collection('key_results')
      .where('archived', '==', false)
      .onSnapshot(async snapshot => {
        this.key_results = snapshot.docs.map(serializeDocument);
      });
  },
};
</script>

<style lang="scss">
@import '@/styles/_colors';

.objective {
  margin-bottom: 3rem;
}

.item {
  display: grid;
  grid-gap: 1rem;
  grid-template-areas: 'icon text';
  grid-template-rows: 1fr;
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

.objective--loading {
  opacity: 0;
  animation-name: pulse;
  animation-duration: 2.5s;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  animation-direction: ease-in-out;

  &:nth-of-type(n + 2) {
    animation-delay: 0.1s;
  }

  .icon {
    color: white;
    background: $color-grey-200;
  }

  .title-3 {
    display: block;
    width: 55%;
    height: 1.15rem;
    background: $color-grey-200;
    transform: translateY(0.1rem);
  }

  .loading-text {
    display: block;
    width: 90%;
    height: 0.8rem;
    background: $color-grey-200;
    transform: translateY(0.4rem);
  }
}
</style>
