<template>
  <router-link
    :to="{ name: 'KeyResultHome', params: { keyResultId: keyResult.id } }"
    class="keyResult"
    :class="{ expanded: activeView !== 'compact' }"
  >
    <span class="keyResult__name">{{ keyResult.name }}</span>

    <ProgressBar class="keyResult__progression" :progression="keyResult.progression"></ProgressBar>

    <span v-if="activeView !== 'compact'" class="keyResult__description">{{ keyResult.description }}</span>

    <form v-if="activeView !== 'compact'" class="keyResult__form" @submit.prevent="update">
      <input type="number" v-model.number="keyResult.currentValue" @click.stop="" />
      <button>Send</button>
    </form>
  </router-link>
</template>

<script>
import { mapState } from 'vuex';
import KeyResult from '@/db/KeyResult';

export default {
  props: {
    keyResult: {
      type: Object,
      required: true,
    },
  },

  computed: {
    ...mapState(['activeView']),
  },

  methods: {
    update() {
      console.dir(KeyResult);
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

  &.expanded {
    grid-template-columns: 1.5rem 1fr span(2, 0, span(6));
  }
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

.keyResult__description {
  grid-row: 2;
  grid-column: 2 / 4;
  margin-top: 0.5rem;
  font-size: 0.8rem;
}
</style>
