<template>
  <div class="objectiveProgression">
    <div class="objectiveProgression__name">{{ objective.name }}</div>
    <ul class="objectiveProgression__keyResults">
      <li
        v-for="keyResult in objectiveKeyResults"
        :key="keyResult.id"
        class="objectiveProgression__keyResult"
      >
        <span>
          {{ keyResult.name }}
        </span>
        <span>
          {{ formatProgression(keyResult.progression) }}
        </span>
      </li>
    </ul>
  </div>
</template>

<script>
import { format } from 'd3-format';
import { db } from '@/config/firebaseConfig';
import ObjectiveCollection from '../../../common/db/ObjectivesCollection';
import KeyResultCollection from '../../../common/db/KeyResultsCollection';

const objectiveCollection = new ObjectiveCollection(db);
const keyResultCollection = new KeyResultCollection(db);

export default {
  name: 'ObjectiveProgression',

  props: {
    objective: {
      type: Object,
      required: true,
    },
  },

  data: () => ({
    objectiveKeyResults: null,
  }),

  watch: {
    objective: {
      immediate: true,
      async handler() {
        const objectiveRef = objectiveCollection.getDocumentRef(this.objective.id);

        this.$bind(
          'objectiveKeyResults',
          await keyResultCollection.getKeyResultsByObjectiveRef(objectiveRef)
        );
      },
    },
  },

  methods: {
    formatProgression(value) {
      return format('.0%')(value);
    },
  },
};
</script>

<style lang="scss" scoped>
.objectiveProgression {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: var(--color-text);

  &__name {
    margin-bottom: 1rem;
    font-weight: 500;
    font-size: var(--font-size-1);
    line-height: 1.25rem;
  }

  &__keyResult {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem;
    color: var(--color-text);
    font-weight: 500;
    background: var(--color-secondary-light);

    &:not(:last-child) {
      margin-bottom: 0.125rem;
    }
  }
}
</style>
