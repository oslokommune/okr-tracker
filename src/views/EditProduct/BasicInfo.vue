<template>
  <div>
    <h1 class="title-2">Detaljer</h1>

    <div class="narrow content">
      <label class="form-group">
        <span class="form-label">Produktnavn</span>
        <input @input="edited = true" type="text" v-model="product.product" />
      </label>

      <label class="form-group">
        <span class="form-label">Produktbilde</span>
        <input @input="edited = true" type="text" v-model="product.product_image" />
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
import { mapActions } from 'vuex';

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
    ...mapActions(['updateObject']),
    updateProductDetails() {
      this.$store
        .dispatch('updateProductDetails', this.product)
        .then(() => {
          this.updateObject({
            key: 'Products',
            data: this.product,
          });
        })
        .then(() => {
          this.$router.push({ name: 'product', params: { id: this.product.id } });
        });
    },
  },
};
</script>
