<template>
  <div class="container content">
    <h1 class="title-1">Legg til nytt produkt</h1>

    <div class="narrow">
      <label class="form-group" :class="{ 'form-group--error': $v.newProduct.product.$error }">
        <span class="form-label">Produktnavn*</span>
        <input type="text" v-model.trim="$v.newProduct.product.$model" required />
      </label>
      <div class="form-group--error" v-if="$v.newProduct.product.$error">Må være minimum 4 bokstaver</div>
      <label class="form-group" :class="{ 'form-group--error': $v.newProduct.mission_statement.$error }">
        <span class="form-label">Mission statement*</span>
        <textarea v-model.trim="$v.newProduct.mission_statement.$model"></textarea>
      </label>
      <div class="form-group--error" v-if="$v.newProduct.mission_statement.$error">Må være minimum 4 bokstaver</div>

      <span class="form-label" :class="{ 'form-group--error': $v.newProduct.department_id.$error }">Avdeling*</span>
      <v-select
        class="form-group objective__select"
        :class="{ 'form-group--error': $v.newProduct.department_id.$error }"
        v-model="$v.newProduct.department_id.$model"
        label="id"
        :options="departments"
      ></v-select>
      <div class="form-group--error" v-if="$v.newProduct.department_id.$error">Avdeling må være valgt</div>
      <button class="btn" @click="send">Legg til</button>
      <p v-if="submitButton === 'ERROR'">Nødvendige felt kan ikke være tomme</p>
    </div>
  </div>
</template>

<script>
import uniqid from 'uniqid';
import { mapActions, mapGetters } from 'vuex';
import { required, minLength } from 'vuelidate/lib/validators';

export default {
  data: () => ({
    newProduct: {
      id: uniqid(),
      product: '',
      department_id: null,
      mission_statement: '',
    },
    submitButton: '',
  }),

  validations: {
    newProduct: {
      product: {
        required,
        minLength: minLength(4),
      },
      mission_statement: {
        required,
        minLength: minLength(4),
      },
      department_id: {
        required,
      },
    },
  },

  computed: {
    ...mapGetters(['departments']),
  },

  methods: {
    ...mapActions(['addProduct', 'addObject']),
    send() {
      this.$v.$touch();
      if (this.$v.$invalid) {
        this.submitButton = 'ERROR';
      } else {
        this.submitButton = 'OK';
        this.addProduct(this.newProduct)
          .then(() => {
            this.addObject({
              key: 'Products',
              data: this.newProduct,
            });
          })
          .then(() => {
            this.$router.push({ name: 'product', params: { id: this.newProduct.id } });
          });
      }
    },
  },
};
</script>
