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
import { mapState } from 'vuex';
import uniqid from 'uniqid';
import { required, minValue } from 'vuelidate/lib/validators';
import { format } from 'date-fns';
import { getDateSpanFromQuarter } from '@/util/helpers';

export default {
  name: 'UpdateKeyres',

  data: () => ({
    date: new Date().toISOString().split('T')[0],
    newValue: 0,
    submitButton: '',
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

  updated() {
    console.log(this.$v);
  },

  methods: {
    addKeyResValue() {
      this.$v.$touch();
      if (this.$v.$invalid) {
        this.submitButton = 'ERROR';
      } else {
        this.submitButton = 'LOADING';
        this.$store
          .dispatch('addKeyResValue', {
            id: uniqid(),
            key_result_id: this.keyresId,
            value: +this.newValue,
            timestamp: this.date,
          })
          .then(() => {
            this.submitButton = 'OK';
            this.$router.push({
              name: 'keyres-value-details',
              params: {
                keyresId: this.keyresId,
              },
            });
          });
      }
    },
    formatDate(value) {
      return format(value, 'd/M/y');
    },
  },

  computed: {
    ...mapState(['chosenQuarter']),
    startDate() {
      return getDateSpanFromQuarter(this.chosenQuarter).startDate;
    },
    endDate() {
      return getDateSpanFromQuarter(this.chosenQuarter).endDate;
    },
    keyres() {
      return this.$store.getters.getObjectById(this.keyresId);
    },
    objective() {
      return this.$store.getters.getObjectById(this.keyres.objective_id);
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
