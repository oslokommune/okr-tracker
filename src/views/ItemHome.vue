<template>
  <div class="item">
    <div class="main">
      <h2 class="title-2">Mål og nøkkelresultater</h2>

      <period-selector></period-selector>
      <action-bar></action-bar>

      <h3 class="title-4">Objectives</h3>
      <div v-if="loading">Skeleton UI</div>
      <div v-else>
        <ul v-if="objectives">
          <li v-for="objective in objectives" :key="objective.id">
            {{ objective.name }} ({{ objective.progression }})
          </li>
        </ul>
      </div>

      <h3 class="title-4">Key results</h3>
      <div v-if="loading">Skeleton UI</div>
      <div v-else>
        <ul v-if="keyResults">
          <li v-for="keyResult in keyResults" :key="keyResult.id">
            <router-link :to="{ name: 'KeyResultHome', params: { keyResultId: keyResult.id } }">
              {{ keyResult.name }} ({{ keyResult.progression }})
            </router-link>
          </li>
        </ul>
      </div>

      <h3 class="title-4">KPIs</h3>
      <div v-if="loading">Skeleton UI</div>
      <div v-else>
        <ul v-if="kpis">
          <li v-for="kpi in kpis" :key="kpi.id">{{ kpi.name }}</li>
        </ul>
      </div>

      <h3 class="title-4">Team</h3>
      <div v-if="loading">Skeleton UI</div>
      <div v-else>
        <ul v-if="activeItem.team">
          <li v-for="user in activeItem.team" :key="user.id">
            {{ user.email }}
            <span v-if="user.admin">(admin)</span>
          </li>
        </ul>
      </div>
    </div>

    <aside v-if="activeItem" class="widgets">
      <section v-if="activeItem.missionStatement" class="widget">
        <header class="widget__header">
          <span class="widget__icon fas fa-fw fa-file"></span>
          <span class="widget__title">Oppdrag</span>
          <span class="widget__toggle fas fa-fw fa-minus"></span>
        </header>
        <div class="widget__body">
          {{ activeItem.missionStatement }}
        </div>
      </section>
    </aside>

    <router-view></router-view>
  </div>
</template>

<script>
import routerGuards from '@/router/router-guards';
import { mapState } from 'vuex';

export default {
  data: () => ({
    loading: true,
  }),

  components: {
    PeriodSelector: () => import('@/components/Navigation/PeriodSelector.vue'),
    ActionBar: () => import('@/components/ActionBar.vue'),
  },

  computed: {
    ...mapState(['activeItem', 'objectives', 'keyResults', 'kpis']),
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
      await routerGuards.itemHome(to, from, next);
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

.widgets {
  @media screen and (min-width: bp(l)) {
    margin-left: span(0, 1, span(10));
  }

  @media screen and (min-width: bp(xl)) {
    margin-left: span(1, 2, span(10));
  }
}
</style>
