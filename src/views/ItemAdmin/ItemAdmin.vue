<template>
  <div>
    <ul class="tabs">
      <li v-for="link in links" :key="link.label">
        <router-link :to="link.to" class="tab" active-class="active" exact>
          <span class="tab__icon fa" :class="`fa-${link.icon}`"></span>
          <span class="tab__name">{{ link.label }}</span>
        </router-link>
      </li>
      <li class="tab--right" v-if="activeItem">
        <router-link class="tab" :to="{ name: 'ItemHome' }" exact>
          <span class="tab__icon fa fa-arrow-right"></span>
          <span class="tab__name">{{ activeItem.name }}</span>
        </router-link>
      </li>
    </ul>

    <router-view></router-view>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  data: () => ({
    links: [
      {
        icon: 'cogs',
        to: { name: 'ItemAdmin' },
        label: 'General',
      },
      {
        icon: 'chart-pie',
        to: { name: 'ItemAdminOKRs' },
        label: 'OKRs',
      },
      {
        icon: 'chart-line',
        to: { name: 'ItemAdminKPIs' },
        label: 'KPIs',
      },
    ],
  }),
  computed: {
    ...mapState(['activeItem']),
  },
};
</script>

<style lang="scss" scoped>
.router-link-active {
  font-weight: bold;
}

.tab--right {
  display: none;

  @media screen and (min-width: bp(xs)) {
    display: block;
  }
}

.tabs {
  @media screen and (min-width: bp(l)) {
    width: span(7, 0, span(10));
  }
  @media screen and (min-width: bp(xl)) {
    width: span(6, 0, span(10));
  }
}
</style>
