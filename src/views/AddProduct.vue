<template>
  <div class="container content">
    <h1 class="title-1">Legg til nytt produkt</h1>

    <div class="narrow">
      <label class="form-group">
        <span class="form-label">Produktnavn</span>
        <input type="text" v-model="newProduct.product" required />
      </label>
      <label class="form-group">
        <span class="form-label">Mission statement</span>
        <textarea v-model="newProduct.mission_statement"></textarea>
      </label>
      <span class="form-label">Avdeling</span>
      <v-select
        class="form-group objective__select"
        v-model="newProduct.department_id"
        label="id"
        :options="departments"
      ></v-select>
      <button class="btn" @click="send">Legg til</button>
    </div>
  </div>
</template>

<script>
import uniqid from 'uniqid';
import { mapActions, mapGetters } from 'vuex';

export default {
  data: () => ({
    newProduct: {
      id: uniqid(),
      product: '',
      department_id: null,
      mission_statement: '',
    },
  }),

  computed: {
    ...mapGetters(['departments']),
  },

  methods: {
    ...mapActions(['addProduct']),
    send() {
      this.addProduct(this.newProduct).then(() => {
        this.$router.push({ name: 'product', params: { id: this.newProduct.id } });
      });
    },
  },
};
</script>
