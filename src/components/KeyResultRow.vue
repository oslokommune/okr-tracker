<template>
  <div class="keyResult" :class="{ expanded: view !== 'compact' }">
    <router-link class="keyResult__info" :to="{ name: 'KeyResultHome', params: { keyResultId: keyRow.id } }">
      <h3>{{ keyRow.name }}</h3>
      <span v-if="view !== 'compact'" class="keyResult__description">{{ keyRow.description }}</span>
    </router-link>

    <div v-if="keyRow.auto" v-tooltip="$t('keyResult.automatic')" class="keyResult__auto fa fa-magic"></div>

    <div class="keyResult__progress">
      <progress-bar v-if="view === 'compact'" class="keyResult__progression" :progression="keyRow.progression" />

      <progress-bar-expanded v-else class="keyResult__progression" :key-result="keyRow" />

      <form
        v-if="view !== 'compact' && hasEditRights && !keyRow.auto"
        class="keyResult__form"
        @submit.prevent="isOpen = true"
      >
        <label class="keyResult__label">
          <input
            v-model.number="keyRow.currentValue"
            v-tooltip="$t('tooltip.keyResultValue')"
            class="keyResult__input"
            type="number"
            step="any"
            @input="changed = true"
          />
        </label>

        <button class="btn">{{ $t('keyResult.updateValue') }}</button>
      </form>
    </div>

    <modal v-if="isOpen" :key-result="keyRow" @close="isOpen = false" :unsavedValues="changed"></modal>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';

export default {
  name: 'KeyResultRow',

  components: {
    ProgressBar: () => import('@/components/ProgressBar.vue'),
    ProgressBarExpanded: () => import('@/components/ProgressBarExpanded.vue'),
    Modal: () => import('@/components/Modal.vue'),
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
    ...mapState(['user', 'theme']),
    ...mapGetters(['hasEditRights']),
    view() {
      if (this.forceExpanded) return 'expanded';
      return this.user.preferences.view;
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
};
</script>

<style lang="scss" scoped>
@use '@/styles/griddle/mixins' as *;

.keyResult {
  display: grid;
  grid-row-gap: 0.5rem;
  grid-template-columns: 1fr span(3, span(7));
  background-color: var(--color-primary);

  &.expanded {
    grid-template-columns: 1fr span(3, span(7));
  }
}

.keyResult__info {
  grid-column: 1;
  padding: 0.5rem 1.75rem;
  color: var(--color-grey-800);
  text-decoration: none;
  background-color: var(--color-secondary-light);
}

.keyResult__progress {
  grid-column: 2;
  padding: 0.5rem 1.75rem;
  align-self: center;
}

.keyResult__auto {
  width: auto;
  height: 100%;
  margin-right: 0.5rem;
  text-align: center;
  opacity: 0.5;
}

.keyResult__description {
  margin-top: 0.5rem;
  font-size: 0.8rem;
}

.keyResult__form {
  display: flex;
  margin-top: 1rem;
  margin-bottom: 1rem;
}

.keyResult__label {
  margin-right: 0.5rem;
}

.keyResult__input {
  background-color: var(--color-white);
}
</style>
