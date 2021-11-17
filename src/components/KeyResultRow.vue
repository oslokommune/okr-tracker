<template>
  <div class="keyResult" :class="{ expanded: view !== 'compact' }">
    <div class="keyResult__info">
      <router-link class="keyResult__info--header" :to="{ name: 'KeyResultHome', params: { keyResultId: keyRow.id } }">
        <h3 class="title-3">{{ keyRow.name }}</h3>
        <span v-if="view !== 'compact'" class="keyResult__description">{{ keyRow.description }}</span>
      </router-link>
    </div>

    <div v-if="keyRow.auto" v-tooltip="$t('keyResult.automatic')" class="keyResult__auto fa fa-magic"></div>

    <div v-if="view === 'compact'" class="keyResult__progress">
      <progress-bar :progression="keyRow.progression" />
    </div>

    <div v-else class="keyResult__progress" :class="{ expanded: view !== 'compact' }">
      <div class="progression">
        <div class="progression__done progression__done--keyResultRow">
          {{ $t('progress.done', { progress: percentage(keyResult.progression) }) }}
        </div>
        <div class="progression__remaining progression__remaining--keyResultRow">
          {{ $t('progress.remaining', { progress: percentage(keyResult.progression) }) }}
        </div>
        <button class="btn progression__total progression__total--keyResultRow" @click="isOpen = true">
          <span class="progression__total--current">{{ keyResult.currentValue || 0 }}</span>
          <span class="progression__total--target">/{{ keyResult.targetValue }}</span>
        </button>
        <div class="progress-bar__container progress-bar__container--keyResultRow">
          <div class="progress-bar" :style="{ width: percentage(keyResult.progression) }"></div>
        </div>
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

  methods: {
    percentage(value) {
      return format('.0%')(value);
    },

    remaining() {
      if (this.keyResult.targetValue < this.keyResult.startValue) {
        if (!this.keyResult.currentValue) {
          return this.keyResult.startValue;
        }
        return this.keyResult.startValue - this.keyResult.currentValue;
      }
      if (!this.keyResult.currentValue) {
        return this.keyResult.targetValue;
      }
      return this.keyResult.targetValue - this.keyResult.currentValue;
    },
  },
};
</script>

<style lang="scss" scoped>
@use '@/styles/griddle/mixins' as *;
@use '@/styles/progressbar';

.keyResult {
  display: grid;
  grid-row: auto;
  grid-row-gap: 0.5rem;
  grid-template-columns: 1fr span(4, span(8));
  background-color: var(--color-primary);

  &.expanded {
    @media screen and (max-width: bp(s)) {
      display: flex;
      flex-direction: column;
      grid-row-gap: 0;
    }
  }
}

.keyResult__info {
  grid-column: 1;
  padding: 0.5rem 1.75rem 0 1.75rem;
  background-color: var(--color-secondary-light);

  &:hover {
    background-color: var(--color-secondary);
  }
}

.keyResult__info--header {
  display: grid;
  align-items: center;
  height: 100%;
  color: var(--color-grey-800);
  text-decoration: none;
}

.keyResult__progress {
  grid-column: 2;
  align-self: center;
  padding: 0.5rem 1.75rem;

  @media screen and (max-width: bp(s)) {
    align-self: auto;
  }
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
  margin-bottom: 0.5rem;
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

.progression {
  display: grid;
  grid-row-gap: 0;
  grid-column-gap: 0;
  grid-template-rows: auto auto auto;
  grid-template-columns: 1fr auto;
  padding: 1.5rem 0;
  color: var(--color-text-secondary);
}

.progress-bar__container--keyResultRow {
  grid-area: 3 / 1 / 4 / 3;
}

.progression__done--keyResultRow {
  grid-area: 1 / 1 / 2 / 3;
}

.progression__remaining--keyResultRow {
  grid-area: 2 / 1 / 3 / 3;
}

.progression__total--keyResultRow {
  grid-area: 1 / 2 / 3 / 3;
  padding: 0.5rem 1rem;

  &:hover {
    background-color: var(--color-secondary);
  }
}
</style>
