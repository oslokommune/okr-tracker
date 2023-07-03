<template>
  <div class="key-result-row" :class="{ compact }">
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
    compact: {
      type: Boolean,
      required: false,
      default: false,
    },
  },

  computed: {
    progressPercentage() {
      return Math.round(this.keyResult.progression * 100);
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
    display: flex;
    flex: 0 0 70%;
    flex-direction: column;
    gap: 0.5rem;
    padding-right: 1rem;
  }

  &__progress {
    display: flex;
    flex: 0 0 30%;
    gap: 1rem;
    align-items: center;

    .progress {
      flex: 0 1 80%;
    }

    span {
      flex: 1 0 auto;
      text-align: right;
    }
  }

  &.compact .key-result-row__progress .progress {
    flex-basis: 80%;

    @include bp('tablet-up') {
      flex-basis: 70%;
    }
  }
}
</style>
