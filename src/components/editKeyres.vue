<template>
  <div class="row add">
    <button class="btn btn--ghost" @click="expand = true" :disabled="expand">+ Legg til nytt nøkkelresultat</button>

    <div v-if="expand" class="popout">
      <span class="form-label">Tilknyttet mål</span>
      <v-select
        class="form-group objective__select"
        label="objective_title"
        v-model="objective_id"
        :value="objective_id"
        :options="product.children"
      ></v-select>

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
      <button :disabled="submitButton === 'LOADING'" class="btn" @click="send">Lagre nytt nøkkelresultat</button>
      <button class="btn btn--ghost" @click="expand = false">Avbryt</button>
      <p v-if="submitButton === 'FAILED'">Noe gikk galt</p>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex';
import uniqid from 'uniqid';

export default {
  data: () => ({
    expand: false,
    objective_id: null,
    start_value: 0,
    target_value: 100,
    target_type: 'greater_than',
    key_result: '',
    unit: '',
    submitButton: '',
  }),

  props: {
    productId: {
      type: String,
      required: true,
    },
  },

  computed: {
    ...mapState(['chosenQuarter']),
    ...mapGetters(['getProductWithDistinctObjectives']),
    product() {
      return this.getProductWithDistinctObjectives(this.productId, this.chosenQuarter);
    },

    newKeyRes() {
      return {
        id: uniqid(),
        objective_id: this.objective_id.id,
        key_result: this.key_result,
        start_value: this.start_value,
        target_value: this.target_value,
        target_type: this.target_type,
        unit: this.unit,
      };
    },
  },

  methods: {
    ...mapActions(['addObject']),
    send() {
      this.submitButton = 'LOADING';
      this.$store
        .dispatch('addKeyResult', this.newKeyRes)
        .then(() => {
          this.addObject({
            key: 'KeyRes',
            data: this.newKeyRes,
          });
        })
        .then(() => {
          this.submitButton = 'OK';
          this.expand = false;
          this.objective_id = null;
          this.start_value = 0;
          this.target_value = 100;
          this.target_type = 'greater_than';
          this.key_result = '';
          this.unit = '';
        })
        .catch(e => {
          this.submitButton = 'FAILED';
          throw new Error(e);
        });
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../styles/colors';

.add {
  position: relative;
  margin: 2rem 0;
}
</style>
