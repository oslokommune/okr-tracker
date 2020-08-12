<template>
  <div>
    <h1 class="title-1">
      <span v-if="loading">#######</span>
      <span v-else>{{ activeItem.name }}</span>
    </h1>

    <h3 class="title-4">Periods</h3>
    <div v-if="loading">Skeleton</div>
    <div v-else>
      <ul v-if="periods && activePeriod">
        <li v-for="period in periods" :key="period.id">
          <button @click="set_active_period_and_data(period.id)" :disabled="period.id === activePeriod.id">
            {{ period.name }} ({{ period.progression }})
          </button>
        </li>
      </ul>
    </div>

    <h3 class="title-4">Objectives</h3>
    <div v-if="loading">Skeleton UI</div>
    <div v-else>
      <ul v-if="objectives">
        <li v-for="objective in objectives" :key="objective.id">{{ objective.name }} ({{ objective.progression }})</li>
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

    <router-view></router-view>
  </div>
</template>

<script>
import routerGuards from '@/router/router-guards';
import { mapState, mapActions } from 'vuex';

export default {
  data: () => ({
    loading: true,
  }),

  computed: {
    ...mapState(['activeItem', 'periods', 'activePeriod', 'objectives', 'keyResults', 'kpis']),
  },

  methods: {
    ...mapActions(['set_active_period_and_data']),

    async setPeriod(id) {
      this.loading = true;
      await this.set_active_period_and_data(id);
      this.loading = false;
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
      await routerGuards.itemHome(to, from, next);
      this.loading = false;
    } else {
      this.loading = false;
      next();
    }
  },
};
</script>
