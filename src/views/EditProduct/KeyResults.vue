<template>
  <div>
    <h2 class="title-2">Nøkkelresultater</h2>

    <div class="row add">
      <button class="btn btn--ghost" @click="expand = true" :disabled="expand">+ Legg til nytt nøkkelresultat</button>
      <add-keyres v-if="expand" :product-id="product.id" @close-menu="closeMenu"></add-keyres>
    </div>
    <div class="content" v-for="objective in product.children" :key="objective.id">
      <div class="grid-3">
        <update-keyres v-for="keyres in objective.children" :key="keyres.id" :keyres-id="keyres.id"></update-keyres>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import AddKeyres from '@/components/KeyRes/addKeyres.vue';
import UpdateKeyres from '@/components/KeyRes/updateKeyres.vue';

export default {
  components: {
    AddKeyres,
    UpdateKeyres,
  },

  data: () => ({
    expand: false,
  }),

  computed: {
    ...mapGetters(['getProductWithDistinctObjectives']),
    ...mapState(['chosenQuarter']),

    product() {
      return this.getProductWithDistinctObjectives(this.$route.params.id, this.chosenQuarter);
    },
  },

  methods: {
    closeMenu(value) {
      this.expand = value;
    },
  },
};
</script>

<style lang="scss" scoped>
.add {
  position: relative;
  margin: 2rem 0;
}
</style>
