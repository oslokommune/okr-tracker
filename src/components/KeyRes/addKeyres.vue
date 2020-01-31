<template>
  <div class="popout">
    <span class="form-label">Tilknyttet mål</span>
    <v-select
      v-if="objectives"
      class="form-field objective__select"
      :class="{ 'form-field--error': $v.objective.$error }"
      label="name"
      v-model="$v.objective.$model"
      :options="objectives"
    ></v-select>

    <div class="form-field--error" v-if="$v.objective.$error">Kan ikke være tom</div>

    <label class="form-field" :class="{ 'form-field--error': $v.description.$error }">
      <span class="form-label">Beskrivelse</span>
      <textarea v-model="$v.description.$model" rows="4"></textarea>
    </label>
    <div class="form-field--error" v-if="$v.description.$error">Kan ikke være tom</div>

    <div class="form-row">
      <label class="form-field" :class="{ 'form-field--error': $v.startValue.$error }">
        <span class="form-label">Startverdi</span>
        <input type="number" v-model="$v.startValue.$model" />
      </label>
      <div class="form-field--error" v-if="$v.startValue.$error">Kan ikke være tom</div>

      <label class="form-field" :class="{ 'form-field--error': $v.targetValue.$error }">
        <span class="form-label">Målverdi</span>
        <input type="number" v-model="$v.targetValue.$model" />
      </label>
      <div class="form-field--error" v-if="$v.targetValue.$error">Kan ikke være tom</div>
    </div>

    <label class="form-field" :class="{ 'form-field--error': $v.unit.$error }">
      <span class="form-label">Måleenhet</span>
      <span class="form-help">Hva er det som måles (klikk/prosent/brukere etc)?</span>
      <input type="text" v-model="$v.unit.$model" />
    </label>
    <div class="form-field--error" v-if="$v.unit.$error">Kan ikke være tom</div>

    <hr />

    <button :disabled="submit" class="btn" @click="send">Lagre nytt nøkkelresultat</button>
    <button class="btn btn--ghost" @click="close">Avbryt</button>
    <p v-if="showInfo">{{ info }}</p>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { required } from 'vuelidate/lib/validators';
import { serializeDocument } from '../../util/db';
import * as Toast from '../../util/toasts';
import Audit from '../../util/audit/audit';
import { errorHandler } from '../../util/utils';

export default {
  name: 'AddKeyres',

  data: () => ({
    objective: null,
    startValue: 0,
    targetValue: 100,
    targetType: 'greater_than',
    description: '',
    unit: '',
    submit: false,
    showInfo: false,
    info: '',
    objectives: null,
  }),

  props: {
    productref: {
      type: Object,
      required: true,
    },
    selectedQuarterName: {
      type: String,
      required: true,
    },
  },

  validations: {
    objective: {
      required,
    },
    description: {
      required,
    },
    startValue: {
      required,
    },
    targetValue: {
      required,
    },
    unit: {
      required,
    },
  },

  computed: {
    ...mapState(['user']),
    newKeyRes() {
      return {
        archived: false,
        description: this.description,
        startValue: +this.startValue,
        targetValue: +this.targetValue,
        targetType: this.targetType,
        created: new Date(),
        createdBy: this.user.ref,
        edited: null,
        editedBy: null,
        unit: this.unit,
      };
    },
  },

  mounted() {
    this.productref
      .collection('objectives')
      .where('quarter', '==', this.selectedQuarterName)
      .where('archived', '==', false)
      .onSnapshot(snapshot => {
        this.objectives = snapshot.docs.map(serializeDocument);
      });
  },

  methods: {
    send() {
      this.$v.$touch();
      if (this.$v.$invalid) {
        this.setSubmitInfo(false, true, 'Nødvendige felt kan ikke være tomme');
      } else {
        this.setSubmitInfo(true, false, '');

        this.objective.ref
          .collection('keyResults')
          .add(this.newKeyRes)
          .then(docref => {
            Toast.addedKeyResult();
            Audit.createKeyResult(docref, this.productref, this.objective.ref);
            this.close();
          })
          .catch(errorHandler);
      }
    },
    setSubmitInfo(submit, showInfo, info) {
      this.submit = submit;
      this.showInfo = showInfo;
      this.info = info;
    },

    close() {
      this.$emit('close-menu', false);
    },
  },
};
</script>

<style lang="scss" scoped>
.objective__select {
  padding-top: 0.5rem;
}
</style>
