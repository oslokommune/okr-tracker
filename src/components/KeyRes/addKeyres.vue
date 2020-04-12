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
      <textarea v-model="$v.description.$model" rows="1" maxlength="120"></textarea>
    </label>
    <div class="form-field--error" v-if="$v.description.$error">{{ $t('validations.empty') }}</div>

    <label class="form-field" :class="{ 'form-field--error': $v.longDescription.$error }">
      <span class="form-label">{{ $t('keyres.longDescription') }}</span>
      <textarea v-model="$v.longDescription.$model" rows="4" maxlength="120"></textarea>
    </label>
    <div class="form-field--error" v-if="$v.longDescription.$error">{{ $t('validations.empty') }}</div>

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
      <input type="text" v-model="$v.unit.$model" maxlength="32" />
    </label>
    <div class="form-field--error" v-if="$v.unit.$error">{{ $t('validations.empty') }}</div>

    <hr />

    <div class="toggle__container">
      <span class="toggle__label">{{ $t('keyres.automation.header') }}</span>
      <label class="toggle">
        <input class="toggle__input" type="checkbox" v-model="auto" />
        <span class="toggle__switch"></span>
      </label>
    </div>

    <div v-if="auto">
      <p>
        <router-link :to="{ name: 'help' }">{{ $t('keyres.automation.readMore') }}</router-link>
      </p>

      <label class="form-field">
        <span class="form-label">{{ $t('keyres.automation.googleSheetId') }}</span>
        <span class="form-help" v-html="$t('keyres.automation.googleSheetIdHelp')"></span>
        <input type="text" v-model="sheetId" />
      </label>

      <label class="form-field">
        <span class="form-label">{{ $t('keyres.automation.sheetsTab') }}</span>
        <span class="form-help">{{ $t('keyres.automation.sheetsTabHelp') }}</span>
        <input type="text" v-model="sheetName" />
      </label>

      <label class="form-field">
        <span class="form-label">{{ $t('keyres.automation.sheetsCell') }}</span>
        <span class="form-help">{{ $t('keyres.automation.sheetsCellHelp') }}</span>
        <input type="text" v-model="sheetCell" />
      </label>
    </div>

    <hr />

    <button :disabled="submit" class="btn" @click="send">
      {{ $tc('validations.submit', null, { object: $t('keyres.name') }) }}
    </button>
    <button class="btn btn--ghost" @click="close">{{ $t('validations.stop') }}</button>
    <p v-if="showInfo">{{ info }}</p>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { required } from 'vuelidate/lib/validators';
import { serializeList } from '@/db/db';
import Keyresult from '@/db/keyresultHandler';
import i18n from '@/locale/i18n';

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
    longDescription: '',
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
    longDescription: {
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
        longDescription: this.longDescription,
        startValue: +this.startValue,
        targetValue: +this.targetValue,
        currentValue: +this.startValue,
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
        this.setSubmitInfo(false, true, i18n.t('validations.required'));
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
