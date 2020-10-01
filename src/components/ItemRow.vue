<template>
  <router-link :to="`/${data.slug}`" class="item" :class="`item--${type}`">
    <span class="item__icon fas fa-fw" :class="`fa-${icon}`"></span>

    <span class="item__name">{{ data.name }}</span>

    <div v-if="type === 'product'" class="item__kpis">
      <div class="item__kpi">
        <span class="item__kpi-icon fas fa-chart-line"></span>
        <span class="item__kpi-value">124</span>
        <span class="item__kpi-arrow item__kpi-arrow--up"></span>
      </div>

      <div class="item__kpi">
        <span class="item__kpi-icon far fa-smile"></span>
        <span class="item__kpi-value">124</span>
        <span class="item__kpi-arrow item__kpi-arrow--up"></span>
      </div>

      <div class="item__kpi">
        <span class="item__kpi-icon far fa-check-square"></span>
        <span class="item__kpi-value">124</span>
        <span class="item__kpi-arrow item__kpi-arrow--up"></span>
      </div>
    </div>

    <ProgressBar class="progress-bar" :progression="progression"></ProgressBar>

    <span class="item__chevron fas fa-chevron-right"></span>
  </router-link>
</template>

<script>
export default {
  data: () => ({
    progression: null,
  }),

  components: {
    ProgressBar: () => import('@/components/ProgressBar.vue'),
  },

  computed: {
    icon() {
      switch (this.type) {
        case 'product':
          return 'cube';
        case 'department':
          return 'cubes';
        case 'organization':
          return 'industry';
        default:
          return '';
      }
    },
  },

  props: {
    data: {
      type: Object,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
  },

  watch: {
    data: {
      immediate: true,
      async handler(data) {
        data.onProgressionSnapshot(({ docs }) => {
          if (docs.length) {
            this.progression = docs[0].data().progression;
          }
        });
      },
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/styles/_colors.scss';

.item {
  display: flex;
  align-items: center;
  margin: 0;
  margin-right: auto;
  padding: 0.5rem span(0, 1);
  color: $color-grey-900;
  text-decoration: none;

  &:hover &__chevron {
    transform: translateX(0);
    opacity: 1;
  }
}

.item__name {
  margin-right: auto;
}

.item--department {
  margin-top: 0.5rem;
  font-weight: 500;
  border-top: none;
}

.item--product {
  border-top: 1px solid rgba($color-border, 0.5);
}

.item__icon {
  margin-right: 0.5rem;
}

.item__chevron {
  color: $color-grey-500;
  transform: translateX(-0.5rem);
  opacity: 0;
  transition: all 0.1s ease-in;
}

.progress-bar {
  width: span(1, 0, span(6)) !important;

  @media screen and (min-width: bp(l)) {
    width: span(2, 0, span(6));
  }
}

.item__kpis {
  display: flex;
  margin: 0 1rem;
}

.item__kpi {
  display: flex;
  align-items: center;
  padding: 0 0.5rem;
}

.item__kpi-value {
  color: #686876;
  font-weight: 500;
  font-size: 0.7rem;
}

.item__kpi-icon {
  margin-right: 0.25rem;
  color: $color-purple;
}
</style>
