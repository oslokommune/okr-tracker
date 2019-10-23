<template>
  <div>
    <h2>Legg til nytt produkt</h2>

    <ul>
      <li>
        <label>
          <span>Produktnavn</span><br />
          <input type="text" v-model="newProduct.product" required />
        </label>
      </li>
      <li>
        <label>
          <span>Mission statement</span><br />
          <textarea v-model="newProduct.mission_statement"></textarea>
        </label>
      </li>

      <li>
        <label>
          <span>Avdeling</span><br />
          <select v-model="newProduct.department_id">
            <option v-for="department in departments" :value="department.id" :key="department.id">{{
              department.department
            }}</option>
          </select>
        </label>
      </li>
    </ul>
    <button @click="send">Legg til</button>
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
        this.newProduct = {
          id: null,
          product: '',
          team_id: null,
          mission_statement: '',
        };
      });
    },
  },
};
</script>
