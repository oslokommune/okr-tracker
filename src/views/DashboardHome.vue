<template>
  <div ref="dashboard" class="db">
    <aside v-if="activeItem" class="meta">
      <div class="panel product">
        <div class="product__image">
          <i :class="`fa ${getIcon} fa-5x`" />
        </div>
        <div class="product__name">{{ activeItem.name }}</div>
      </div>
      <div v-if="activeItem.team" class="panel team">
        <div class="panel__header"><i class="fa fa-fw fa-users"></i>{{ $t('general.team') }}</div>
        <div v-for="user in activeItem.team" :key="user.id" class="team__member">
          <img :src="user.photoURL || '/placeholder-user.svg'" :alt="user.displayName || user.id" class="team__image" />
          <div class="team__name">{{ user.displayName || user.id }}</div>
        </div>
      </div>
      <div class="panel">
        <div v-if="activePeriod" class="panel__header">
          <i class="fa fa-fw fa-chart-pie" />
          Progresjon {{ activePeriod.name }}
        </div>
        <svg ref="piechart"></svg>
      </div>
    </aside>

    <dashboard-objective v-for="objective in tree" :key="objective.id" :objective="objective" class="objective" />

    <div class="close__container">
      <router-link
        v-tooltip="$t('btn.close')"
        class="close"
        :to="{ name: 'ItemHome', params: { slug: $route.params.slug } }"
      >
        <i class="fa fa-times" />
      </router-link>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import PieChart from '@/util/PieChart';

export default {
  name: 'DashboardHome',

  components: {
    DashboardObjective: () => import('@/components/DashboardObjective.vue'),
  },

  data: () => ({
    piegraph: null,
    tree: [],
  }),

  computed: {
    ...mapState(['activePeriod', 'activeItem', 'objectives', 'keyResults']),

    getIcon() {
      const { organization, department } = this.activeItem;

      if (organization && department) {
        return 'fa-cube';
      }
      if (organization && !department) {
        return 'fa-cubes';
      }
      return 'fa-industry';
    },
  },

  watch: {
    keyResults: {
      immediate: true,
      handler() {
        this.tree = this.objectives.map((objective) => {
          objective.keyResults = this.keyResults.filter((keyRes) => {
            return keyRes.objective === `objectives/${objective.id}`;
          });
          return objective;
        });
      },
    },
  },

  mounted() {
    if (!this.$refs.piechart) return;

    this.piegraph = new PieChart(this.$refs.piechart, { darkmode: true });
    this.piegraph.render(this.activePeriod);

    this.enterFullscreen();
  },

  methods: {
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
  z-index: 1000;
  display: grid;
  grid-gap: 1em;
  grid-template-rows: repeat(6, 1fr);
  grid-template-columns: repeat(5, 1fr) auto;
  justify-content: start;
  width: 100vw;
  height: 100vh;
  padding: 1.5em;
  color: white;
  font-size: calc(12px + (20 - 12) * (100vw - 600px) / (2000 - 600));
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
  text-align: center;

  &__image {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 12em;
    height: 12em;
    margin: 0 auto;
    object-fit: cover;
    color: black;
    background: #f8c66b;
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

.close__container {
  grid-column: 6;
  justify-self: end;
  width: 100%;
}

.close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3em;
  height: 3em;
  padding: 0;
  color: white;

  &:hover {
    background: rgba(white, 0.1);
  }
}
</style>
