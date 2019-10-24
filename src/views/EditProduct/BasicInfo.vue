<template>
  <div>
    <h1 class="title-2">Detaljer</h1>

    <div class="narrow content">
      <label class="form-group">
        <span class="form-label">Produktnavn</span>
        <input @input="edited = true" type="text" v-model="product.product" />
      </label>

      <label class="form-group">
        <span class="form-label">Oppdrag</span>
        <textarea @input="edited = true" v-model="product.mission_statement"></textarea>
      </label>

      <button class="btn" :disabled="!edited" @click="updateProductDetails">Lagre endringer</button>
    </div>
  </div>
</template>

<script>
export default {
  data: () => ({
    edited: false,
  }),

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
