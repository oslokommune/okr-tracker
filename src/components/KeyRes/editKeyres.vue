<template>
  <div class="edit-keyres">
    <h3 class="title-3">Endre nøkkelresultat</h3>
    <hr />

    <label class="form-field" :class="{ 'form-field--error': $v.keyres.key_result.$error }">
      <span class="form-label">Beskriv nøkkelresultatet</span>
      <textarea @input="dirty = true" v-model="$v.keyres.key_result.$model" rows="4"></textarea>
    </label>
    <div class="form-field--error" v-if="$v.keyres.key_result.$error">Kan ikke være tom</div>

    <div class="form-row">
      <label class="form-field" :class="{ 'form-field--error': $v.keyres.start_value.$error }">
        <span class="form-label">Startverdi</span>
        <input @input="dirty = true" type="number" v-model="$v.keyres.start_value.$model" />
      </label>
      <div class="form-field--error" v-if="$v.keyres.start_value.$error">Kan ikke være tom</div>

      <label class="form-field" :class="{ 'form-field--error': $v.keyres.target_value.$error }">
        <span class="form-label">Målverdi</span>
        <input @input="dirty = true" type="number" v-model="$v.keyres.target_value.$model" />
      </label>
      <div class="form-field--error" v-if="$v.keyres.target_value.$error">Kan ikke være tom</div>
    </div>

    <label class="form-field" :class="{ 'form-field--error': $v.keyres.unit.$error }">
      <span class="form-label">Måleenhet</span>
      <input @input="dirty = true" type="text" v-model="$v.keyres.unit.$model" />
    </label>
    <div class="form-field--error" v-if="$v.keyres.unit.$error">Kan ikke være tom</div>

    <hr />

    <button :disabled="!dirty || submit" class="btn" @click="send">Lagre endringer</button>
    <button class="btn btn--danger" @click="deleteObject">Slett nøkkelresultat</button>

    <p v-if="showInfo">{{ info }}</p>
  </div>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import * as Toast from '@/util/toasts';
import { serializeDocument } from '../../util/db';

export default {
  data: () => ({
    submit: false,
    showInfo: false,
    info: '',
    dirty: false,
    objective: null,
  }),

  mounted() {
    this.keyres.ref.parent.parent.onSnapshot(document => {
      this.parentObjective = serializeDocument(document);
    });
  },

  validations: {
    keyres: {
      start_value: {
        required,
      },
      target_value: {
        required,
      },
      unit: {
        required,
      },
      key_result: {
        required,
      },
      objective: {
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
    updatedKeyRes() {
      return {
        key_result: this.keyres.key_result,
        start_value: this.keyres.start_value,
        target_value: this.keyres.target_value,
        target_type: this.keyres.target_type,
        unit: this.keyres.unit,
      };
    },
  },

  methods: {
    send() {
      this.$v.$touch();
      if (this.$v.$invalid) {
        this.setSubmitInfo(false, true, 'Nødvendige felt kan ikke være tomme');
      } else {
        this.setSubmitInfo(true, false, '');
        this.updateKeyRes(this.updatedKeyRes)
          .then(() => {
            this.setSubmitInfo(false, false, '');
          })
          .catch(e => {
            this.setSubmitInfo(false, true, 'Noe gikk galt');
            throw new Error(e);
          });
      }
    },

    async deleteObject() {
      await this.keyres.ref
        .update({ archived: true })
        .then(Toast.deletedRegret.bind(null, { ref: this.keyres.ref }))
        .catch(Toast.error);

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
