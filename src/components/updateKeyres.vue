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
      <button class="btn" @click="addKeyResValue">Oppdater</button>
      <router-link :to="{ name: 'keyres-value-details', params: { keyresId } }" class="btn btn--ghost">
        Detaljer
      </router-link>
    </div>
  </div>
</template>

<script>
import uniqid from 'uniqid';

export default {
  name: 'UpdateKeyres',

  data: () => ({
    date: new Date().toISOString().split('T')[0],
    newValue: 0,
  }),

  props: {
    keyresId: {
      type: String,
      required: true,
    },
  },

  methods: {
    addKeyResValue() {
      this.$store
        .dispatch('addKeyResValue', {
          id: uniqid(),
          key_result_id: this.keyresId,
          value: +this.newValue,
          timestamp: this.date,
        })
        .then(() => {
          this.$router.push({
            name: 'keyres-value-details',
            params: {
              keyresId: this.keyresId,
            },
          });
        });
    },
  },

  computed: {
    keyres() {
      return this.$store.getters.getObjectById(this.keyresId);
    },
    objective() {
      return this.$store.getters.getObjectById(this.keyres.objective_id);
    },

    value: {
      set(val) {
        this.newValue = val;
      },
      get() {
        return this.keyres.current_value;
      },
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
