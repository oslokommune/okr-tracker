<template>
  <ul class="key-results-list">
    <li v-for="keyResult in keyResults" :key="keyResult.id" class="key-results-list__row">
      <key-result-row :key-result="keyResult" :compact="compact" />
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
    compact: {
      type: Boolean,
      required: false,
      default: false,
    },
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
