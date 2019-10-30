<template>
  <div class="row add">
    <button class="btn btn--ghost" @click="expand = true" :disabled="expand">+ Legg til nytt nøkkelresultat</button>

    <div v-if="expand" class="popout">
      <span class="form-label">Tilknyttet mål</span>
      <v-select
        class="form-group objective__select"
        :class="{ 'form-group--error': $v.objective_id.$error }"
        label="objective_title"
        v-model="$v.objective_id.$model"
        :value="objective_id"
        :options="product.children"
      ></v-select>
      <div class="form-group--error" v-if="$v.objective_id.$error">Kan ikke være tom</div>

      <label class="form-group" :class="{ 'form-group--error': $v.key_result.$error }">
        <span class="form-label">Beskrivelse</span>
        <textarea v-model="$v.key_result.$model" rows="4"></textarea>
      </label>
      <div class="form-group--error" v-if="$v.key_result.$error">Kan ikke være tom</div>

      <label class="form-group" :class="{ 'form-group--error': $v.start_value.$error }">
        <span class="form-label">Startverdi</span>
        <input type="number" v-model="$v.start_value.$model" />
      </label>
      <div class="form-group--error" v-if="$v.start_value.$error">Kan ikke være tom</div>

      <label class="form-group" :class="{ 'form-group--error': $v.target_value.$error }">
        <span class="form-label">Målverdi</span>
        <input type="number" v-model="$v.target_value.$model" />
      </label>
      <div class="form-group--error" v-if="$v.target_value.$error">Kan ikke være tom</div>

      <label class="form-group" :class="{ 'form-group--error': $v.unit.$error }">
        <span class="form-label">Måleenhet</span>
        <input type="text" v-model="$v.unit.$model" />
      </label>
      <div class="form-group--error" v-if="$v.unit.$error">Kan ikke være tom</div>

      <button :disabled="submit" class="btn" @click="send">Lagre nytt nøkkelresultat</button>
      <button class="btn btn--ghost" @click="expand = false">Avbryt</button>
      <p v-if="showInfo">{{ info }}</p>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex';
import { required } from 'vuelidate/lib/validators';
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
    submit: false,
    showInfo: false,
    info: '',
  }),

  props: {
    productId: {
      type: String,
      required: true,
    },
  },

  validations: {
    objective_id: {
      required,
    },
    key_result: {
      required,
    },
    start_value: {
      required,
    },
    target_value: {
      required,
    },
    unit: {
      required,
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
    ...mapActions(['addObject', 'addKeyResult']),

    send() {
      this.$v.$touch();
      if (this.$v.$invalid) {
        this.setSubmitInfo(false, true, 'Nødvendige felt kan ikke være tomme');
      } else {
        this.setSubmitInfo(true, false, '');
        this.addKeyResult(this.newKeyRes)
          .then(() => {
            this.addObject({
              key: 'KeyRes',
              data: this.newKeyRes,
            });
          })
          .then(() => {
            this.setSubmitInfo(false, false, '');
            this.expand = false;
            this.objective_id = null;
            this.start_value = 0;
            this.target_value = 100;
            this.target_type = 'greater_than';
            this.key_result = '';
            this.unit = '';
          })
          .catch(e => {
            this.setSubmitInfo(false, true, 'Noe gikk galt');
            throw new Error(e);
          });
      }
    },

    setSubmitInfo(submit, showInfo, info) {
      this.submit = submit;
      this.showInfo = showInfo;
      this.info = info;
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../../styles/colors';

.add {
  position: relative;
  margin: 2rem 0;
}
</style>
