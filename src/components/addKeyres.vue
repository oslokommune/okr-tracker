<template>
  <div>
    <button v-if="!expand" @click="expand = true">
      Legg til nytt nøkkelresultat
    </button>

    <div v-if="expand">
      <ul>
        <li>
          <label>
            <span>Tilnyttet mål</span><br />
            <select v-model="objective_id">
              <option v-for="objective in product.children" :value="objective.id" :key="objective.id">
                {{ objective.objective_title }}
              </option>
            </select>
          </label>
        </li>

        <li>
          <label>
            <span>Beskrivelse</span><br />
            <textarea v-model="key_result"></textarea>
          </label>
        </li>

        <li>
          <label>
            <span>Startverdi</span><br />
            <input type="number" v-model="start_value" />
          </label>
        </li>

        <li>
          <label>
            <span>Målverdi</span><br />
            <input type="number" v-model="target_value" />
          </label>
        </li>

        <li>
          <label>
            <span>Måleenhet</span><br />
            <input type="text " v-model="unit" />
          </label>
        </li>
      </ul>
      <button class="btn" @click="send">Legg til</button>
      <button class="btn" @click="expand = false">Lukk</button>
    </div>
  </div>
</template>

<script>
import uniqid from 'uniqid';

export default {
  data: () => ({
    expand: false,
    quarter: '',
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
      return this.$store.getters.getObjectById(this.product_id);
    },

    newKeyRes() {
      return {
        id: uniqid(),
        quarter: this.quarter,
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
          this.quarter = '';
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
