<template>
  <div class="item">
    <label class="form-group">
      <span class="form-label">Tittel</span>
      <input @input="objective.edited = true" type="text" v-model="objective.objective_title" />
    </label>
    <label class="form-group">
      <span class="form-label">Beskrivelse</span>
      <textarea @input="objective.edited = true" v-model="objective.objective_body" rows="4"></textarea>
    </label>
    <label class="form-group">
      <span class="form-label">Kvartal</span>
      <input @input="objective.edited = true" type="text" v-model="objective.quarter" />
    </label>
    <div class="item__footer">
      <button class="btn" :disabled="!objective.edited" @click="updateObjective(objective)">
        Lagre endringer
      </button>
      <button class="btn btn--danger" @click="deleteObjective(objective)">Slett mål</button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    objective: {
      type: Object,
      required: true,
    },
  },

  methods: {
    updateObjective(objective) {
      this.$store.dispatch('updateObjective', objective);
    },

    deleteObjective(objective) {
      this.$store.dispatch('deleteObjective', objective);
    },
  },
};
</script>

<style lang="scss" scoped>
.item {
  padding: 2rem;

  background: #fbfbfb;
  border: 1px solid #eaeaea;

  &__footer {
    display: flex;
    justify-content: space-between;
  }
}
</style>
