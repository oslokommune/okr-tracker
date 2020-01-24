<template>
  <div>
    <h2 class="title-2">{{ keyres.key_result }}</h2>

    <div class="grid">
      <div class="objective">
        <h3 class="title-4">Del av mål</h3>
        <the-objective :objective="objective"></the-objective>
      </div>

      <div class="progression">
        <h3 class="title-4">Utvikling gjennom {{ objective.quarter }}</h3>
        <svg class="graph" ref="graph"></svg>
        <resize-observer @notify="handleResize" />
      </div>

      <!-- <edit-keyres :key-res-object="keyres" :product-object="product" class="update"></edit-keyres> -->
      <div class="values">
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
import { mapActions, mapGetters, mapState } from 'vuex';
import TheObjective from '../../components/Objective/TheObjective.vue';
import Linechart from '../../util/linechart';

export default {
  name: 'KeyResultDetails',

  components: {
    // EditKeyres,
    TheObjective,
  },

  data: () => ({
    chart: null,
  }),

  computed: {
    ...mapGetters(['getObjectById', 'getProductWithDistinctObjectives']),
    ...mapState(['chosenQuarter']),

    keyres() {
      return this.getObjectById(this.$route.params.keyresId);
    },

    objective() {
      return this.getObjectById(this.keyres.objective_id);
    },

    product() {
      return this.getProductWithDistinctObjectives(this.objective.product_id, this.chosenQuarter);
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
    ...mapActions(['deleteKeyResValue', 'undoKeyResValueDeletion']),

    handleResize() {
      this.chart.render(this.keyres, this.objective.quarter);
    },

    deleteValue(val) {
      this.deleteKeyResValue(val).then(() => {
        this.$toasted.show(`Slettet verdi`, {
          action: [
            {
              text: 'Angre',
              onClick: (e, toastObject) => {
                val.archived = '';
                this.undoKeyResValueDeletion(val).then(() => {
                  toastObject.goAway(0);
                });
              },
            },
            {
              text: 'Lukk',
              onClick: (e, toastObject) => {
                toastObject.goAway(0);
              },
            },
          ],
        });
      });
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../../styles/_colors.scss';

.table {
  width: 100%;
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

.grid {
  display: grid;
  grid-auto-rows: auto;
  grid-gap: 2rem;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}

.objective {
  // grid-column: 3;
}

.progression {
  grid-row: 1;
  grid-column: 1 / -1;
}
</style>
