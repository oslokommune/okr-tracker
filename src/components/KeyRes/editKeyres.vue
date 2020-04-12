<template>
  <div class="edit-keyres">
    <h3 class="title-3">{{ $t('keyres.change') }}</h3>
    <hr />

    <label class="form-field" :class="{ 'form-field--error': $v.keyres.description.$error }">
      <span class="form-label">{{ $t('keyres.description') }}</span>
      <textarea @input="dirty = true" v-model="$v.keyres.description.$model" rows="1" maxlength="120"></textarea>
    </label>
    <div class="form-field--error" v-if="$v.keyres.description.$error">{{ $t('validations.empty') }}</div>

    <label class="form-field" :class="{ 'form-field--error': $v.keyres.longDescription.$error }">
      <span class="form-label">{{ $t('keyres.longDescription') }}</span>
      <textarea @input="dirty = true" v-model="$v.keyres.longDescription.$model" rows="4" maxlength="120"></textarea>
    </label>
    <div class="form-field--error" v-if="$v.keyres.longDescription.$error">{{ $t('validations.empty') }}</div>
 
    <div class="form-row">
      <label class="form-field" :class="{ 'form-field--error': $v.keyres.startValue.$error }">
        <span class="form-label">{{ $t('keyres.startValue') }}</span>
        <input @input="dirty = true" type="number" v-model="$v.keyres.startValue.$model" />
      </label>
      <div class="form-field--error" v-if="$v.keyres.startValue.$error">{{ $t('validations.empty') }}</div>

      <label class="form-field" :class="{ 'form-field--error': $v.keyres.targetValue.$error }">
        <span class="form-label">{{ $t('keyres.targetValue') }}</span>
        <input @input="dirty = true" type="number" v-model="$v.keyres.targetValue.$model" />
      </label>
      <div class="form-field--error" v-if="$v.keyres.targetValue.$error">{{ $t('validations.empty') }}</div>
    </div>

    <label class="form-field" :class="{ 'form-field--error': $v.keyres.unit.$error }">
      <span class="form-label">{{ $t('keyres.unit') }}</span>
      <input @input="dirty = true" type="text" v-model="$v.keyres.unit.$model" maxlength="32" />
    </label>
    <div class="form-field--error" v-if="$v.keyres.unit.$error">{{ $t('validations.empty') }}</div>

    <div v-if="keyres.auto">
      <hr />
      <div class="toggle__container">
        <span class="toggle__label">{{ $t('keyres.automation.header') }}</span>
        <label class="toggle">
          <input class="toggle__input" type="checkbox" disabled v-model="keyres.auto" />
          <span class="toggle__switch"></span>
        </label>
      </div>

      <hr />

      <label class="form-field">
        <span class="form-label">{{ $t('keyres.automation.googleSheetId') }}</span>
        <span class="form-help" v-html="$t('keyres.automation.googleSheetIdHelp')"></span>
        <input type="text" v-model="keyres.sheetId" />
      </label>

      <label class="form-field">
        <span class="form-label">{{ $t('keyres.automation.sheetsTab') }}</span>
        <span class="form-help">{{ $t('keyres.automation.sheetsTabHelp') }}</span>
        <input type="text" v-model="keyres.sheetName" />
      </label>

      <label class="form-field">
        <span class="form-label">{{ $t('keyres.automation.sheetsCell') }}</span>
        <span class="form-help">{{ $t('keyres.automation.sheetsCellHelp') }}</span>
        <input type="text" v-model="keyres.sheetCell" />
      </label>
    </div>

    <hr />

    <button :disabled="!dirty" class="btn" @click="send">{{ $t('btn.saveChanges') }}</button>
    <button class="btn btn--danger" @click="deleteObject">{{ $t('keyres.delete') }}</button>

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
      longDescription: {
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
        longDescription: this.keyres.longDescription,
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
        this.setSubmitInfo(false, true, this.$t('validations.required'));
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
