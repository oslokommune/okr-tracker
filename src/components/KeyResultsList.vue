<template>
  <ul class="key-results-list">
    <li v-for="keyResult in keyResults" :key="keyResult.id" class="key-results-list__row">
      <key-result-row :key-result="keyResult" />
    </li>
  </ul>
</template>

<script>
export default {
  name: 'KeyResultsList',

  components: {
    KeyResultRow: () => import('@/components/KeyResultRow.vue'),
  },

  props: {
    keyResults: {
      type: Array,
      required: false,
      default: () => [],
    },
  },
};
</script>

<style lang="scss" scoped>
.key-results-list {
  // margin: 1.5rem 0;

  &__row {
    margin-top: 0.25rem;

    &:first-child {
      margin-top: 0;
    }
  }
}
</style>
