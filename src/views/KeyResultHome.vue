<template>
  <div class="keyres" v-if="activeKeyResult">
    <div class="main">
      <h1 class="title-2">{{ activeKeyResult.name }}</h1>

      <div class="second">
        <div class="second__value" style="display: flex; flex-direction: column;">
          <span>
            <i class="fas fa-chart-line"></i>
            Verdi
          </span>
          <div>{{ activeKeyResult.currentValue }} {{ activeKeyResult.unit }}</div>

          <button class="btn btn--borderless">Oppdater verdi</button>
        </div>

        <div class="second__graph">
          <i class="fas fa-chart-line"></i>
          Progresjon
          <svg class="graph" ref="graph"></svg>
        </div>
      </div>

      <h2 class="title-2">Historikk</h2>

      <table v-if="progress" class="table">
        <thead>
          <tr>
            <th>Verdi</th>
            <th>Dato</th>
            <th>Registrert av</th>
            <th></th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in progress" :key="p.id">
            <td>{{ p.value }}</td>
            <td>{{ formatDate(p.timestamp.toDate()) }}</td>
            <td>{{ p.createdBy.displayName || p.createdBy.id }}</td>
            <td v-if="p.comment"><i class="fa fa-comment-alt"></i></td>
            <td style="width: 1rem;">
              <button class="btn btn--borderless">
                <i class="far fa-trash-alt"></i>
                Slett
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <widgets></widgets>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { format } from 'date-fns';
import { db } from '@/config/firebaseConfig';
import Progress from '@/db/Progress';
import KeyResult from '@/db/KeyResult';
import LineChart from '@/util/LineChart';

export default {
  name: 'KeyResultHome',

  components: { Widgets: () => import('@/components/widgets/Widgets.vue') },
  data: () => ({
    progress: [],
    newValue: null,
    graph: null,
  }),

  async beforeRouteLeave(to, from, next) {
    try {
      await this.$store.dispatch('set_active_key_result', null);
      return next();
    } catch (error) {
      console.error(error);
      next(false);
    }
  },

  computed: {
    ...mapState(['activeKeyResult', 'activePeriod']),
  },

  mounted() {
    if (!this.$refs.graph) return;
    if (!this.activeKeyResult) return;

    this.graph = new LineChart(this.$refs.graph);
    this.graph.render(this.activeKeyResult, this.activePeriod, this.progress);
  },

  methods: {
    async change() {
      const { name, startValue, targetValue, description, unit, auto, weight } = this.activeKeyResult;
      await KeyResult.update(this.activeKeyResult.id, {
        name,
        startValue,
        targetValue,
        description,
        unit,
        auto,
        weight,
      });
    },

    async addValue() {
      await Progress.create(this.activeKeyResult.id, { value: +this.newValue });
      this.newValue = null;
    },
    remove(id) {
      Progress.remove(this.activeKeyResult.id, id);
    },

    formatDate(date) {
      return format(date, 'dd.MM.yyyy HH:mm');
    },
  },

  watch: {
    activeKeyResult: {
      immediate: true,
      async handler(keyresult) {
        if (!keyresult) return;
        await this.$bind('progress', db.collection(`keyResults/${keyresult.id}/progress`).orderBy('timestamp', 'desc'));

        if (this.graph) {
          this.graph.render(this.activeKeyResult, this.activePeriod, this.progress);
        }
      },
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/styles/_colors.scss';

.keyres {
  display: flex;
  flex-wrap: wrap;
}

.second {
  display: flex;
  width: 100%;
  margin-bottom: 2rem;

  &__value {
    align-self: flex-start;
    width: span(2, 0, span(7));
    margin-bottom: 0.5rem;

    padding: 1rem;
    background: white;
    box-shadow: 0 2px 3px rgba(black, 0.1);
  }

  &__graph {
    width: span(5, 0, span(7));

    margin-left: span(0, 1);
    padding: 1rem;
    background: white;
    box-shadow: 0 2px 3px rgba(black, 0.1);
  }
}

.main {
  width: span(12);

  @media screen and (min-width: bp(m)) {
    width: span(9, 0, span(9));
  }

  @media screen and (min-width: bp(l)) {
    width: span(7, 0, span(10));
  }

  @media screen and (min-width: bp(xl)) {
    width: span(6, 0, span(10));
  }
}

.group {
  margin-bottom: 1rem;
  background: white;
  box-shadow: 0 2px 2px rgba(black, 0.06);
}

.table,
.md table {
  width: 100%;
  margin: 2rem 0 1rem;
  border-bottom: 1px solid $color-border;

  th {
    font-weight: 500;
  }

  thead {
    th {
      border-top: none;
    }
  }

  th,
  td {
    height: 3rem;
    padding: 0 0.5rem;
    text-align: left;
    vertical-align: middle;
    border-top: 1px solid $color-border;
  }
}
</style>
