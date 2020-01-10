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
      <!-- <div class="add">
        <button class="btn btn--ghost" @click="expand = true" :disabled="expand">+ Legg til nytt mål</button>
        <add-objective
          :chosen-quarter="chosenQuarter"
          v-if="expand"
          @close-menu="closeMenu"
          :product-id="product.id"
        ></add-objective>
      </div> -->
    </div>
    <!-- <div class="content">

      <transition-group name="grid-animation" tag="div" class="grid-3">
        <edit-objective
          v-for="objective in product.children"
          :key="objective.id"
          :objective="objective"
          class="grid-animation-item"
        ></edit-objective>
      </transition-group>

    </div> -->
  </div>
</template>

<script>
import { mapState } from 'vuex';
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

  props: {
    docRef: {
      type: Object,
      required: true,
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

.grid-animation-item {
  display: inline-block;
  margin-right: 10px;
  transform: scaleX(1);
  transition: all 0.5s;
}
.grid-animation-enter, .grid-animation-leave-to
/* .list-complete-leave-active below version 2.1.8 */ {
  transform: scaleX(0);
  opacity: 0;
}
.grid-animation-leave-active {
  position: absolute;
}
</style>
