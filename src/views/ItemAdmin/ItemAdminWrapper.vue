<template>
  <div class="container">
    <div class="itemAdmin">
      <ul class="tabs">
        <li v-for="link in links" :key="link.label">
          <router-link :to="link.to" class="tab" active-class="active" :exact="link.exact" :data-cy="link.cy">
            <i class="tab__icon fa" :class="`fa-${link.icon}`" />
            <span class="tab__name">{{ link.label }}</span>
          </router-link>
        </li>
        <li
          v-if="activeItem"
          v-tooltip.right="$t('tooltip.navigateToItem', { item: activeItem.name })"
          class="tab--right"
        >
          <router-link class="tab tab--right" :to="{ name: 'ItemHome', params: { slug: activeItem.slug } }" exact>
            <i class="tab__icon fa fa-arrow-right" />
            <span class="tab__name">{{ activeItem.name }}</span>
          </router-link>
        </li>
      </ul>

      <router-view />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'ItemAdmin',

  computed: {
    links() {
      return [
        {
          icon: 'cogs',
          to: { name: 'ItemAdmin' },
          label: this.$t('general.general'),
          exact: true,
          cy: 'admin-general',
        },
        {
          icon: 'chart-pie',
          to: { name: 'ItemAdminOKRs' },
          label: this.$t('general.OKRsLong'),
          exact: false,
          cy: 'admin-okr',
        },
        {
          icon: 'chart-line',
          to: { name: 'ItemAdminKPIs' },
          label: this.$t('general.KPIs'),
          exact: false,
          cy: 'admin-kpi',
        },
      ];
    },

    ...mapState(['activeItem']),
  },
};
</script>

<style lang="scss" scoped>
.router-link-active {
  font-weight: bold;
}

.tab--right {
  background: var(--color-bg);
}

.tabs {
  @media screen and (min-width: bp(l)) {
    width: span(7, span(10));
  }
  @media screen and (min-width: bp(xl)) {
    width: span(6, span(10));
  }
}

.itemAdmin {
  width: span(12);
  padding: 1.5rem 0;

  @media screen and (min-width: bp(m)) {
    margin-right: span(2, 1);
    margin-left: span(2, 1);
  }

  @media screen and (min-width: bp(l)) {
    margin-right: span(0);
    margin-left: span(2, 1);
  }

  @media screen and (min-width: bp(xl)) {
    margin-left: span(3, 1);
  }
}
</style>
