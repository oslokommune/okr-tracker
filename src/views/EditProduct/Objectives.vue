<template>
  <div>
    <h2 class="title-2">Mål</h2>

    <add-objective :product-id="product.id"></add-objective>

    <ul class="grid-3">
      <li v-for="objective in product.children" :key="objective.id">
        <edit-objective :objective="objective"></edit-objective>
      </li>
    </ul>
  </div>
</template>

<script>
import AddObjective from '@/components/addObjective.vue';
import EditObjective from '@/components/editObjective.vue';

export default {
  components: {
    AddObjective,
    EditObjective,
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
