<template>
  <span class="item-tag">
    <span class="item-tag__bullet" :style="bulletStyle"></span>
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

  computed: {
    bulletStyle() {
      return {
        background: this.item?.color || contributorTagColor(this.item.name),
      };
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
  white-space: nowrap;

  &__bullet {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
  }
}
</style>
