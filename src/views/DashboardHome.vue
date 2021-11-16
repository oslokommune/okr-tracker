<template>
  <div ref="dashboard" class="dashboard">
    <aside v-if="activeItem" class="meta">
      <div class="meta__panel meta__product">
        <div class="meta__product--image">
          <i :class="`fa ${getIcon} fa-5x`" />
        </div>
        <div class="meta__product--name">{{ activeItem.name }}</div>
      </div>
      <div v-if="activeItem.team" class="meta__panel meta__team">
        <div class="meta__panel--header"><i class="fa fa-fw fa-users"></i>{{ $t('general.team') }}</div>
        <div v-for="user in activeItem.team" :key="user.id" class="meta__team--member">
          <img
            :src="user.photoURL || '/placeholder-user.svg'"
            :alt="user.displayName || user.id"
            class="meta__team--image"
          />
          <div class="meta__team--name">{{ user.displayName || user.id }}</div>
        </div>
      </div>
      <div class="meta__panel">
        <div v-if="activePeriod" class="meta__panel--header">
          <i class="fa fa-fw fa-chart-pie" />
          Progresjon {{ activePeriod.name }}
        </div>
        <svg ref="piechart"></svg>
      </div>
    </aside>

    <template v-for="objective in tree">
      <div :key="objective.id" class="objective">
        <div class="objective__head">
          <i class="objective__icon fa fa-fw fa-trophy" />
          <div class="objective__name">
            {{ objective.name }}
          </div>
        </div>

        <!-- List key results for objective -->
        <div v-for="keyResult in objective.keyResults" :key="keyResult.id" class="key-result">
          <div class="key-result__description">
            {{ keyResult.name }}
          </div>
          <div class="key-result__progress">
            <dashboard-progress-bar :key-result="keyResult" :darkmode="true" />
          </div>
        </div>
      </div>
    </template>

    <router-link
      v-tooltip="$t('btn.close')"
      class="close--btn"
      :to="{ name: 'ItemHome', params: { slug: $route.params.slug } }"
    >
      <i class="fa fa-times" />
    </router-link>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import PieChart from '@/util/PieChart';

export default {
  name: 'DashboardHome',

  components: {
    DashboardProgressBar: () => import('@/components/DashboardProgressBar.vue'),
  },

  data: () => ({
    piegraph: null,
    tree: [],
  }),

  computed: {
    ...mapState(['activePeriod', 'activeItem', 'objectives', 'keyResults', 'theme']),

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
    theme: {
      immediate: true,
      handler() {
        if (!this.piegraph) return;
        this.piegraph.render(this.activePeriod, this.theme);
      },
    },
  },

  mounted() {
    if (!this.$refs.piechart) return;

    this.piegraph = new PieChart(this.$refs.piechart, { darkmode: true, colorMode: this.theme });
    this.piegraph.render(this.activePeriod, this.theme);

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
@use 'sass:math';

$imageSize: 1.75em;

.dashboard {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  display: flex;
  justify-content: start;
  width: 100vw;
  height: 100vh;
  padding: 1.5em;
  color: var(--color-white);
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

.meta__panel {
  height: 100%;
  padding: 1em;
  background: rgba(black, 0.35);
  border-radius: 0.15em;
}

.meta__panel--header {
  margin-bottom: 0.5em;
  padding-bottom: 0.5em;
  color: var(--color-yellow);
  font-weight: 500;
  border-bottom: 1px solid rgba(white, 0.1);

  > .fa {
    margin-right: 0.5em;
  }
}

.meta__team {
  display: flex;
  flex-direction: column;

  overflow: hidden;
}

.meta__team--member {
  display: flex;
  align-items: center;
  margin-bottom: 0.5em;
}

.meta__team--name {
  margin-left: 0.5em;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.meta__team--image {
  width: $imageSize;
  height: $imageSize;
  border-radius: math.div($imageSize, 2);
}

.meta__product {
  display: flex;
  flex-direction: column;
  text-align: center;
}

.meta__product--image {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 12em;
  height: 12em;
  margin: 0 auto;
  object-fit: cover;
  color: var(--color-black);
  background: var(--color-yellow);
  border: 5px solid var(--color-white);
  border-radius: 0.25em;
  box-shadow: 0 0.4em 1.6em 0.5em rgba(var(--color-yellow-rgb), 0.4);
}

.meta__product--name {
  margin-top: 1em;
  color: var(--color-yellow);
  font-weight: 500;
  font-size: 1.25em;
}

.close {
  grid-column: 6;
  justify-self: end;
  width: 100%;
}

.close--btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3em;
  height: 3em;
  padding: 0;
  color: var(--color-white);

  &:hover {
    background: rgba(white, 0.1);
  }
}

.objective {
  display: grid;
  grid-gap: 1em;
  grid-row: 1 / span 6;
  grid-template-rows: repeat(6, 1fr);
  width: 100%;
  margin-right: 1rem;
  font-size: 0.9em;
}

.objective__head {
  display: grid;
  grid-gap: 0.5em;
  grid-template-rows: 2.5em auto;
  align-content: center;
  text-align: center;
}

.objective__icon {
  display: flex;
  grid-row: 1;
  align-items: center;
  align-self: end;
  justify-content: center;
  justify-self: center;
  width: 2.5em;
  height: 2.5em;
  color: var(--color-text);
  background: var(--color-primary);
}

.objective__name {
  grid-row: 2;
  font-weight: 500;
  font-size: 1.2em;
}

.objective__tag {
  display: inline-block;
  padding: 0.25em 0.5em;
  color: var(--color-purple);
  font-weight: 500;
  background: white;
}

.key-result {
  display: grid;
  grid-gap: 0.5em;
  grid-row: auto 3rem;
  grid-column: 1fr;
  height: 100%;
  padding: 1em;
  color: rgba(white, 0.85);
  font-weight: 300;
  background: rgba(black, 0.35);
  border-radius: 0.15em;
}

.key-result__progress {
  align-self: end;
  justify-content: end;
}
</style>
