<template>
  <div>
    <h2 class="title-2">Mål</h2>

    <div class="objective">
      <div>
        <span class="form-label">Kvartal</span>
        <v-select
          class="form-group objective__select"
          v-model="quarter"
          :value="quarter"
          :options="quarters"
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
import { mapGetters } from 'vuex';
import { getYear, getQuarter } from 'date-fns';
import AddObjective from '@/components/addObjective.vue';
import EditObjective from '@/components/editObjective.vue';

export default {
  components: {
    AddObjective,
    EditObjective,
  },

  data: () => ({
    quarter: `${getYear(new Date())} Q${getQuarter(new Date())}`,
  }),

  computed: {
    ...mapGetters(['getDistinctQuarters', 'getProductWithDistinctObjectives']),
    product() {
      if (this.quarter === '') {
        return this.$store.getters.getObjectById(this.$route.params.id);
      } else {
        return this.getProductWithDistinctObjectives(this.$route.params.id, this.quarter);
      }
    },

    quarters() {
      return this.getDistinctQuarters(this.$route.params.id);
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
