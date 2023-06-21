<template>
  <div class="key-result-row">
    <router-link
      :to="{ name: 'KeyResultHome', params: { keyResultId: keyResult.id } }"
      class="key-result-row__link"
    >
      <div class="key-result-row__info">
        <h4 class="pkt-txt-16">{{ keyResult.name }}</h4>
        <p v-if="keyResult.description" class="pkt-txt-14-light">
          {{ keyResult.description }}
        </p>
      </div>

      <div class="key-result-row__progress">
        <progress-bar :progression="progressPercentage" />
        <span class="pkt-txt-16">{{ progressPercentage }}%</span>
      </div>
    </router-link>
  </div>
</template>

<script>
import { format } from 'd3-format';
import { numberLocale } from '@/util';

export default {
  name: 'KeyResultRow',

  components: {
    ProgressBar: () => import('@/components/ProgressBar.vue'),
  },

  props: {
    keyResult: {
      type: Object,
      required: true,
    },
  },

  computed: {
    progressPercentage() {
      return this.keyResult.progression * 100;
    },
  },

  methods: {
    format,

    formatLargeNumber(value) {
      return numberLocale.format(',')(value);
    },
  },
};
</script>

<style lang="scss" scoped>
@use '@oslokommune/punkt-css/dist/scss/abstracts/mixins/breakpoints' as *;

.key-result-row {
  &__link {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1.5rem;
    color: var(--color-text);
    text-decoration: none;
    background-color: var(--color-gray-light);

    &:hover {
      color: var(--color-white);
      background-color: var(--color-hover);
    }

    @include bp('tablet-up') {
      flex-direction: row;
    }
  }

  &__info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  &__progress {
    display: flex;
    flex: 0 0 100%;
    gap: 1rem;
    align-items: center;

    @include bp('tablet-up') {
      flex-basis: 20rem;
    }

    .progress {
      flex: 1 1 auto;
    }
  }
}
</style>
