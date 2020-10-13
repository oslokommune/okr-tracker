<template>
  <router-link
    :to="{ name: 'KeyResultHome', params: { keyResultId: keyRow.id } }"
    class="keyResult"
    :class="{ expanded: view !== 'compact' }"
  >
    <span class="keyResult__name">{{ keyRow.name }}</span>

    <ProgressBar class="keyResult__progression" :progression="keyRow.progression"></ProgressBar>

    <span v-if="view !== 'compact'" class="keyResult__description">{{ keyRow.description }}</span>

    <form v-if="view !== 'compact'" class="keyResult__form" @submit.prevent="update">
      <input type="number" v-model.number="keyRow.currentValue" @click.stop="" />
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
    forceExpanded: {
      type: Boolean,
      required: false,
      default: false,
    },
  },

  data: () => ({
    keyRow: null,
  }),

  computed: {
    ...mapState(['activeView']),
    view() {
      if (this.forceExpanded) return 'expanded';

      return this.activeView;
    },
  },

  methods: {
    update() {
      console.dir(KeyResult);
    },
  },

  components: {
    ProgressBar: () => import('@/components/ProgressBar.vue'),
  },

  watch: {
    keyResult: {
      immediate: true,
      handler() {
        this.keyRow = this.keyResult;
      },
    },
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
