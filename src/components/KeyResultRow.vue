<template>
  <div class="keyResult" :class="{ 'keyResult--isDetailedView': isDetailedView }">
    <router-link
      :to="{ name: 'KeyResultHome', params: { keyResultId: keyRow.id } }"
      class="keyResult__infoLink"
      :class="{ 'keyResult__infoLink--isDetailedView': isDetailedView }"
    >
      <h4 class="keyResult__title title-3">{{ keyRow.name }}</h4>
      <p v-if="isDetailedView" class="keyResult__description">{{ keyRow.description }}</p>
    </router-link>

    <div
      v-tooltip="allowedToEditPeriod ? false : 'Not allowed to edit'"
      class="keyResult__progress"
      :class="{
        'keyResult__progress--isDetailedView': isDetailedView,
        'keyResult__progress--isDisabled': !allowedToEditPeriod,
      }"
      @click="openModal"
    >
      <key-result-progress-details
        v-if="isDetailedView"
        :progress-details="progressDetails"
        :unit="keyRow.unit"
      />
      <progress-bar
        :progression="progressDetails.percentageCompleted"
        :is-compact="!isDetailedView"
        class="keyResult__progressBar"
        :class="{ 'keyResult__progressBar--isDetailedView': isDetailedView }"
      />
      <div v-if="isDetailedView" class="keyResult__progressionSummary">
        {{ progressDetails.formattedTotalCompletedTasks }} /
        {{ progressDetails.formattedTotalNumberOfTasks }}
      </div>
    </div>

    <key-result-modal
      v-if="isOpen"
      :key-result="keyRow"
      :unsaved-values="changed"
      @close="isOpen = false"
    />
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import { format } from 'd3-format';
import { numberLocale } from '@/util';
import { getKeyResultProgressDetails } from '../util/keyResultProgress';

export default {
  name: 'KeyResultRow',

  components: {
    ProgressBar: () => import('@/components/ProgressBar.vue'),
    KeyResultModal: () => import('@/components/modals/KeyResultModal.vue'),
    KeyResultProgressDetails: () => import('@/components/KeyResultProgressDetails.vue'),
  },

  props: {
    keyResult: {
      type: Object,
      required: true,
    },
    forceExpanded: {
      type: Boolean,
      required: false,
      default: false,
    },
  },

  data: () => ({
    keyRow: null,
    isOpen: false,
    changed: false,
  }),

  computed: {
    ...mapState(['user']),
    ...mapGetters(['hasEditRights', 'allowedToEditPeriod']),
    isDetailedView() {
      return this.forceExpanded || this.user.preferences.view === 'details';
    },
    progressDetails() {
      return getKeyResultProgressDetails(this.keyResult);
    },
  },

  watch: {
    keyResult: {
      immediate: true,
      handler() {
        this.keyRow = this.keyResult;
      },
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
  background: white;

  @media screen and (min-width: bp(s)) {
    display: flex;
  }

  &__infoLink {
    display: block;
    flex: 1;
    padding: 0.5rem 1.5rem;
    color: var(--color-text);
    text-decoration: none;
    background-color: var(--color-gray-light);

    &--isDetailedView {
      padding: 1.5rem;
    }

    &:hover {
      color: var(--color-white);
      background-color: var(--color-hover);
    }
  }

  &__title {
    margin-bottom: 0;
  }

  &__description {
    margin: 0.5rem 0;
    font-size: typography.$font-size-1;
    line-height: 1.25rem;
  }

  &__progress {
    display: flex;
    flex: 0 0 25%;
    flex-direction: column;
    justify-content: center;
    padding: 0.5rem 1.5rem;
    background-color: var(--color-gray-light);
    cursor: pointer;

    &:hover {
      color: var(--color-white);
      background-color: var(--color-hover);

      .keyResult__progressionSummary,
      .keyResultProgressDetails {
        color: inherit;
      }
    }

    @media screen and (min-width: bp(s)) {
      flex: 0 0 20rem;
    }

    &--isDetailedView {
      padding: 1.5rem;
    }

    &--isDisabled {
      cursor: not-allowed;
    }
  }

  &__progressInfoText {
    margin-bottom: 0.25rem;
  }

  &__progressBar--isDetailedView {
    margin: 1rem 0 0.5rem;
  }

  &__progressionSummary {
    color: var(--color-blue-dark);
    font-weight: 300;
    text-align: right;
  }
}
</style>
