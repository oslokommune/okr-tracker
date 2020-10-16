<template>
  <div class="keyres" v-if="activeKeyResult">
    <div class="main">
      <h1 class="title-2">{{ activeKeyResult.name }}</h1>

      <div class="main-widgets">
        <div class="main-widgets__current main-widgets__current__children">
          <h3 class="main-widgets__title">
            <i class="fas fa-chart-line"></i>
            Verdi
          </h3>
          <div class="main-widgets__current__value">
            {{ activeKeyResult.currentValue }}
          </div>

          <div class="main-widgets__current__unit">
            {{ activeKeyResult.unit }}
          </div>

          <button @click="isOpen = true" class="btn btn--ter">Oppdater verdi</button>
        </div>

        <div class="main-widgets__graph">
          <h3 class="main-widgets__title">
            <i class="fas fa-chart-line"></i>
            Progresjon
          </h3>

          <svg class="graph" ref="graph"></svg>
        </div>
      </div>

      <h2 class="title-2">Historikk</h2>

      <div class="main__table">
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
              <td><i v-if="p.comment" class="fa fa-comment-alt"></i></td>
              <td v-if="hasEditPermissions" style="width: 1rem">
                <button @click="remove(p.id)" class="btn btn--ter btn--icon">
                  <i class="icon far fa-trash-alt"></i>
                  Slett
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <widgets-key-result-home></widgets-key-result-home>

    <modal v-if="isOpen" @close="closeModal" :keyres="activeKeyResult"></modal>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { format } from 'date-fns';
import { db } from '@/config/firebaseConfig';
import Progress from '@/db/Progress';
import KeyResult from '@/db/KeyResult';
import LineChart from '@/util/LineChart';
import routerGuard from '@/router/router-guards/keyResultHome';

export default {
  name: 'KeyResultHome',

  components: {
    WidgetsKeyResultHome: () => import('@/components/widgets/WidgetsKeyResultHome.vue'),
    Modal: () => import('@/components/Modal.vue'),
  },
  data: () => ({
    progress: [],
    newValue: null,
    graph: null,
    isOpen: false,
  }),

  beforeRouteUpdate: routerGuard,

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
    ...mapState(['activeKeyResult', 'activePeriod', 'user', 'activeItem']),
  },

  mounted() {
    if (!this.$refs.graph) return;
    if (!this.activeKeyResult) return;

    this.graph = new LineChart(this.$refs.graph);
    this.graph.render(this.activeKeyResult, this.activePeriod, this.progress);
  },

  methods: {
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

    hasEditPermissions() {
      return this.user.admin || this.activeItem.team.includes(this.user);
    },

    closeModal() {
      this.isOpen = false;
    },
  },

  watch: {
    activeKeyResult: {
      immediate: true,
      async handler(keyresult) {
        if (!keyresult) return;
        await this.$bind('progress', db.collection(`keyResults/${keyresult.id}/progress`).orderBy('timestamp', 'desc'));

        this.graph = new LineChart(this.$refs.graph);
        this.graph.render(this.activeKeyResult, this.activePeriod, this.progress);
      },
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/styles/_colors.scss';
@import '@/styles/typography.scss';

.keyres {
  display: flex;
  flex-wrap: wrap;
}

.main-widgets {
  display: flex;
  width: 100%;
  margin-bottom: 2rem;

  &__title {
    margin-bottom: 0.5rem;
    color: $color-grey-400;
    font-weight: 500;
    font-size: $font-size-0;
    text-transform: uppercase;
  }

  &__current {
    align-self: flex-start;
    width: span(3);
    margin-bottom: 0.5rem;

    padding: 1rem;
    background: white;
    box-shadow: 0 2px 3px rgba(black, 0.1);

    @media screen and (min-width: bp(m)) {
      width: span(2, 0, span(9));
    }

    @media screen and (min-width: bp(l)) {
      width: span(2, 0, span(7));
    }

    &__value {
      color: $color-yellow;
      font-weight: 700;
      font-size: 50px;
    }

    &__unit {
      margin-top: -0.5rem;
      margin-bottom: 0.5rem;
      font-weight: 500;
      text-transform: capitalize;
    }

    &__children {
      display: flex;
      flex-direction: column;
    }
  }

  &__graph {
    width: span(9);

    margin-left: span(0, 1);
    padding: 1rem;
    background: white;
    box-shadow: 0 2px 3px rgba(black, 0.1);

    @media screen and (min-width: bp(m)) {
      width: span(7, 0, span(9));
      margin-left: span(0, 1, span(9));
    }

    @media screen and (min-width: bp(l)) {
      width: span(5, 0, span(7));
      margin-left: span(0, 1, span(7));
    }

    @media screen and (min-width: bp(xl)) {
      width: span(5, 0, span(7));
      margin-left: span(0, 1, span(7));
    }
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

.main__table {
  width: 100%;
  overflow: auto;
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
