<template>
  <div class="keyres">
    <div class="main">
      <h1 class="title-2">{{ activeKeyResult.name }}</h1>

      <div class="keyres__value">
        {{ activeKeyResult.currentValue }}
      </div>

      <div class="keyres__graph">
        <svg class="graph" ref="graph"></svg>
      </div>

      <form @submit.prevent="addValue">
        <input type="number" v-model.number="newValue" step="any" />
        <button>Send</button>
      </form>

      <ul>
        <li v-for="p in progress" :key="p.id">
          <strong>Verdi</strong><span>{{ p.value }}</span> <strong>Dato</strong
          ><span>{{ p.timestamp.toDate() }}</span>
        </li>
      </ul>
    </div>

    <widgets></widgets>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { db } from '@/config/firebaseConfig';
import Progress from '@/db/Progress';
import KeyResult from '@/db/KeyResult';
import { fromUnixTime } from 'date-fns';
import LineChart from '@/util/LineChart';

export default {
  name: 'KeyResultHome',

  components: { Widgets: () => import('@/components/widgets/Widgets.vue') },
  data: () => ({
    progress: [],
    newValue: null,
    graph: null,
  }),

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
    fromUnixToDate(created) {
      return fromUnixTime(created);
    },
  },

  watch: {
    activeKeyResult: {
      immediate: true,
      handler({ id }) {
        this.$bind('progress', db.collection(`keyResults/${id}/progress`).orderBy('timestamp', 'desc'));

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

  &__value {
    margin-bottom: 0.5rem;
    background: white;
    border: 1px solid $color-grey-100;
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
</style>
