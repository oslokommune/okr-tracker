<template>
  <div>
    <h2 class="title-2">Mål</h2>

    <div class="objective">
      <div>
        <span class="form-label">Kvartal</span>
        <v-select
          class="form-group objective__select"
          :value="chosenQuarter"
          :options="quarters"
          @input="setSelectedQuarter"
        ></v-select>
      </div>
      <add-objective :product-id="product.id"></add-objective>
    </div>
    <div class="content">
      <ul class="grid-3">
        <li v-for="objective in product.children" :key="objective.id">
          <edit-objective :objective="objective"></edit-objective>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions, mapState } from 'vuex';
import AddObjective from '@/components/addObjective.vue';
import EditObjective from '@/components/editObjective.vue';

export default {
  components: {
    AddObjective,
    EditObjective,
  },

  computed: {
    ...mapGetters(['getDistinctQuarters', 'getProductWithDistinctObjectives']),
    ...mapState(['chosenQuarter']),
    product() {
      if (this.chosenQuarter === '') {
        return this.$store.getters.getObjectById(this.$route.params.id);
      } else {
        return this.getProductWithDistinctObjectives(this.$route.params.id, this.chosenQuarter);
      }
    },

    quarters() {
      return this.getDistinctQuarters(this.$route.params.id);
    },
  },
  methods: {
    ...mapActions(['setChosenQuarter']),
    updateProductDetails() {
      this.$store.dispatch('updateProductDetails', this.product).then(() => {
        this.$router.push({ name: 'product', params: { id: this.product.id } });
      });
    },
    setSelectedQuarter(value) {
      this.setChosenQuarter(value);
    },
  },
};
</script>

<style lang="scss" scoped>
.objective {
  display: flex;
  align-items: center;

  &__select {
    min-width: 200px;
    margin-right: 1rem;
    transform: translateY(-3px);
  }
}
</style>
