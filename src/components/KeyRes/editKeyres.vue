<template>
  <div class="edit-keyres">
    <h3 class="title-3">{{ $t('keyres.change') }}</h3>
    <hr />

    <label class="form-field" :class="{ 'form-field--error': $v.keyres.description.$error }">
      <span class="form-label">{{ $t('keyres.description') }}</span>
      <textarea @input="dirty = true" v-model="$v.keyres.description.$model" rows="4"></textarea>
    </label>
    <div class="form-field--error" v-if="$v.keyres.description.$error">{{ $t('validations.empty') }}</div>

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
      <input @input="dirty = true" type="text" v-model="$v.keyres.unit.$model" />
    </label>
    <div class="form-field--error" v-if="$v.keyres.unit.$error">{{ $t('validations.empty') }}</div>

    <hr />

    <button :disabled="!dirty" class="btn" @click="send">{{ $t('keyres.saveChanges') }}</button>
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
      };
    },
  },

  methods: {
    async send() {
      this.$v.$touch();

      if (this.$v.$invalid) {
        this.setSubmitInfo(false, true, this.$i18n.t('validations.required'));
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
</style>
