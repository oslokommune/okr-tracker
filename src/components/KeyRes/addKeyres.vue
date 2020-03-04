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

    <div class="toggle__container">
      <span class="toggle__label">Automatisk registrering av progresjon</span>
      <label class="toggle">
        <input class="toggle__input" type="checkbox" v-model="auto" />
        <span class="toggle__switch"></span>
      </label>
    </div>

    <div v-if="auto">
      <p>
        <router-link :to="{ name: 'help' }">Les mer.</router-link>
      </p>

      <label class="form-field">
        <span class="form-label">Google Sheet ID</span>
        <span class="form-help">Kode fra URL .../spreadsheets/d/<strong>&lt;id&gt;</strong></span>
        <input type="text" v-model="sheetId" />
      </label>

      <label class="form-field">
        <span class="form-label">Fane</span>
        <span class="form-help">Samme som navnet på fanen i Google Sheets</span>
        <input type="text" v-model="sheetName" />
      </label>

      <label class="form-field">
        <span class="form-label">Celle</span>
        <span class="form-help">For eksempel «A12»</span>
        <input type="text" v-model="sheetCell" />
      </label>
    </div>

    <hr />

    <button :disabled="submit" class="btn" @click="send">Lagre nytt nøkkelresultat</button>
    <button class="btn btn--ghost" @click="close">Avbryt</button>
    <p v-if="showInfo">{{ info }}</p>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { required } from 'vuelidate/lib/validators';
import { serializeList } from '@/db/db';
import Keyresult from '@/db/keyresultHandler';

export default {
  name: 'AddKeyres',

  data: () => ({
    auto: false,
    objective: null,
    sheetId: '',
    sheetName: '',
    sheetCell: '',
    startValue: 0,
    targetValue: 100,
    description: '',
    unit: '',
    submit: false,
    showInfo: false,
    info: '',
    objectives: null,
    unsubscribe: null,
  }),

  props: {
    productref: {
      type: Object,
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
    ...mapState(['user', 'activePeriod']),
    newKeyRes() {
      return {
        archived: false,
        description: this.description,
        startValue: +this.startValue,
        targetValue: +this.targetValue,
        created: new Date(),
        createdBy: this.user.ref,
        auto: this.auto,
        sheetId: this.sheetId,
        sheetName: this.sheetName,
        sheetCell: this.sheetCell,
        edited: null,
        editedBy: null,
        unit: this.unit,
      };
    },
  },

  mounted() {
    if (!this.activePeriod) return;

    this.unsubscribe = this.productref
      .collection('objectives')
      .where('archived', '==', false)
      .where('period', '==', this.activePeriod.ref)
      .onSnapshot(snapshot => {
        this.objectives = serializeList(snapshot);
      });
  },

  beforeDestroy() {
    if (this.unsubscribe) this.unsubscribe();
  },

  methods: {
    async send() {
      this.$v.$touch();
      if (this.$v.$invalid) {
        this.setSubmitInfo(false, true, 'Nødvendige felt kan ikke være tomme');
      } else {
        this.setSubmitInfo(true, false, '');

        await Keyresult.create(this.objective.ref, this.newKeyRes).then(this.close);
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

.toggle__container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
