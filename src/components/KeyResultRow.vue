<template>
  <div class="keyResult">
    <router-link
      :to="{ name: 'KeyResultHome', params: { keyResultId: keyResult.id } }"
      class="keyResult__infoLink"
    >
      <h4 class="keyResult__title title-3">{{ keyResult.name }}</h4>
      <p v-if="keyResult.description" class="keyResult__description">
        {{ keyResult.description }}
      </p>
    </router-link>

    <div
      v-tooltip="allowedToEditPeriod ? false : 'Not allowed to edit'"
      class="keyResult__progress"
      :class="{
        'keyResult__progress--isDisabled': !allowedToEditPeriod,
      }"
      @click="openModal"
    >
      <progress-bar :progression="progressPercentage" class="keyResult__progressBar" />
      {{ progressPercentage }}%
    </div>

    <key-result-modal
      v-if="isOpen"
      :key-result="keyResult"
      :unsaved-values="changed"
      @close="isOpen = false"
    />
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import { format } from 'd3-format';
import { numberLocale } from '@/util';

export default {
  name: 'KeyResultRow',

  components: {
    ProgressBar: () => import('@/components/ProgressBar.vue'),
    KeyResultModal: () => import('@/components/modals/KeyResultModal.vue'),
  },

  props: {
    keyResult: {
      type: Object,
      required: true,
    },
  },

  data: () => ({
    isOpen: false,
    changed: false,
  }),

  computed: {
    ...mapState(['user']),
    ...mapGetters(['hasEditRights', 'allowedToEditPeriod']),

    progressPercentage() {
      return this.keyResult.progression * 100;
    },
  },

  methods: {
    format,
    openModal() {
      if (this.allowedToEditPeriod) {
        this.isOpen = true;
      }
    },
    formatLargeNumber(value) {
      return numberLocale.format(',')(value);
    },
  },
};
</script>

<style lang="scss" scoped>
@use '@/styles/typography';

.keyResult {
  @media screen and (min-width: bp(s)) {
    display: flex;
  }

  &__infoLink {
    display: block;
    flex: 1;
    padding: 1.5rem;
    color: var(--color-text);
    text-decoration: none;
    background-color: var(--color-gray-light);

    &:hover {
      color: var(--color-white);
      background-color: var(--color-hover);
    }
  }

  &__title {
    margin-bottom: 0;
    font-weight: 400;
  }

  &__description {
    margin: 0.5rem 0 0;
    font-size: typography.$font-size-1;
    line-height: 1.25rem;
  }

  &__progress {
    display: flex;
    flex: 0 0 100%;
    gap: 0.75rem;
    align-items: center;
    padding: 1.5rem;
    font-weight: 500;
    background-color: var(--color-gray-light);
    cursor: pointer;

    &:hover {
      color: var(--color-white);
      background-color: var(--color-hover);

      .keyResultProgressDetails {
        color: inherit;
      }
    }

    @media screen and (min-width: bp(s)) {
      flex: 0 0 20rem;
    }

    &--isDisabled {
      cursor: not-allowed;
    }

    .progress {
      flex: 1 1 auto;
    }
  }
}
</style>
