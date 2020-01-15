<template>
  <div class="card">
    <div class="text">
      <p class="pill">{{ parentObjective.objective_title }}</p>
      <p>{{ keyres.key_result }}</p>
    </div>

    <div class="form">
      <label class="form-field" :class="{ 'form-field--error': $v.newValue.$error }">
        <span class="form-label">Fremdrift</span>
        <span class="form-help">{{ keyres.unit }}</span>
        <input type="number" v-model="$v.newValue.$model" />
      </label>
      <div class="form-field--error" v-if="$v.newValue.$error">
        Må være minimum 0
      </div>
      <label class="form-field" :class="{ 'form-field--error': $v.date.$error }">
        <span class="form-label">Dato</span>
        <span class="form-help">Hvilken dato gjelder verdien for?</span>
        <input type="date" v-model="$v.date.$model" />
      </label>
      <div class="form-field--error" v-if="$v.date.$error">
        Må være innenfor datoene: {{ formatDate(startDate) }} og {{ formatDate(endDate) }}
      </div>
      <button :disabled="submit" class="btn" @click="submitNewValue">Oppdater fremdrift</button>
      <router-link :to="{ name: 'keyres-value-details', params: { keyresId } }" class="btn btn--ghost">
        Endre
      </router-link>
      <p v-if="showInfo">{{ info }}</p>
    </div>
  </div>
</template>

<script>
import { required, minValue } from 'vuelidate/lib/validators';
import { format } from 'date-fns';
import { serializeDocument } from '../../util/db';

export default {
  name: 'UpdateKeyres',

  data: () => ({
    date: new Date().toISOString().split('T')[0],
    newValue: 0,
    submit: false,
    showInfo: false,
    info: '',
    parentObjective: null,
  }),

  props: {
    keyres: {
      type: Object,
      required: true,
    },
  },

  validations: {
    newValue: {
      required,
      minValue: minValue(0),
    },
    // date: {
    //   required,
    //   minValue(value) {
    //     return new Date(value).toISOString() > this.startDate.toISOString();
    //   },
    //   maxValue(value) {
    //     return new Date(value).toISOString() < this.endDate.toISOString();
    //   },
    // },
  },

  mounted() {
    this.keyres.ref.parent.parent.onSnapshot(document => {
      this.parentObjective = serializeDocument(document);
    });
    // this.newValue = this.keyres.current_value;
  },

  methods: {
    // submitNewValue() {
    //   this.$v.$touch();
    //   if (this.$v.$invalid) {
    //     this.setSubmitInfo(false, true, 'Nødvendige felt kan ikke være tomme');
    //   } else {
    //     this.setSubmitInfo(true, false, '');
    //     this.addKeyResValue({
    //       id: uniqid(),
    //       key_result_id: this.keyresId,
    //       value: +this.newValue,
    //       timestamp: this.date,
    //     })
    //       .then(() => {
    //         this.setSubmitInfo(false, false, '');
    //         this.getAllData();
    //         this.$router.push({
    //           name: 'keyres-value-details',
    //           params: {
    //             keyresId: this.keyresId,
    //           },
    //         });
    //       })
    //       .catch(() => {
    //         this.setSubmitInfo(false, true, 'Noe gikk galt');
    //       });
    //   }
    // },

    formatDate(value) {
      return format(value, 'd/M/y');
    },

    setSubmitInfo(submit, showInfo, info) {
      this.submit = submit;
      this.showInfo = showInfo;
      this.info = info;
    },
  },

  computed: {
    // objective() {
    //   return this.getObjectById(this.keyres.objective_id);
    // },
  },
};
</script>

<style lang="scss" scoped>
.card {
  display: flex;
  flex-direction: column;
}

.text {
  margin-bottom: 2rem;
}

.form {
  margin-top: auto;
  margin-bottom: 0;
}
</style>
