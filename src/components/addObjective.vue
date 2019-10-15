<template>
  <div>
    <h2>Legg til nytt mål</h2>

    <ul>
      <li>
        <label>
          <span>Produkt</span><br />
          <select v-model="newObjective.product_id">
            <option
              v-for="product in products"
              :value="product.id"
              :key="product.id"
              >{{ product.product }}</option
            >
          </select>
        </label>
      </li>

      <li>
        <label>
          <span>Mål</span><br />
          <textarea v-model="newObjective.objective"></textarea>
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
    newObjective: {
      id: uniqid(),
      objective: "",
      product_id: null
    }
  }),

  computed: {
    ...mapGetters(["products"])
  },

  methods: {
    ...mapActions(["addObjective"]),
    send() {
      this.addObjective(this.newObjective)
        .then(() => {
          this.newObjective = {
            id: uniqid(),
            objective: "",
            product_id: null
          };
        })
        .catch(e => {
          throw new Error(e);
        });
    }
  }
};
</script>
