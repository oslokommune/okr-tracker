<template>
  <span class="item-tag">
    <span :style="{ background: contributorTagColor(item.name) }"></span>
    <span>{{ item.name }}</span>
  </span>
</template>

<script>
import { contributorTagColor } from '@/util/okr';

export default {
  name: 'ItemTag',

  props: {
    item: {
      type: Object,
      required: true,
    },
  },

  methods: {
    contributorTagColor,
  },
};
</script>

<style lang="scss" scoped>
.item-tag {
  display: inline-flex;
  gap: 0.25rem;
  align-items: center;
  text-wrap: nowrap;

  span:first-of-type {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
  }
}
</style>
