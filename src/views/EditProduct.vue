<template>
  <div v-if="product">
    <router-link :to="{ name: 'product', params: { id: product.id } }">Tilbake</router-link>
    <h1>Endre {{ product.product }}</h1>

    <ul>
      <li>
        <label>
          <span>Produktnavn</span><br />
          <input @input="edited = true" type="text" v-model="product.product" />
        </label>
      </li>

      <li>
        <label>
          <span>Oppdrag</span><br />
          <textarea @input="edited = true" v-model="product.mission_statement"></textarea>
        </label>
      </li>
    </ul>

    <button :disabled="!edited" @click="updateProductDetails">Oppdater</button>

    <hr />

    <h2>Mål</h2>

    <ul>
      <li v-for="objective in product.children" :key="objective.id">
        <edit-objective :objective="objective"></edit-objective>
      </li>
    </ul>

    <add-objective :product_id="product.id"></add-objective>

    <hr />

    <h2>Nøkkelresultater</h2>

    <div v-for="objective in product.children" :key="objective.id">
      <ul>
        <li v-for="keyres in objective.children" :key="keyres.id">
          <edit-keyres :id="keyres.id"></edit-keyres>
        </li>
      </ul>
    </div>

    <add-keyres :product_id="product.id"></add-keyres>
  </div>
</template>

<script>
import AddObjective from '@/components/addObjective.vue';
import EditKeyres from '@/components/editKeyres.vue';
import AddKeyres from '@/components/addKeyres.vue';
import EditObjective from '@/components/editObjective.vue';

export default {
  name: 'Product',

  data: () => ({
    edited: false,
  }),

  components: {
    AddObjective,
    EditObjective,
    AddKeyres,
    EditKeyres,
  },

  computed: {
    product() {
      return this.$store.getters.getObjectById(this.$route.params.id);
    },
  },

  methods: {
    updateProductDetails() {
      this.$store.dispatch('updateProductDetails', this.product).then(() => {
        this.$router.push({ name: 'product', params: { id: this.product.id } });
      });
    },
  },
};
</script>
