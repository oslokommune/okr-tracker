<template>
  <div class="modal">
    <router-link :to="{ name: 'ItemHome' }">Close</router-link>
    <hr />
    <pre>{{ keyRes.id }}</pre>

    <form @submit.prevent="addValue">
      <input type="number" v-model="newValue" />
      <button>Send</button>
    </form>

    <pre>{{ progress }}</pre>
  </div>
</template>

<script>
import { db } from '@/config/firebaseConfig';

export default {
  data: () => ({
    progress: [],
    newValue: null,
  }),

  computed: {
    keyRes() {
      return this.$store.state.activeKeyResult;
    },
  },

  methods: {
    addValue() {
      // TODO:
    },
  },

  watch: {
    keyRes: {
      immediate: true,
      handler({ id }) {
        this.$bind('progress', db.collection(`keyResults/${id}/progress`));
      },
    },
  },
};
</script>

<style lang="scss" scoped>
.modal {
  position: fixed;
  top: 2rem;
  left: 2rem;
  width: calc(100vw - 4rem);
  height: calc(100vh - 4rem);
  padding: 2rem;
  background: white;
  border-radius: 2px;
  box-shadow: 0 8px 24px rgba(black, 0.2);
}
</style>
