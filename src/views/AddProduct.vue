<template>
  <div class="container content">
    <h1 class="title-1">Legg til nytt produkt</h1>

    <div class="narrow">
      <label class="form-group" :class="{ 'form-group--error': $v.product.$error }">
        <span class="form-label">Produktnavn*</span>
        <input type="text" v-model.trim="$v.product.$model" required />
      </label>
      <div class="form-group--error" v-if="$v.product.$error">Må være minimum 4 bokstaver</div>
      <label class="form-group" :class="{ 'form-group--error': $v.mission_statement.$error }">
        <span class="form-label">Mission statement*</span>
        <textarea v-model.trim="$v.mission_statement.$model"></textarea>
      </label>
      <div class="form-group--error" v-if="$v.mission_statement.$error">Må være minimum 4 bokstaver</div>

      <span class="form-label" :class="{ 'form-group--error': $v.department.$error }">Avdeling*</span>
      <v-select
        class="form-group objective__select"
        :class="{ 'form-group--error': $v.department.$error }"
        v-model="$v.department.$model"
        label="id"
        :options="departments"
      ></v-select>
      <div class="form-group--error" v-if="$v.department.$error">Avdeling må være valgt</div>
      <button :disabled="submitButton === 'LOADING'" class="btn" @click="send">Legg til</button>
      <p v-if="submitButton === 'ERROR'">Nødvendige felt kan ikke være tomme</p>
      <p v-if="submitButton === 'FAILED'">Noe gikk galt</p>
    </div>
  </div>
</template>

<script>
import uniqid from 'uniqid';
import { mapActions, mapGetters } from 'vuex';
import { required, minLength } from 'vuelidate/lib/validators';

export default {
  data: () => ({
    id: uniqid(),
    product: '',
    department: null,
    mission_statement: '',
    submitButton: '',
  }),

  validations: {
    product: {
      required,
      minLength: minLength(4),
    },
    mission_statement: {
      required,
      minLength: minLength(4),
    },
    department: {
      required,
    },
  },

  computed: {
    ...mapGetters(['departments']),
    newProduct() {
      return {
        id: uniqid(),
        product: this.product,
        department_id: this.department.id,
        mission_statement: this.mission_statement,
      };
    },
  },

  methods: {
    ...mapActions(['addProduct', 'addObject']),
    send() {
      this.$v.$touch();
      if (this.$v.$invalid) {
        this.submitButton = 'ERROR';
      } else {
        this.submitButton = 'LOADING';
        this.addProduct(this.newProduct)
          .then(() => {
            this.addObject({
              key: 'Products',
              data: this.newProduct,
            });
          })
          .then(() => {
            this.submitButton = 'OK';
            this.$router.push({ name: 'product', params: { id: this.newProduct.id } });
          })
          .catch(() => {
            this.submitButton = 'FAILED';
          });
      }
    },
  },
};
</script>
