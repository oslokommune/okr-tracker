<template>
  <div class="edit-keyres">
    <h3 class="title-3">Oppdatere nøkkelresultat</h3>
    <span class="form-label">Tilknyttet mål</span>
    <v-select
      class="form-group objective__select"
      :class="{ 'form-group--error': $v.objective.$error }"
      label="objective_title"
      v-model="$v.objective.$model"
      :value="objective"
      :options="productObject.children"
      @input="setSelectedObjective"
    ></v-select>
    <div class="form-group--error" v-if="$v.objective.$error">Kan ikke være tom</div>

    <label class="form-group" :class="{ 'form-group--error': $v.key_result.$error }">
      <span class="form-label">Beskrivelse</span>
      <textarea @input="edited = true" v-model="$v.key_result.$model" rows="4"></textarea>
    </label>
    <div class="form-group--error" v-if="$v.key_result.$error">Kan ikke være tom</div>

    <label class="form-group" :class="{ 'form-group--error': $v.start_value.$error }">
      <span class="form-label">Startverdi</span>
      <input @input="edited = true" type="number" v-model="$v.start_value.$model" />
    </label>
    <div class="form-group--error" v-if="$v.start_value.$error">Kan ikke være tom</div>

    <label class="form-group" :class="{ 'form-group--error': $v.target_value.$error }">
      <span class="form-label">Målverdi</span>
      <input @input="edited = true" type="number" v-model="$v.target_value.$model" />
    </label>
    <div class="form-group--error" v-if="$v.target_value.$error">Kan ikke være tom</div>

    <label class="form-group" :class="{ 'form-group--error': $v.unit.$error }">
      <span class="form-label">Måleenhet</span>
      <input @input="edited = true" type="text" v-model="$v.unit.$model" />
    </label>
    <div class="form-group--error" v-if="$v.unit.$error">Kan ikke være tom</div>

    <button :disabled="!edited || submit" class="btn" @click="send">Endre nøkkelresultat</button>
    <p v-if="showInfo">{{ info }}</p>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex';
import { required } from 'vuelidate/lib/validators';

export default {
  data: () => ({
    objective_id: null,
    start_value: 0,
    target_value: 100,
    target_type: 'greater_than',
    key_result: '',
    unit: '',
    submit: false,
    showInfo: false,
    info: '',
    edited: false,
    objective: null,
  }),

  mounted() {
    this.objective_id = this.keyResObject.objective_id;
    this.start_value = this.keyResObject.start_value;
    this.target_value = this.keyResObject.target_value;
    this.target_type = this.keyResObject.target_type;
    this.key_result = this.keyResObject.key_result;
    this.unit = this.keyResObject.unit;
    this.objective = this.getObjective;
  },

  validations: {
    start_value: {
      required,
    },
    target_value: {
      required,
    },
    unit: {
      required,
    },
    key_result: {
      required,
    },
    objective: {
      required,
    },
  },

  props: {
    keyResObject: {
      type: Object,
      required: true,
    },
    productObject: {
      type: Object,
      required: true,
    },
  },

  computed: {
    ...mapState(['chosenQuarter']),
    ...mapGetters(['getProductWithDistinctObjectives', 'getObjectById']),

    product() {
      return this.getProductWithDistinctObjectives(this.keyResObject.id, this.chosenQuarter);
    },

    getObjective() {
      return this.getObjectById(this.keyResObject.objective_id);
    },

    updatedKeyRes() {
      return {
        id: this.keyResObject.id,
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
    ...mapActions(['updateObject', 'updateKeyRes']),

    send() {
      this.$v.$touch();
      if (this.$v.$invalid) {
        this.setSubmitInfo(false, true, 'Nødvendige felt kan ikke være tomme');
      } else {
        this.setSubmitInfo(true, false, '');
        this.updateKeyRes(this.updatedKeyRes)
          .then(() => {
            this.updateObject({
              key: 'KeyRes',
              data: this.updatedKeyRes,
            });
          })
          .then(() => {
            this.setSubmitInfo(false, false, '');
          })
          .catch(e => {
            this.setSubmitInfo(false, true, 'Noe gikk galt');
            throw new Error(e);
          });
      }
    },
    setSelectedObjective(objective) {
      this.$v.objective.$touch();
      this.edited = true;
      this.objective_id = objective.id;
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

.edit-keyres {
  width: 450px;
  margin-right: 1rem;
}
</style>
