<template>
  <div class="edit-objective" :class="{ loading }" v-if="objective">
    <h3 class="title-3">Endre mål</h3>
    <hr />
    <label class="form-field" :class="{ 'form-field--error': $v.objective.objective_title.$error }">
      <span class="form-label">Tittel</span>
      <input @input="objective.edited = true" type="text" v-model.trim="$v.objective.objective_title.$model" />
    </label>
    <div class="form-field--error" v-if="$v.objective.objective_title.$error">Kan ikke være tom</div>
    <div class="title title-3">
      <i :class="`fas fa-${objective.icon}`"></i>
    </div>
    <span class="form-label">Ikon</span>
    <v-select class="form-field" :options="icons" v-model="objective.icon">
      <template v-slot:option="option">
        <i :class="`fas fa-fw fa-${option.label}`"></i>&nbsp;
        <span>{{ option.label }}</span>
      </template>
    </v-select>

    <label class="form-field" :class="{ 'form-field--error': $v.objective.objective_body.$error }">
      <span class="form-label">Beskrivelse</span>
      <textarea @input="objective.edited = true" v-model.trim="$v.objective.objective_body.$model" rows="4"></textarea>
    </label>

    <div class="form-field" :class="{ 'form-field--error': $v.objective.objective_body.$error }">
      <div class="form-field--error" v-if="$v.objective.objective_body.$error">Kan ikke være tom</div>
      <span class="form-label">Kvartal</span>
      <v-select
        v-if="quarters"
        :class="{ 'form-field--error': $v.objective.quarter.$error }"
        label="name"
        :options="quarters"
        v-model="objective.quarter"
      ></v-select>
    </div>

    <hr />
    <button class="btn" :disabled="!objective.edited || submit" @click="updateObj(objective)">
      Lagre endringer
    </button>
    <button class="btn btn--danger" @click="deleteObj(objective)">Slett mål</button>

    <p v-if="showInfo">{{ info }}</p>
  </div>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import { mapState } from 'vuex';
import * as Toast from '@/util/toasts';
import { serializeDocument } from '@/util/db';

export default {
  props: {
    objectiveRef: {
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
      quarter: { required },
    },
  },

  data: () => ({
    submit: false,
    showInfo: false,
    info: '',
    loading: false,
    objective: null,
  }),
  computed: {
    ...mapState(['user', 'quarters', 'icons']),
  },

  mounted() {
    if (this.objectiveRef === undefined) return;

    this.objectiveRef.ref.onSnapshot(snapshot => {
      this.objective = serializeDocument(snapshot);
    });
  },

  watch: {
    async objectiveRef() {
      this.objective = await this.objectiveRef.ref
        .get()
        .then(serializeDocument)
        .catch(this.$errorHandler);

      this.objectiveRef.ref.onSnapshot(snapshot => {
        this.objective = serializeDocument(snapshot);
      });
    },
  },

  methods: {
    updateObj(objective) {
      this.$v.$touch();
      if (this.$v.$invalid) {
        this.setSubmitInfo(false, true, 'Nødvendige felt kan ikke være tomme');
      } else {
        this.setSubmitInfo(true, false, '');

        this.objectiveRef.ref
          .update({ edited: new Date(), edited_by: this.user.ref, ...objective })
          .then(() => {
            this.objective.edited = false;
            this.setSubmitInfo(false, true, 'Oppdatering vellykket!');
            Toast.savedChanges();
          })
          .catch(error => {
            this.objective.edited = false;
            this.setSubmitInfo(false, true, 'Noe gikk galt');
            this.$errorHandler(error);
          });
      }
    },

    deleteObj(objective) {
      this.loading = true;
      this.objective.ref
        .update({ archived: true, edited: new Date(), edited_by: this.user.ref })
        .then(() => {
          const { ref } = this.objectiveRef;

          Toast.deletedRegret({ name: objective.objective_title, ref });
          this.objective = null;
          return true;
        })
        .then(() => {
          this.loading = false;
        })
        .catch(this.$errorHandler);
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
.edit-objective {
  width: 100%;
  margin-top: -1.5rem;
}

.item {
  &__footer {
    display: flex;
    justify-content: space-between;
    margin-top: 3rem;
  }

  &.loading {
    transform: scale(0.9);
    opacity: 0.5;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>
