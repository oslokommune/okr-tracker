<template>
  <div>
    <ul>
      <li>
        <label>
          <span>Tittel</span><br />
          <input @input="objective.edited = true" type="text" v-model="objective.objective_title" />
        </label>
      </li>
      <li>
        <label>
          <span>Beskrivelse</span><br />
          <textarea @input="objective.edited = true" v-model="objective.objective_body"></textarea>
        </label>
      </li>

      <li>
        <label>
          <span>Kvartal</span><br />
          <input @input="objective.edited = true" type="text" v-model="objective.quarter" />
        </label>
      </li>
    </ul>

    <button :disabled="!objective.edited" @click="updateObjective(objective)">
      Lagre endringer
    </button>
    <button @click="deleteObjective(objective)">Slett mål</button>
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
