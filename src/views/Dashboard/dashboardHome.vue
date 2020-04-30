<template>
  <div class="db" ref="dashboard">
    <aside class="meta">
      <div class="panel product">
        <img class="product__image" :src="product.photoURL || '/placeholder-image.svg'" :alt="product.name" />
        <div class="product__name">{{ product.name }}</div>
      </div>
      <div class="panel team">
        <div class="panel__header"><i class="fa fa-fw fa-users"></i>{{ $t('general.team') }}</div>
        <div v-for="user in team" :key="user.id" class="team__member">
          <img :src="user.photoURL || '/placeholder-user.svg'" :alt="user.displayName || user.id" class="team__image" />
          <div class="team__name">{{ user.displayName || user.id }}</div>
        </div>
      </div>
      <div class="panel">
        <div class="panel__header" v-if="currentPeriod">
          <i class="fa fa-fw fa-chart-pie"></i>Progresjon {{ currentPeriod.name }}
        </div>
        <pie-chart v-if="product" :document="product" :darkmode="true"></pie-chart>
      </div>
    </aside>

    <dashboardObjective
      v-for="objective in objectives"
      :key="objective.id"
      :objective="objective"
      class="objective"
    ></dashboardObjective>

    <router-link :to="{ name: 'product' }" class="close" v-tooltip="$t('btn.close')"
      ><i class="fa fa-times"></i
    ></router-link>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import { serializeDocument, serializeList } from '@/db/db';
import PieChart from '@/components/PieChart.vue';
import DashboardObjective from '@/views/Dashboard/dashboardObjective.vue';
import i18n from '@/locale/i18n';

export default {
  name: 'DashboardHome',
  data: () => ({
    objectives: [],
    team: [],
    events: [],
    currentPeriod: null,
  }),

  computed: {
    ...mapState(['product']),
  },

  components: {
    PieChart,
    DashboardObjective,
  },

  metaInfo() {
    return {
      title: `${this.product ? this.product.name : i18n.t('general.product')} | ${i18n.t(
        'general.dashboard'
      )} | ${i18n.t('general.project')}`,
    };
  },

  watch: {
    async product() {
      this.team = await this.getTeam();
      this.currentPeriod = await this.getCurrentPeriod();
      await this.getObjectives();
    },
  },

  async created() {
    this.SET_SHOW_NEWSFEED(false);
    this.team = await this.getTeam();
    this.currentPeriod = await this.getCurrentPeriod();
    await this.getObjectives();
  },

  mounted() {
    this.enterFullscreen();
  },

  methods: {
    ...mapMutations(['SET_SHOW_NEWSFEED']),
    async getCurrentPeriod() {
      const now = new Date();
      return this.product.ref
        .collection('periods')
        .get()
        .then(serializeList)
        .then(periods => periods.filter(period => period.startDate.toDate() < now && period.endDate.toDate() > now))
        .then(periods => (periods?.length ? periods[0] : false))
        .catch(() => {
          throw new Error(i18n.t('errorHandler.noPeriods'));
        });
    },

    async getObjectives() {
      this.product.ref
        .collection('objectives')
        .where('period', '==', this.currentPeriod.ref)
        .onSnapshot(snapshot => {
          this.objectives = snapshot.docs.map(serializeDocument).filter(d => !d.archived);
          this.$refs.dashboard.style.setProperty('--columns', this.objectives.length);
        });
    },

    async getTeam() {
      if (!this.product.team || !this.product.team.length) return;
      return Promise.all(this.product.team.map(d => d.get().then(serializeDocument)));
    },

    enterFullscreen() {
      const elem = this.$refs.dashboard;

      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen();
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/styles/_colors';

.db {
  --columns: 3;

  position: fixed;
  top: 0;
  left: 0;
  z-index: 10;
  display: grid;
  grid-gap: 1em;
  grid-template-rows: repeat(6, 1fr);
  grid-template-columns: 25% repeat(var(--columns), minmax(auto, 25%)) 1fr auto;
  justify-content: start;
  width: 100vw;
  height: 100vh;
  padding: 1.5em;
  color: white;
  font-size: calc(0.8vw);
  background-color: #020218;
  background-image: url('/dashboard-1.png');
  background-size: cover;
}

.meta {
  display: grid;
  grid-gap: 1em;
  grid-row: 1 / span 6;
  grid-column: 1;
  grid-template-rows: repeat(3, 1fr);
  grid-template-columns: auto;
  margin-right: 1em;
}

.panel {
  height: 100%;
  padding: 1em;
  background: rgba(black, 0.35);
  border-radius: 0.15em;

  &__header {
    margin-bottom: 0.5em;
    padding-bottom: 0.5em;
    color: $color-yellow;
    font-weight: 500;
    border-bottom: 1px solid rgba(white, 0.1);

    > .fa {
      margin-right: 0.5em;
    }
  }
}

.close {
  grid-column-end: calc(var(--columns) + 3);
}

.team {
  $imageSize: 1.75em;
  display: flex;
  flex-direction: column;

  overflow: hidden;

  &__member {
    display: flex;
    align-items: center;
    margin-bottom: 0.5em;
  }

  &__name {
    margin-left: 0.5em;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  &__image {
    width: $imageSize;
    height: $imageSize;
    border-radius: $imageSize / 2;
  }
}

.product {
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;

  &__image {
    width: 12em;
    height: 12em;
    margin: 0 auto;
    object-fit: cover;
    border: 5px solid white;
    border-radius: 0.25em;
    box-shadow: 0 0.4em 1.6em 0.5em rgba($color-yellow, 0.4);
  }

  &__name {
    margin-top: 1em;
    color: $color-yellow;
    font-weight: 500;
    font-size: 1.25em;
  }
}

.close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3em;
  height: 3em;
  margin-left: auto;
  padding: 0;
  color: white;

  &:hover {
    background: rgba(white, 0.1);
  }
}
</style>
