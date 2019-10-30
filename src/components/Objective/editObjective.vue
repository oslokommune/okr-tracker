<template>
  <div class="item">
    <label class="form-group" :class="{ 'form-group--error': $v.objective.objective_title.$error }">
      <span class="form-label">Tittel</span>
      <input @input="objective.edited = true" type="text" v-model.trim="$v.objective.objective_title.$model" />
    </label>
    <div class="form-group--error" v-if="$v.objective.objective_title.$error">Kan ikke være tom</div>
    <label class="form-group" :class="{ 'form-group--error': $v.objective.objective_body.$error }">
      <span class="form-label">Beskrivelse</span>
      <textarea @input="objective.edited = true" v-model.trim="$v.objective.objective_body.$model" rows="4"></textarea>
    </label>
    <div class="form-group--error" v-if="$v.objective.objective_body.$error">Kan ikke være tom</div>
    <span class="form-label">Kvartal</span>
    <v-select
      :class="{ 'form-group--error': $v.quarter.$error }"
      class="form-group"
      :value="quarter"
      :options="quarters"
      @input="setSelectedQuarter"
    ></v-select>

    <div class="item__footer">
      <button class="btn" :disabled="!objective.edited || submit" @click="updateObj(objective)">
        Lagre endringer
      </button>
      <button class="btn btn--danger" @click="deleteObj(objective)">Slett mål</button>
    </div>
    <p v-if="showInfo">{{ info }}</p>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import { required } from 'vuelidate/lib/validators';

export default {
  props: {
    objective: {
      type: Object,
      required: true,
    },
  },

  validations: {
    objective: {
      objective_title: {
        required,
      },
      objective_body: {
        required,
      },
    },
    quarter: {
      required,
    },
  },

  data: () => ({
    quarter: '',
    submit: false,
    showInfo: false,
    info: '',
  }),

  mounted() {
    if (this.objective === undefined) return;
    this.quarter = this.objective.quarter;
  },

  computed: {
    ...mapGetters(['getDistinctQuarters']),
    quarters() {
      return this.getDistinctQuarters(this.$route.params.id);
    },
  },

  methods: {
    ...mapActions(['updateObjective', 'deleteObjective', 'updateObject', 'deleteObject']),
    setSelectedQuarter(value) {
      this.$v.quarter.$touch();
      this.objective.edited = true;
      this.quarter = value;
    },
    updateObj(objective) {
      this.$v.$touch();
      if (this.$v.$invalid) {
        this.setSubmitInfo(false, true, 'Nødvendige felt kan ikke være tomme');
      } else {
        this.setSubmitInfo(true, false, '');
        this.updateObjective(objective)
          .then(() => {
            this.updateObject({
              key: 'Objectives',
              data: objective,
            });
          })
          .then(() => {
            this.objective.edited = false;
            this.setSubmitInfo(false, false, 'Oppdatering vellykket!');
          })
          .catch(() => {
            this.objective.edited = false;
            this.setSubmitInfo(false, true, 'Noe gikk galt');
          });
      }
    },

    deleteObj(objective) {
      this.deleteObjective(objective).then(() => {
        this.deleteObject({
          key: 'Objectives',
          data: objective,
        });
      });
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
