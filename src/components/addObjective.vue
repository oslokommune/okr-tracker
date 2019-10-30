<template>
  <div v-if="expand" class="popout">
    <span class="form-label">Kvartal</span>
    <v-select
      class="form-group"
      :class="{ 'form-group--error': $v.quarter.$error }"
      :value="quarter"
      :options="availableQuarters"
      @input="setSelectedQuarter"
    ></v-select>
    <div class="form-group--error" v-if="$v.quarter.$error">Kan ikke være tom</div>
    <label class="form-group" :class="{ 'form-group--error': $v.title.$error }">
      <span class="form-label">Tittel</span>
      <input type="text" v-model="$v.title.$model" />
    </label>
    <div class="form-group--error" v-if="$v.title.$error">Kan ikke være tom</div>
    <label class="form-group" :class="{ 'form-group--error': $v.body.$error }">
      <span class="form-label">Beskrivelse</span>
      <textarea v-model="$v.body.$model" rows="4"></textarea>
    </label>
    <div class="form-group--error" v-if="$v.body.$error">Kan ikke være tom</div>
    <button :disabled="submitButton === 'LOADING'" class="btn" @click="send">Legg til</button>
    <button class="btn" @click="$emit('close-menu', false)">Lukk</button>
    <p v-if="submitButton === 'ERROR'">Nødvendige felt kan ikke være tomme</p>
    <p v-if="submitButton === 'FAILED'">Noe gikk galt</p>
  </div>
</template>

<script>
import { addQuarters, getYear, getQuarter } from 'date-fns';
import { required } from 'vuelidate/lib/validators';
import uniqid from 'uniqid';
import { mapActions, mapGetters, mapState } from 'vuex';

export default {
  data: () => ({
    title: '',
    quarter: '',
    body: '',
    submitButton: '',
  }),

  props: {
    productId: {
      type: String,
      required: true,
    },
    expand: {
      type: Boolean,
      required: true,
    },
  },

  validations: {
    title: {
      required,
    },
    quarter: {
      required,
    },
    body: {
      required,
    },
  },

  mounted() {
    this.quarter = this.chosenQuarter;
  },

  computed: {
    ...mapGetters(['products']),
    ...mapState(['chosenQuarter']),

    newObjective() {
      return {
        id: uniqid(),
        objective_title: this.title,
        objective_body: this.body,
        quarter: this.quarter,
        product_id: this.productId,
      };
    },

    availableQuarters() {
      let from = new Date(2019, 1, 1);
      const to = new Date();
      let quarters = [];
      // TODO: write less shit code
      while (to > from) {
        const year = getYear(from);
        const quarter = getQuarter(from);

        quarters.push(`${year} Q${quarter}`);
        from = addQuarters(from, 1);
      }

      quarters.push(`${getYear(from)} Q${getQuarter(from)}`);
      from = addQuarters(from, 1);
      quarters.push(`${getYear(from)} Q${getQuarter(from)}`);

      return quarters;
    },
  },

  methods: {
    ...mapActions(['addObjective', 'addObject']),
    setSelectedQuarter(value) {
      this.$v.quarter.$touch();
      this.quarter = value;
    },
    send() {
      this.$v.$touch();
      if (this.$v.$invalid) {
        this.submitButton = 'ERROR';
      } else {
        this.submitButton = 'LOADING';
        this.addObjective(this.newObjective)
          .then(() => {
            this.addObject({
              key: 'Objectives',
              data: this.newObjective,
            });
          })
          .then(() => {
            this.submitButton = 'OK';
            this.$emit('close-menu', false);
            this.title = '';
            this.body = '';
            this.quarter = '';
          })
          .catch(e => {
            this.submitButton = 'FAILED';
            throw new Error(e);
          });
      }
    },
  },
};
</script>
