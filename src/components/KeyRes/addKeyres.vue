<template>
  <div class="popout">
    <span class="form-label">{{ $t('keyres.objective') }}</span>
    <v-select
      v-if="objectives"
      class="form-field objective__select"
      :class="{ 'form-field--error': $v.objective.$error }"
      label="name"
      v-model="$v.objective.$model"
      :options="objectives"
    ></v-select>

    <div class="form-field--error" v-if="$v.objective.$error">{{ $t('validations.empty') }}</div>

    <label class="form-field" :class="{ 'form-field--error': $v.description.$error }">
      <span class="form-label">{{ $t('keyres.description') }}</span>
      <textarea v-model="$v.description.$model" rows="4"></textarea>
    </label>
    <div class="form-field--error" v-if="$v.description.$error">{{ $t('validations.empty') }}</div>

    <div class="form-row">
      <label class="form-field" :class="{ 'form-field--error': $v.startValue.$error }">
        <span class="form-label">{{ $t('keyres.startValue') }}</span>
        <input type="number" v-model="$v.startValue.$model" />
      </label>
      <div class="form-field--error" v-if="$v.startValue.$error">{{ $t('validations.empty') }}</div>

      <label class="form-field" :class="{ 'form-field--error': $v.targetValue.$error }">
        <span class="form-label">{{ $t('keyres.targetValue') }}</span>
        <input type="number" v-model="$v.targetValue.$model" />
      </label>
      <div class="form-field--error" v-if="$v.targetValue.$error">{{ $t('validations.empty') }}</div>
    </div>

    <label class="form-field" :class="{ 'form-field--error': $v.unit.$error }">
      <span class="form-label">{{ $t('keyres.unit') }}</span>
      <span class="form-help">{{ $t('keyres.unitDescription') }}</span>
      <input type="text" v-model="$v.unit.$model" />
    </label>
    <div class="form-field--error" v-if="$v.unit.$error">{{ $t('validations.empty') }}</div>

    <hr />

    <button :disabled="submit" class="btn" @click="send">
      {{ $tc('validations.submit', null, { object: 'nøkkelresultat' }) }}
    </button>
    <button class="btn btn--ghost" @click="close">{{ $t('validations.stop') }}</button>
    <p v-if="showInfo">{{ info }}</p>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { required } from 'vuelidate/lib/validators';
import { serializeDocument } from '@/db/db';
import Keyresult from '@/db/keyresultHandler';

export default {
  name: 'AddKeyres',

  data: () => ({
    objective: null,
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
        created: new Date(),
        createdBy: this.user.ref,
        edited: null,
        editedBy: null,
        unit: this.unit,
      };
    },
  },

  mounted() {
    this.unsubscribe = this.productref
      .collection('objectives')
      .where('quarter', '==', this.selectedQuarterName)
      .where('archived', '==', false)
      .onSnapshot(snapshot => {
        this.objectives = snapshot.docs.map(serializeDocument);
      });
  },

  beforeDestroy() {
    if (this.unsubscribe) this.unsubscribe();
  },

  methods: {
    send() {
      this.$v.$touch();
      if (this.$v.$invalid) {
        this.setSubmitInfo(false, true, this.$i18n.t('validations.required'));
      } else {
        this.setSubmitInfo(true, false, '');

        Keyresult.create(this.objective.ref, this.newKeyRes).then(this.close);
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
