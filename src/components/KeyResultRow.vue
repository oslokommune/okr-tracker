<template>
  <div class="keyResult" :class="{ expanded: view !== 'compact' }">
    <router-link class="keyResult__name" :to="{ name: 'KeyResultHome', params: { keyResultId: keyRow.id } }">
      <div>{{ keyRow.name }}</div>
      <div v-if="view !== 'compact'" class="keyResult__description">{{ keyRow.description }}</div>
    </router-link>

    <div v-if="keyRow.auto" v-tooltip="$t('keyres.automatic')" class="keyResult__auto fa fa-magic"></div>

    <progress-bar v-if="view === 'compact'" class="keyResult__progression" :progression="keyRow.progression" />

    <progress-bar-expanded v-else class="keyResult__progression" :key-result="keyRow" />

    <form
      v-if="view !== 'compact' && hasEditRights && !keyRow.auto"
      class="keyResult__form"
      @submit.prevent="isOpen = true"
    >
      <label class="keyResult__input">
        <input v-model.number="keyRow.currentValue" v-tooltip="$t('tooltip.keyresValue')" type="number" step="any" @input="changed = true"/>
      </label>

      <button class="btn">{{ $t('keyres.updateValue') }}</button>
    </form>

    <modal v-if="isOpen" :keyres="keyRow" @close="isOpen = false" :unsavedValues="changed"></modal>
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
    ...mapState(['user']),
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
  grid-gap: 0.25rem;
  grid-template-columns: 2rem 1fr span(1, 0, span(6));
  align-items: baseline;
  padding: 0.5rem 0.75rem;

  &.expanded {
    grid-template-columns: 2rem 1fr span(2, 0, span(6));
    padding: 1rem 0.75rem;
  }
}

.keyResult__icon {
  grid-column: 1;
}

.keyResult__name {
  grid-column: 2;
  color: var(--color-grey-800);
  text-decoration: none;

  @media screen and (min-width: bp(m)) {
    padding-right: 1rem;
  }
}

.keyResult__progression {
  grid-column: 3;
}

.keyResult__auto {
  grid-row: 1;
  grid-column: 1;
  width: auto;
  height: 100%;
  margin-right: 0.5rem;
  text-align: center;
  opacity: 0.5;
}

.keyResult__description {
  grid-row: 2;
  grid-column: 2;
  align-self: start;
  margin-top: 0.5rem;
  font-size: 0.8rem;

  @media screen and (min-width: bp(m)) {
    padding-right: 1rem;
  }
}

.keyResult__form {
  display: flex;
  grid-row: 3;
  grid-column: 2 / 4;
  margin-top: 1rem;
  margin-bottom: 1.5rem;

  @media screen and (min-width: bp(m)) {
    grid-row: 3;
    grid-column: 2;
  }

  @media screen and (min-width: bp(m)) {
    grid-row: 2;
    grid-column: 3;
  }
}

.keyResult__input {
  margin-right: 0.5rem;
}
</style>
