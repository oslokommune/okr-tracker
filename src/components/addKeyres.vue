<template>
  <div class="row">
    <button class="btn" v-if="!expand" @click="expand = true">
      Legg til nytt nøkkelresultat
    </button>

    <div v-if="expand" class="narrow create">
      <label class="form-group">
        <span class="form-label">Tilnyttet mål</span>
        <select v-model="objective_id">
          <option v-for="objective in product.children" :value="objective.id" :key="objective.id">
            {{ objective.objective_title }}
          </option>
        </select>
      </label>

      <label class="form-group">
        <span class="form-label">Beskrivelse</span>
        <textarea v-model="key_result" rows="4"></textarea>
      </label>

      <label class="form-group">
        <span class="form-label">Startverdi</span>
        <input type="number" v-model="start_value" />
      </label>

      <label class="form-group">
        <span class="form-label">Målverdi</span>
        <input type="number" v-model="target_value" />
      </label>

      <label class="form-group">
        <span class="form-label">Måleenhet</span>
        <input type="text " v-model="unit" />
      </label>
      <button class="btn" @click="send">Lagre nytt nøkkelresultat</button>
      <button class="btn btn--ghost" @click="expand = false">Avbryt</button>
    </div>
  </div>
</template>

<script>
import uniqid from 'uniqid';

export default {
  data: () => ({
    expand: true,
    objective_id: null,
    start_value: 0,
    target_value: 100,
    target_type: 'greater_than',
    key_result: '',
    unit: '',
  }),

  props: {
    productId: {
      type: String,
      required: true,
    },
  },

  computed: {
    product() {
      return this.$store.getters.getObjectById(this.productId);
    },

    newKeyRes() {
      return {
        id: uniqid(),
        objective_id: this.objective_id,
        key_result: this.key_result,
        start_value: this.start_value,
        target_value: this.target_value,
        target_type: this.target_type,
        unit: this.unit,
      };
    },
  },

  methods: {
    send() {
      this.$store
        .dispatch('addKeyResult', this.newKeyRes)
        .then(() => {
          this.expand = false;
          this.objective_id = null;
          this.start_value = 0;
          this.target_value = 100;
          this.target_type = 'greater_than';
          this.key_result = '';
          this.unit = '';
        })
        .catch(e => {
          throw new Error(e);
        });
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../styles/colors';

.create {
  margin: 1rem 0;
  padding: 2rem;

  background: $color-bg;
}
</style>
