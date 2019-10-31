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
      <div class="add">
        <button class="btn btn--ghost" @click="expand = true" :disabled="expand">+ Legg til nytt mål</button>
        <add-objective
          :chosen-quarter="chosenQuarter"
          v-if="expand"
          @close-menu="closeMenu"
          :product-id="product.id"
        ></add-objective>
      </div>
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
import AddObjective from '@/components/Objective/addObjective.vue';
import EditObjective from '@/components/Objective/editObjective.vue';

export default {
  components: {
    AddObjective,
    EditObjective,
  },

  data: () => ({
    expand: false,
  }),

  computed: {
    ...mapGetters(['getDistinctQuarters', 'getProductWithDistinctObjectives', 'getObjectById']),
    ...mapState(['chosenQuarter']),

    product() {
      if (this.chosenQuarter === '') {
        return this.getObjectById(this.$route.params.id);
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

    setSelectedQuarter(value) {
      this.setChosenQuarter(value);
    },

    closeMenu(value) {
      this.expand = value;
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

.add {
  position: relative;
  margin: 2rem 0;
}
</style>
