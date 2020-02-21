<template>
  <div class="edit-keyres">
    <h3 class="title-3">Endre nøkkelresultat</h3>
    <hr />

    <label class="form-field" :class="{ 'form-field--error': $v.keyres.description.$error }">
      <span class="form-label">Beskriv nøkkelresultatet</span>
      <textarea @input="dirty = true" v-model="$v.keyres.description.$model" rows="4"></textarea>
    </label>
    <div class="form-field--error" v-if="$v.keyres.description.$error">Kan ikke være tom</div>

    <div class="form-row">
      <label class="form-field" :class="{ 'form-field--error': $v.keyres.startValue.$error }">
        <span class="form-label">Startverdi</span>
        <input @input="dirty = true" type="number" v-model="$v.keyres.startValue.$model" />
      </label>
      <div class="form-field--error" v-if="$v.keyres.startValue.$error">Kan ikke være tom</div>

      <label class="form-field" :class="{ 'form-field--error': $v.keyres.targetValue.$error }">
        <span class="form-label">Målverdi</span>
        <input @input="dirty = true" type="number" v-model="$v.keyres.targetValue.$model" />
      </label>
      <div class="form-field--error" v-if="$v.keyres.targetValue.$error">Kan ikke være tom</div>
    </div>

    <label class="form-field" :class="{ 'form-field--error': $v.keyres.unit.$error }">
      <span class="form-label">Måleenhet</span>
      <input @input="dirty = true" type="text" v-model="$v.keyres.unit.$model" />
    </label>
    <div class="form-field--error" v-if="$v.keyres.unit.$error">Kan ikke være tom</div>

    <div v-if="keyres.auto">
      <hr />
      <div class="toggle__container">
        <span class="toggle__label">Automatisk (Google Sheets)</span>
        <label class="toggle">
          <input class="toggle__input" type="checkbox" disabled v-model="keyres.auto" />
          <span class="toggle__switch"></span>
        </label>
      </div>

      <hr />

      <label class="form-field">
        <span class="form-label">Google Sheet ID</span>
        <span class="form-help">Kode fra URL .../spreadsheets/d/<strong>&lt;id&gt;</strong></span>
        <input type="text" v-model="keyres.sheetId" />
      </label>

      <label class="form-field">
        <span class="form-label">Fane</span>
        <span class="form-help">Samme som navnet på fanen i Google Sheets</span>
        <input type="text" v-model="keyres.sheetName" />
      </label>

      <label class="form-field">
        <span class="form-label">Celle</span>
        <span class="form-help">For eksempel «A12»</span>
        <input type="text" v-model="keyres.sheetCell" />
      </label>
    </div>

    <hr />

    <button :disabled="!dirty" class="btn" @click="send">Lagre endringer</button>
    <button class="btn btn--danger" @click="deleteObject">Slett nøkkelresultat</button>

    <p v-if="showInfo">{{ info }}</p>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { required } from 'vuelidate/lib/validators';
import KeyResult from '@/db/keyresultHandler';

export default {
  name: 'EditKeyres',

  data: () => ({
    submit: false,
    showInfo: false,
    info: '',
    dirty: false,
    objective: null,
  }),

  validations: {
    keyres: {
      startValue: {
        required,
      },
      targetValue: {
        required,
      },
      unit: {
        required,
      },
      description: {
        required,
      },
    },
  },

  props: {
    keyres: {
      type: Object,
      required: true,
    },
  },

  computed: {
    ...mapState(['user']),
    updatedKeyRes() {
      return {
        description: this.keyres.description,
        edited: new Date(),
        editedBy: this.user.ref,
        startValue: +this.keyres.startValue,
        targetValue: +this.keyres.targetValue,
        unit: this.keyres.unit,
        sheetId: this.keyres.sheetId,
        sheetName: this.keyres.sheetName,
        sheetCell: this.keyres.sheetCell,
      };
    },
  },

  methods: {
    async send() {
      this.$v.$touch();

      if (this.$v.$invalid) {
        this.setSubmitInfo(false, true, 'Nødvendige felt kan ikke være tomme');
        return;
      }

      await KeyResult.update(this.keyres.ref, this.updatedKeyRes);
      this.setSubmitInfo(true, false, '');
      this.dirty = false;
    },

    async deleteObject() {
      await KeyResult.archive(this.keyres.ref);
      this.$emit('archived');
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
  width: 100%;
  margin-top: -1.5rem;
}

.toggle__container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
