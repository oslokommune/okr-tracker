<template>
  <div class="objective">
    <div class="item">
      <div class="icon" :class="`fas fa-fw fa-${objective.icon}`"></div>
      <div class="item__text">
        <h3 class="title-3">
          {{ objective.name }}
          <span v-if="objective.progression">({{ Math.round(objective.progression * 100) }}%)</span>
        </h3>
        <p>{{ objective.description }}</p>
        <p></p>

        <div class="section content content--padding">
          <h4 class="title-4">Nøkkelresultater</h4>
          <div v-if="!keyResults.length">{{ $t('objective.emptyKeyres') }}</div>
          <TheKeyResult v-for="keyres in keyResults" :key="keyres.id" :keyres="keyres"></TheKeyResult>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { serializeDocument } from '@/db/db';
import TheKeyResult from '@/components/KeyRes/TheKeyResult.vue';

export default {
  name: 'TheObjective',

  data: () => ({
    keyResults: [],
    unsubscribe: null,
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

  beforeDestroy() {
    if (this.unsubscribe) this.unsubscribe();
  },

  mounted() {
    this.unsubscribe = this.objective.ref
      .collection('keyResults')
      .where('archived', '==', false)
      .onSnapshot(async snapshot => {
        this.keyResults = snapshot.docs.map(serializeDocument);
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

  @media screen and (min-width: 768px) {
    padding-right: 1rem;
  }

  &__text {
    grid-area: text;
    padding-right: 0rem;

    @media screen and (min-width: 480px) {
      padding-right: 1.5rem;
    }

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
