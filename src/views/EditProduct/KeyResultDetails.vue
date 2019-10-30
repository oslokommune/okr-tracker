<template>
  <div>
    <h2 class="title-2">{{ keyres.key_result }}</h2>

    <div class="row">
      <h3 class="title-4">Del av mål</h3>
      <the-objective :objective="objective"></the-objective>
    </div>

    <div class="row">
      <h3 class="title-4">Utvikling gjennom {{ objective.quarter }}</h3>
      <svg class="graph" ref="graph"></svg>
    </div>

    <div class="keyres-details">
      <edit-keyres :key-res-object="keyres" :product-object="product"></edit-keyres>
      <div>
        <h3 class="title-3">Registrerte målepunkter</h3>
        <table class="table">
          <thead>
            <th>Dato</th>
            <th class="value">Verdi</th>
            <th class="delete"></th>
          </thead>
          <tbody>
            <tr v-for="val in keyres.children" :key="val.id">
              <td>{{ val.timestamp }}</td>
              <td class="value">{{ val.value }}</td>
              <td class="delete" @click="deleteValue(val)"><button class="btn btn--danger">Slett</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import TheObjective from '@/components/TheObjective.vue';
import EditKeyres from '@/components/editKeyres.vue';
import Linechart from '@/util/linechart';

export default {
  components: {
    EditKeyres,
    TheObjective,
  },

  data: () => ({
    chart: null,
  }),

  computed: {
    keyres() {
      return this.$store.getters.getObjectById(this.$route.params.keyresId);
    },
    objective() {
      return this.$store.getters.getObjectById(this.keyres.objective_id);
    },
    product() {
      return this.$store.getters.getProductWithDistinctObjectives(
        this.objective.product_id,
        this.$store.state.chosenQuarter
      );
    },
  },

  mounted() {
    this.chart = new Linechart(this.$refs.graph);
    this.chart.render(this.keyres, this.objective.quarter);
  },

  updated() {
    this.chart.render(this.keyres, this.objective.quarter);
  },

  methods: {
    deleteValue(val) {
      this.$store.dispatch('deleteKeyResValue', val);
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../../styles/_colors.scss';

.table {
  thead th {
    font-weight: bold;
    text-align: left;
    background: $color-light-blue;
  }

  .value {
    width: 100px;
    text-align: right;
  }

  .delete {
    width: 100px;
  }

  th,
  td {
    padding: 0.5rem 0.75rem;
  }

  tbody td {
    border-bottom: 1px solid $color-border;
  }
}

.keyres-details {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
}
</style>
