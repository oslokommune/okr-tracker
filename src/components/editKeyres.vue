<template>
  <div class="card">
    <div class="text">
      <p class="pill">{{ objective.objective_title }}</p>
      <p>{{ keyres.key_result }}</p>
    </div>

    <div class="form">
      <label class="form-group">
        <span class="form-label">Fremdrift</span>
        <span class="form-help">{{ keyres.unit }}</span>
        <input type="number" v-model="value" />
      </label>
      <label class="form-group">
        <span class="form-label">Dato</span>
        <span class="form-help">Hvilken dato gjelder verdien for?</span>
        <input type="date" v-model="date" />
      </label>
      <button class="btn">Oppdater</button>
      <button class="btn btn--ghost">Endre</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EditKeyres',

  data: () => ({
    value: 0,
    date: new Date().toISOString().split('T')[0],
  }),

  props: {
    id: {
      type: String,
      required: true,
    },
  },

  computed: {
    keyres() {
      return this.$store.getters.getObjectById(this.id);
    },
    objective() {
      return this.$store.getters.getObjectById(this.keyres.objective_id);
    },
  },
};
</script>

<style lang="scss" scoped>
.card {
  display: flex;
  flex-direction: column;
}

.text {
  margin-bottom: 2rem;
}

.form {
  margin-top: auto;
  margin-bottom: 0;
}
</style>
