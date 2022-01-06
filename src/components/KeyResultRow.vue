<template>
  <div class="keyResult" :class="{ 'keyResult--isDetailedView': isDetailedView }">
    <router-link
      :to="{ name: 'KeyResultHome', params: { keyResultId: keyRow.id } }"
      class="keyResult__infoLink"
      :class="{ 'keyResult__infoLink--isDetailedView': isDetailedView }"
    >
      <h3 class="keyResult__title">{{ keyRow.name }}</h3>
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
      <widget-key-result-progress-details v-if="isDetailedView" :key-result="keyResult" />
      <progress-bar
        :progression="keyRow.progression"
        :is-compact="!isDetailedView"
        class="keyResult__progressBar"
        :class="{ 'keyResult__progressBar--isDetailedView': isDetailedView }"
      />
      <div v-if="isDetailedView" class="keyResult__progressionSummary">
        {{ keyResult.currentValue ? format('.1~f')(keyResult.currentValue) : 0 }} / {{ keyResult.targetValue }}
      </div>
    </div>

    <modal v-if="isOpen" :key-result="keyRow" :unsaved-values="changed" @close="isOpen = false"></modal>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import { format } from 'd3-format';

export default {
  name: 'KeyResultRow',

  components: {
    ProgressBar: () => import('@/components/ProgressBar.vue'),
    Modal: () => import('@/components/KeyResultModal.vue'),
    WidgetKeyResultProgressDetails: () => import('@/components/widgets/WidgetKeyResultProgressDetails.vue'),
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
  },
};
</script>

<style lang="scss" scoped>
@use '@/styles/progressbar';

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
    background-color: var(--color-secondary-light);

    &--isDetailedView {
      padding: 1.5rem;
    }

    &:hover {
      color: var(--color-text-secondary);
      background-color: var(--color-hover);
    }
  }

  &__title {
    font-weight: 500;
    font-size: 1rem;
  }

  &__description {
    margin: 1rem 0;
    font-size: 1rem;
  }

  &__progress {
    display: flex;
    flex: 0 0 25%;
    flex-direction: column;
    justify-content: center;
    padding: 0.5rem 1.5rem;
    color: var(--color-text-secondary);
    background: var(--color-primary);
    cursor: pointer;

    &:hover {
      background-color: var(--color-hover);
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
    color: #f9f9f9;
    font-weight: 300;
    text-align: right;
  }
}
</style>
