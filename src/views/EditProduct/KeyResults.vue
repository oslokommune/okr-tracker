<template>
  <div>
    <h2 class="title-2">Nøkkelresultater</h2>

    <add-keyres :product-id="product.id"></add-keyres>
    <div class="content" v-for="objective in product.children" :key="objective.id">
      <ul>
        <li v-for="keyres in objective.children" :key="keyres.id">
          <edit-keyres :id="keyres.id"></edit-keyres>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import AddKeyres from '@/components/addKeyres.vue';
import EditKeyres from '@/components/editKeyres.vue';

export default {
  components: {
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
