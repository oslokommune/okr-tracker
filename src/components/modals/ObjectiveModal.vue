<template>
  <modal-wrapper
    variant="wide"
    class="objective-modal"
    :initial-focus="false"
    :click-outside="true"
    @close="$emit('close')"
  >
    <template #header>
      <router-link
        :to="{ name: 'ObjectiveHome', params: { objectiveId: objective.id } }"
        class="objective-modal__title pkt-link"
      >
        {{ objective.name }}
        <pkt-icon class="pkt-link__icon" name="chevron-right" />
      </router-link>
    </template>

    <p v-if="objective.description" class="mb-size-16">
      {{ objective.description }}
    </p>

    <div class="objective-modal__progression mb-size-16">
      <progress-bar :is-compact="false" :progression="objective.progression * 100" />
      <span class="pkt-txt-20-medium">{{ percent(objective.progression) }}</span>
    </div>

    <key-results-list
      v-if="objective.keyResults.length"
      :key-results="objective.keyResults"
      :compact="true"
    />

    <empty-state
      v-else
      :heading="$t('empty.noKeyResults.heading')"
      :body="$t('empty.noKeyResults.body')"
    />
  </modal-wrapper>
</template>

<script>
import { format } from 'd3-format';
import KeyResultsList from '@/components/KeyResultsList.vue';
import ProgressBar from '@/components/ProgressBar.vue';
import ModalWrapper from './ModalWrapper.vue';

export default {
  name: 'ObjectiveModal',

  components: {
    EmptyState: () => import('@/components/EmptyState.vue'),
    KeyResultsList,
    ModalWrapper,
    ProgressBar,
  },

  props: {
    objective: {
      type: Object,
      required: true,
    },
  },

  methods: {
    percent(value) {
      return format('.0%')(value);
    },
  },
};
</script>

<style lang="scss" scoped>
.objective-modal {
  &__title {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    text-decoration: none;
  }
  &__progression {
    display: flex;
    gap: 1rem;
    align-items: center;

    .progress {
      flex: 1;
    }
  }
}
</style>
