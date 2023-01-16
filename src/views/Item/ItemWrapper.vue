<template>
  <div>
    <div class="tabs" role="tablist">
      <router-link
        v-for="(tab, index) in tabs"
        :key="index"
        :to="{ name: tab.route }"
        tag="button"
        class="tabs__tab"
        role="tab"
      >
        {{ tab.label }}
      </router-link>
    </div>
    <router-view v-show="!loading"></router-view>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { itemHome as routerGuard } from '@/router/router-guards';

export default {
  name: 'ItemWrapper',

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

  data: () => ({
    loading: true,
  }),

  computed: {
    ...mapState(['activeItem']),
    tabs() {
      return [
        {
          route: 'ItemHome',
          label: this.$t('general.OKRsLong'),
        },
        {
          route: 'ItemMeasurements',
          label: this.$t('general.KPIs'),
        },
        {
          route: 'ItemAbout',
          label: `${this.$t('about.about')} ${this.activeItem.name}`,
        },
      ];
    },
  },

  mounted() {
    this.loading = false;
  },
};
</script>

<style lang="scss" scoped>
.tabs {
  position: sticky;
  top: 4rem;
  z-index: 20;
  display: flex;
  flex-grow: 1;
  box-sizing: border-box;
  margin-bottom: 1rem;
  padding: 0 1.5rem;
  background-color: var(--color-white);

  &__tab {
    padding: 1rem;
    color: var(--color-grayscale-40);
    font-weight: 500;
    font-size: 1rem;
    white-space: nowrap;
    background-color: transparent;
    border: unset;
    cursor: pointer;
    transition: background-color 0.2s;

    &.router-link-active {
      position: relative;
      color: var(--color-blue-dark);
      cursor: default;

      &::after {
        position: absolute;
        right: 0;
        bottom: 0;
        left: 0;
        height: 0.25rem;
        background-color: var(--color-active-light);
        content: '';
      }
    }

    &:hover:not(.router-link-active):not(:disabled) {
      position: relative;
      color: var(--color-blue-dark);
      background-color: var(--color-gray-light);
    }
  }
}
</style>
