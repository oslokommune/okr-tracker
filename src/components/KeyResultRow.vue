<template>
  <div class="keyResult" :class="{ expanded: view !== 'compact' }">
    <router-link
      class="keyResult__info keyResult__info--header"
      :class="{ 'keyResult__info--expanded': view !== 'compact' }"
      :to="{ name: 'KeyResultHome', params: { keyResultId: keyRow.id } }"
    >
      <h3 class="title-3">{{ keyRow.name }}</h3>
      <span v-if="view !== 'compact'" class="keyResult__description">{{ keyRow.description }}</span>
    </router-link>

    <div v-if="keyRow.auto" v-tooltip="$t('keyResult.automatic')" class="keyResult__auto fa fa-magic"></div>

    <div v-if="view === 'compact'" class="keyResult__progress">
      <progress-bar :progression="keyRow.progression" />
    </div>

    <div v-else class="keyResult__progress" :class="{ 'keyResult__progress--expanded': view !== 'compact' }">
      <div
        class="progression"
        v-tooltip="allowedToEditPeriod ? false : 'Not allowed to edit'"
        :class="{ 'progression--disabled': !allowedToEditPeriod }"
        @click="openModal"
      >
        <div class="progression__done progression__done--keyResultRow">
          {{ $t('progress.done', { progress: percentage(keyResult.progression) }) }}
        </div>
        <div class="progression__remaining progression__remaining--keyResultRow">
          {{ remainingKeyResultProgress(keyResult) }}
        </div>
        <div class="progress-bar__container progress-bar__container--keyResultRow">
          <div class="progress-bar" :style="{ width: percentage(keyResult.progression) }"></div>
        </div>
        <div class="progression__total--keyResultRow">
          {{ keyResult.currentValue ? format('.1~f')(keyResult.currentValue) : 0 }} / {{ keyResult.targetValue }}
        </div>
      </div>
    </div>

    <modal v-if="isOpen" :key-result="keyRow" :unsaved-values="changed" @close="isOpen = false"></modal>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import { format } from 'd3-format';
import { remainingKeyResultProgress } from '@/util';

export default {
  name: 'KeyResultRow',

  components: {
    ProgressBar: () => import('@/components/ProgressBar.vue'),
    Modal: () => import('@/components/KeyResultModal.vue'),
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
    format,

    percentage(value) {
      return format('.0%')(value);
    },

    remainingKeyResultProgress,

    openModal() {
      if (this.allowedToEditPeriod) {
        this.isOpen = true;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@use '@/styles/griddle/mixins' as *;
@use '@/styles/progressbar';

.keyResult {
  display: grid;
  grid-template-columns: 1fr auto;
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
  padding: 0.5rem 2rem 0 2rem;
  background-color: var(--color-secondary-light);

  &:hover {
    color: var(--color-text-secondary);
    background-color: var(--color-hover);
  }
}

.keyResult__info--expanded {
  padding: 2rem 3rem 2rem 2rem;
}

.keyResult__info--header {
  height: 100%;
  color: var(--color-text);
  text-decoration: none;
}

.keyResult__progress {
  grid-column: 2;
  align-self: center;
  width: 100px;
  padding: 0.5rem 1.75rem;

  @media screen and (min-width: bp(s)) {
    width: 320px;
  }
}

.keyResult__progress--expanded {
  align-self: auto;

  @media screen and (max-width: bp(s)) {
    width: 100%;
  }

  &:hover {
    background-color: var(--color-hover);
    cursor: pointer;
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
  grid-area: 3 / 1 / 4 / 2;
}

.progression__done--keyResultRow {
  grid-area: 1 / 1 / 2 / 2;
}

.progression__remaining--keyResultRow {
  grid-area: 2 / 1 / 3 / 2;
}

.progression__total--keyResultRow {
  grid-area: 4 / 1 / 5 / 2;
  justify-self: end;
  padding-top: 0.5rem;
}

.progression--disabled {
  cursor: not-allowed;
}
</style>
