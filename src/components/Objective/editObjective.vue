<template>
  <div class="edit-objective" :class="{ loading }" v-if="objective">
    <h3 class="title-3">Endre mål</h3>
    <hr />
    <label class="form-field" :class="{ 'form-field--error': $v.objective.name.$error }">
      <span class="form-label">Tittel</span>
      <input @input="dirty = true" type="text" v-model.trim="$v.objective.name.$model" />
    </label>
    <div class="form-field--error" v-if="$v.objective.name.$error">Kan ikke være tom</div>
    <div class="title title-3">
      <i :class="`fas fa-${objective.icon}`"></i>
    </div>
    <span class="form-label">Ikon</span>
    <v-select class="form-field" :options="icons" v-model="objective.icon" @input="dirty = true">
      <template v-slot:option="option">
        <i :class="`fas fa-fw fa-${option.label}`"></i>&nbsp;
        <span>{{ option.label }}</span>
      </template>
    </v-select>

    <label class="form-field" :class="{ 'form-field--error': $v.objective.description.$error }">
      <span class="form-label">Beskrivelse</span>
      <textarea @input="dirty = true" v-model.trim="$v.objective.description.$model" rows="4"></textarea>
    </label>

    <hr />
    <button class="btn" :disabled="!dirty" @click="updateObj(objective)">
      Lagre endringer
    </button>
    <button class="btn btn--danger" @click="deleteObj(objective)">Slett mål</button>

    <p v-if="showInfo">{{ info }}</p>
  </div>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import { mapState } from 'vuex';
import * as Toast from '../../util/toasts';
import Audit from '../../db/audit';
import { serializeDocument } from '../../db/db';

export default {
  name: 'EditObjective',

  props: {
    objectiveRef: {
      type: Object,
      required: true,
    },
  },

  validations: {
    objective: {
      name: {
        required,
      },
      description: {
        required,
      },
    },
  },

  data: () => ({
    submit: false,
    showInfo: false,
    info: '',
    loading: false,
    objective: null,
    dirty: false,
    unsubscribe: null,
  }),
  computed: {
    ...mapState(['user', 'icons']),
  },

  created() {
    if (this.objectiveRef === undefined) return;

    this.unsubscribe = this.objectiveRef.ref.onSnapshot(snapshot => {
      this.objective = serializeDocument(snapshot);
    });
  },

  watch: {
    async objectiveRef(objective) {
      this.objective = await objective.ref
        .get()
        .then(serializeDocument)
        .catch(err => {
          this.$errorHandler('get_objective_error', err);
        });

      this.unsubscribe = objective.ref.onSnapshot(snapshot => {
        this.objective = serializeDocument(snapshot);
      });
    },
  },

  beforeDestroy() {
    if (this.unsubscribe) this.unsubscribe();
  },

  methods: {
    updateObj(objective) {
      this.$v.$touch();
      if (this.$v.$invalid) {
        this.setSubmitInfo(false, true, 'Nødvendige felt kan ikke være tomme');
      } else {
        this.setSubmitInfo(true, false, '');

        this.objectiveRef.ref
          .update({ edited: new Date(), editedBy: this.user.ref, ...objective })
          .then(() => {
            this.objective.edited = false;
            this.setSubmitInfo(false, true, 'Oppdatering vellykket!');
            Audit.updateObjective(this.objective.ref, this.objective.ref.parent.parent);
            Toast.savedChanges();
          })
          .catch(error => {
            this.objective.edited = false;
            this.setSubmitInfo(false, true, 'Noe gikk galt');
            this.$errorHandler('update_objective_error', error);
          });
      }
    },

    deleteObj(objective) {
      this.loading = true;
      this.objective.ref
        .update({ archived: true, edited: new Date(), editedBy: this.user.ref })
        .then(() => {
          const { ref } = this.objectiveRef;

          Audit.archiveObjective(this.objective.ref, this.objective.ref.parent.parent);
          Toast.deletedRegret({ name: objective.name, ref });
          this.objective = null;
          return true;
        })
        .then(() => {
          this.loading = false;
        })
        .catch(err => {
          this.$errorHandler('delete_objective_error', err);
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
