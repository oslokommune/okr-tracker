<template>
  <div class="item">
    <div class="main">
      <kpis v-if="kpis.length" :kpis="kpis"></kpis>

      <h2 class="title-2">Mål og nøkkelresultater</h2>
      <period-selector></period-selector>
      <action-bar></action-bar>

      <div v-if="loading">Skeleton UI</div>
      <div v-else>
        <ul v-if="tree">
          <li v-for="objective in tree" :key="objective.id" class="group">
            <ObjectiveRow :objective="objective"></ObjectiveRow>
            <ul v-if="objective.keyResults">
              <li v-for="keyResult in objective.keyResults" :key="keyResult.id">
                <KeyResultRow :key-result="keyResult"></KeyResultRow>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </div>

    <Widgets></Widgets>

    <router-view></router-view>
  </div>
</template>

<script>
import { itemHome as routerGuard } from '@/router/router-guards';
import { mapState } from 'vuex';

export default {
  data: () => ({
    loading: true,
  }),

  components: {
    PeriodSelector: () => import('@/components/Navigation/PeriodSelector.vue'),
    ActionBar: () => import('@/components/ActionBar.vue'),
    Widgets: () => import('@/components/widgets/Widgets.vue'),
    Kpis: () => import('@/components/Kpis.vue'),
    ObjectiveRow: () => import('@/components/ObjectiveRow.vue'),
    KeyResultRow: () => import('@/components/KeyResultRow.vue'),
  },

  computed: {
    ...mapState(['activeItem', 'objectives', 'keyResults', 'kpis']),

    tree() {
      return this.objectives.map(objective => {
        objective.keyResults = this.keyResults.filter(keyRes => {
          return keyRes.objective === `objectives/${objective.id}`;
        });
        return objective;
      });
    },
  },

  mounted() {
    this.loading = false;
  },

  async beforeRouteLeave(to, from, next) {
    this.loading = true;
    next();
  },

  async beforeRouteUpdate(to, from, next) {
    this.loading = true;
    if (to.params.slug !== from.params.slug) {
      await routerGuard(to, from, next);
      this.loading = false;
    } else {
      this.loading = false;
      next();
    }
  },
};
</script>

<style lang="scss" scoped>
.item {
  display: flex;
  flex-wrap: wrap;
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
