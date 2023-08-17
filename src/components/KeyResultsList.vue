<template>
  <ul v-if="keyResults.length" class="key-results-list">
    <li v-for="keyResult in keyResults" :key="keyResult.id" class="key-results-list__row">
      <key-result-row :key-result="keyResult" :compact="compact" />
    </li>
  </ul>
  <empty-state
    v-else-if="showEmptyState && !loading"
    :heading="$t('empty.noKeyResults.heading')"
    :body="$t('empty.noKeyResults.body')"
  />
</template>

<script>
import { db } from '@/config/firebaseConfig';

export default {
  name: 'KeyResultsList',

  components: {
    EmptyState: () => import('@/components/EmptyState.vue'),
    KeyResultRow: () => import('@/components/KeyResultRow.vue'),
  },

  props: {
    objective: {
      type: Object,
      required: true,
    },
    compact: {
      type: Boolean,
      required: false,
      default: false,
    },
    showEmptyState: {
      type: Boolean,
      required: false,
      default: true,
    },
  },

  data: () => ({
    loading: true,
    keyResults: [],
  }),

  async created() {
    const objectiveRef = await db.doc(`objectives/${this.objective.id}`);
    const keyResults = await db
      .collection('keyResults')
      .where('archived', '==', false)
      .where('objective', '==', objectiveRef)
      .orderBy('name');

    await this.$bind('keyResults', keyResults);

    this.loading = false;
  },
};
</script>

<style lang="scss" scoped>
.key-results-list {
  &__row {
    margin-top: 0.25rem;

    &:first-child {
      margin-top: 0;
    }
  }
}
</style>
