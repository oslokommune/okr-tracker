<template>
  <div class="modal">
    <router-link :to="{ name: 'ItemHome' }">Close</router-link>
    <hr />

    <div>name: {{ keyRes.name }}</div>
    <div>targetValue: {{ keyRes.targetValue }}</div>
    <div>startValue: {{ keyRes.startValue }}</div>
    <div>currentValue: {{ keyRes.currentValue }}</div>
    <div>progression: {{ keyRes.progression }}</div>

    <form @submit.prevent="change">
      <input type="number" v-model.number="keyRes.weight" step="any" />
      <button>Send</button>
    </form>

    <form @submit.prevent="addValue">
      <input type="number" v-model.number="newValue" step="any" />
      <button>Send</button>
    </form>

    <hr />

    <ul>
      <li v-for="p in progress" :key="p.id" @click="remove(p.id)">{{ p.value }}</li>
    </ul>
  </div>
</template>

<script>
import { db } from '@/config/firebaseConfig';
import Progress from '@/db/Progress';
import KeyResult from '@/db/KeyResult';

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
    async change() {
      const { name, startValue, targetValue, description, unit, auto, weight } = this.keyRes;
      await KeyResult.update(this.keyRes.id, { name, startValue, targetValue, description, unit, auto, weight });
    },

    async addValue() {
      await Progress.create(this.keyRes.id, { value: +this.newValue });
      this.newValue = null;
    },
    remove(id) {
      Progress.remove(this.keyRes.id, id);
    },
  },

  watch: {
    keyRes: {
      immediate: true,
      handler({ id }) {
        this.$bind('progress', db.collection(`keyResults/${id}/progress`).orderBy('timestamp', 'desc'));
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
  overflow: auto;
  background: white;
  border-radius: 2px;
  box-shadow: 0 8px 24px rgba(black, 0.2);
}
</style>
