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
          <span>Team</span><br />
          <select v-model="newProduct.team_id">
            <option v-for="team in teams" :value="team.id" :key="team.id">{{
              team.Team
            }}</option>
          </select>
        </label>
      </li>
    </ul>
    <button @click="send">Legg til</button>
  </div>
</template>

<script>
import uniqid from "uniqid";
import { mapActions, mapGetters } from "vuex";

export default {
  data: () => ({
    newProduct: {
      id: uniqid(),
      product: "",
      team_id: null,
      mission_statement: ""
    }
  }),

  computed: {
    ...mapGetters(["teams"])
  },

  methods: {
    ...mapActions(["addProduct"]),
    send() {
      this.addProduct(this.newProduct).then(() => {
        this.newProduct = {
          id: null,
          product: "",
          team_id: null,
          mission_statement: ""
        };
      });
    }
  }
};
</script>
