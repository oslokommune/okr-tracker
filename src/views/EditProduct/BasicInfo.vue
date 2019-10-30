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

      <button class="btn" :disabled="!edited || submit" @click="updateProductDetails">
        Lagre endringer
      </button>
      <p v-if="showInfo">{{ info }}</p>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

export default {
  data: () => ({
    edited: false,
    submit: false,
    showInfo: false,
    info: '',
  }),

  computed: {
    ...mapGetters(['getObjectById']),

    product() {
      return this.getObjectById(this.$route.params.id);
    },
  },
  methods: {
    ...mapActions(['updateObject', 'updateProductDetails']),

    updateProductDetails() {
      this.setSubmitInfo(true, false, '');
      this.updateProductDetails(this.product)
        .then(() => {
          this.updateObject({
            key: 'Products',
            data: this.product,
          });
        })
        .then(() => {
          this.edited = false;
          this.setSubmitInfo(false, false, '');
          this.$router.push({ name: 'product', params: { id: this.product.id } });
        })
        .catch(() => {
          this.edited = false;
          this.setSubmitInfo(false, true, 'Noe gikk galt');
        });
    },

    setSubmitInfo(submit, showInfo, info) {
      this.submit = submit;
      this.showInfo = showInfo;
      this.info = info;
    },
  },
};
</script>
