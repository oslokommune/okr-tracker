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
      <button class="btn" :disabled="!objective.edited" @click="updateObj(objective)">
        Lagre endringer
      </button>
      <button class="btn btn--danger" @click="deleteObj(objective)">Slett mål</button>
    </div>
    <p v-if="submitButton === 'ERROR'">Nødvendige felt kan ikke være tomme</p>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import { required, minLength } from 'vuelidate/lib/validators';

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
        minLength: minLength(4),
      },
      objective_body: {
        required,
        minLength: minLength(4),
      },
    },
    quarter: {
      required,
    },
  },

  data: () => ({
    quarter: '',
    submitButton: '',
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
        this.submitButton = 'ERROR';
      } else {
        this.submitButton = 'OK';
        this.updateObjective(objective).then(() => {
          this.updateObject({
            key: 'Objectives',
            data: objective,
          });
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
