<template>
  <router-link :to="{ name: 'KeyResultHome', params: { keyResultId: keyResult.id } }" class="keyResult">
    <span class="keyResult__name">{{ keyResult.name }}</span>

    <ProgressBar class="keyResult__progression" :progression="keyResult.progression"></ProgressBar>
  </router-link>
</template>

<script>
export default {
  props: {
    keyResult: {
      type: Object,
      required: true,
    },
  },

  components: {
    ProgressBar: () => import('@/components/ProgressBar.vue'),
  },
};
</script>

<style lang="scss" scoped>
.keyResult {
  display: grid;
  grid-template-columns: 1.5rem 1fr span(1, 0, span(6));
  align-items: baseline;
  padding: 0.5rem 0.75rem;
  color: black;
  text-decoration: none;
}

.keyResult__icon {
  grid-column: 1;
}

.keyResult__name {
  grid-column: 2;
}

.keyResult__progression {
  grid-column: 3;
}
</style>
