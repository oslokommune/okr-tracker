<template>
  <div class="dashboard">
    <router-link :to="{ name: 'product' }" class="close"></router-link>
    <header class="section--team team__container">
      <img class="team__image" :src="product.product_image ? product.product_image : '/placeholder-image.svg'" alt="" />
      <div class="team__text">
        <p class="team__lead">Team</p>
        <p class="team__name">{{ product.product }}</p>
      </div>

      <div class="team__members">
        members
        <img class="" alt="" />
      </div>

      <div class="team__progress">
        <pie-chart :product="product"></pie-chart>
      </div>
    </header>

    <div class="section--table">
      <table class="table" v-if="product.children">
        <template v-for="objective in product.children">
          <tr v-for="(key_result, i) in objective.children" :key="key_result.id">
            <td v-if="i === 0" :rowspan="objective.children.length" class="cell cell--objective">
              <h3 class="objective-title">{{ objective.objective_title }}</h3>
              <p class="objective-body">{{ objective.objective_body }}</p>
            </td>
            <td :class="{ active: active.id === key_result.id }" class="cell cell--key-result">
              {{ key_result.key_result }}
            </td>
            <td :class="{ active: active.id === key_result.id }" class="cell cell--progress-bar">
              <progress-bar :keyres="key_result" darkmode></progress-bar>
            </td>
            <td :class="{ active: active.id === key_result.id }" class="cell--indicator-container">
              <div class="active-indicator"></div>
            </td>
          </tr>
        </template>
      </table>
    </div>
    <div class="section--details details">
      <div class="details__header">
        <p class="details__lead">Nøkkelresultat</p>
        <h1 v-if="active" class="details__title title-1">{{ active.key_result }}</h1>
      </div>
      <div class="details__info" v-if="active">
        <div class="details__progression">{{ active.progression | percent }}</div>
      </div>
      <div class="details__graph">
        <svg class="graph" ref="graph"></svg>
        <resize-observer @notify="handleResize" />
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import ProgressBar from '@/components/ProgressBar.vue';
import PieChart from '@/components/PieChart.vue';
import LineChart from '@/util/linechart';
import { formatPercent } from '@/util/pie-helpers';

export default {
  name: 'Dashboard',
  data: () => ({
    activeIndex: 0,
    autoplay: true,
    graph: null,
  }),

  components: {
    ProgressBar,
    PieChart,
  },

  mounted() {
    this.graph = new LineChart(this.$refs.graph);
    this.graph.height = 400;

    setInterval(() => {
      if (!this.autoplay) return;
      this.activeIndex++;
      if (this.activeIndex >= this.keyres.length) {
        this.activeIndex = 0;
      }
    }, 10000);
  },

  methods: {
    handleResize() {
      if (!this.graph) return;
      this.graph.render(this.active, this.currentQuarter);
    },
  },

  watch: {
    active() {
      if (!this.graph) return;
      this.graph.render(this.active, this.currentQuarter);
    },
  },

  filters: {
    percent(val) {
      return formatPercent(val);
    },
  },

  computed: {
    ...mapState(['currentQuarter']),
    ...mapGetters(['getProductWithDistinctObjectives']),
    product() {
      return this.getProductWithDistinctObjectives(this.$route.params.id, this.currentQuarter);
    },
    active() {
      if (!this.keyres) return;
      return this.keyres[this.activeIndex];
    },
    keyres() {
      if (!this.product || !this.product.children || !this.product.children.length) return;
      return this.product.children.map(objective => objective.children).flat();
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../styles/dashboard.scss';
</style>
