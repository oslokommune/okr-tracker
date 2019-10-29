<template>
  <div>
    <h2 class="title-2">Nøkkelresultater</h2>

    <add-keyres :product-id="product.id"></add-keyres>
    <div class="content" v-for="objective in product.children" :key="objective.id">
      <div class="grid-3">
        <update-keyres v-for="keyres in objective.children" :key="keyres.id" :keyres-id="keyres.id"></update-keyres>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import AddKeyres from '@/components/addKeyres.vue';
import UpdateKeyres from '@/components/updateKeyres.vue';

export default {
  components: {
    AddKeyres,
    UpdateKeyres,
  },

  computed: {
    ...mapGetters(['getProductWithDistinctObjectives']),
    ...mapState(['chosenQuarter']),
    product() {
      return this.getProductWithDistinctObjectives(this.$route.params.id, this.chosenQuarter);
    },
  },
};
</script>
