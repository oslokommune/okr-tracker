<template>
  <div class="card">
    <div class="text">
      <p class="pill">{{ objective.objective_title }}</p>
      <p>{{ keyres.key_result }}</p>
    </div>

    <div class="form">
      <label class="form-group" :class="{ 'form-group--error': $v.newValue.$error }">
        <span class="form-label">Fremdrift</span>
        <span class="form-help">{{ keyres.unit }}</span>
        <input type="number" v-model="$v.newValue.$model" />
      </label>
      <div class="form-group--error" v-if="$v.newValue.$error">
        Må være minimum 0
      </div>
      <label class="form-group" :class="{ 'form-group--error': $v.date.$error }">
        <span class="form-label">Dato</span>
        <span class="form-help">Hvilken dato gjelder verdien for?</span>
        <input type="date" v-model="$v.date.$model" />
      </label>
      <div class="form-group--error" v-if="$v.date.$error">
        Må være innenfor datoene: {{ formatDate(startDate) }} og {{ formatDate(endDate) }}
      </div>
      <button :disabled="submitButton === 'LOADING'" class="btn" @click="addKeyResValue">Oppdater fremdrift</button>
      <router-link :to="{ name: 'keyres-value-details', params: { keyresId } }" class="btn btn--ghost">
        Endre
      </router-link>
      <p v-if="submitButton === 'ERROR'">Nødvendige felt kan ikke være tomme</p>
      <p v-if="submitButton === 'FAILED'">Noe gikk galt</p>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex';
import uniqid from 'uniqid';
import { required, minValue } from 'vuelidate/lib/validators';
import { format } from 'date-fns';
import { getDateSpanFromQuarter } from '@/util/helpers';

export default {
  name: 'UpdateKeyres',

  data: () => ({
    date: new Date().toISOString().split('T')[0],
    newValue: 0,
    submit: false,
    showInfo: false,
    info: '',
  }),

  props: {
    keyresId: {
      type: String,
      required: true,
    },
  },

  validations: {
    newValue: {
      required,
      minValue: minValue(0),
    },
    date: {
      required,
      minValue(value) {
        return new Date(value).toISOString() > this.startDate.toISOString();
      },
      maxValue(value) {
        return new Date(value).toISOString() < this.endDate.toISOString();
      },
    },
  },

  mounted() {
    this.newValue = this.keyres.current_value;
  },

  methods: {
    ...mapActions(['addKeyResValue']),

    addKeyResValue() {
      this.$v.$touch();
      if (this.$v.$invalid) {
        this.setSubmitInfo(false, true, 'Nødvendige felt kan ikke være tomme');
      } else {
        this.setSubmitInfo(true, false, '');
        this.addKeyResValue({
          id: uniqid(),
          key_result_id: this.keyresId,
          value: +this.newValue,
          timestamp: this.date,
        })
          .then(() => {
            this.setSubmitInfo(false, false, '');
            this.$router.push({
              name: 'keyres-value-details',
              params: {
                keyresId: this.keyresId,
              },
            });
          })
          .catch(() => {
            this.setSubmitInfo(false, true, 'Noe gikk galt');
          });
      }
    },

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
    ...mapState(['chosenQuarter']),
    ...mapGetters(['getObjectById', 'getProductWithDistinctObjectives']),

    startDate() {
      return getDateSpanFromQuarter(this.chosenQuarter).startDate;
    },

    endDate() {
      return getDateSpanFromQuarter(this.chosenQuarter).endDate;
    },

    keyres() {
      return this.getObjectById(this.keyresId);
    },

    objective() {
      return this.getObjectById(this.keyres.objective_id);
    },
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
