<template>
  <div class="popout">
    <span class="form-label">Tilknyttet mål</span>
    <v-select
      v-if="objectives"
      class="form-field objective__select"
      :class="{ 'form-field--error': $v.objective.$error }"
      label="objective_title"
      v-model="$v.objective.$model"
      :options="objectives"
    ></v-select>

    <div class="form-field--error" v-if="$v.objective.$error">Kan ikke være tom</div>

    <label class="form-field" :class="{ 'form-field--error': $v.key_result.$error }">
      <span class="form-label">Beskrivelse</span>
      <textarea v-model="$v.key_result.$model" rows="4"></textarea>
    </label>
    <div class="form-field--error" v-if="$v.key_result.$error">Kan ikke være tom</div>

    <div class="form-row">
      <label class="form-field" :class="{ 'form-field--error': $v.start_value.$error }">
        <span class="form-label">Startverdi</span>
        <input type="number" v-model="$v.start_value.$model" />
      </label>
      <div class="form-field--error" v-if="$v.start_value.$error">Kan ikke være tom</div>

      <label class="form-field" :class="{ 'form-field--error': $v.target_value.$error }">
        <span class="form-label">Målverdi</span>
        <input type="number" v-model="$v.target_value.$model" />
      </label>
      <div class="form-field--error" v-if="$v.target_value.$error">Kan ikke være tom</div>
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
import * as Toast from '@/util/toasts';

export default {
  data: () => ({
    objective: null,
    start_value: 0,
    target_value: 100,
    target_type: 'greater_than',
    key_result: '',
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
    ...mapState(['user']),
    newKeyRes() {
      return {
        archived: false,
        key_result: this.key_result,
        start_value: this.start_value,
        target_value: this.target_value,
        target_type: this.target_type,
        created: new Date(),
        created_by: this.user.ref,
        edited: null,
        edited_by: null,
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
          .collection('key_results')
          .add(this.newKeyRes)
          .then(() => {
            Toast.addedKeyResult();
            this.close();
          })
          .catch(err => {
            Toast.error();
            throw new Error(err);
          });
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
@import '../../styles/colors';
</style>
