<template>
  <nav-menu v-if="views.length" class="view-toggle-menu" toggles>
    <nav-menu-text class="pkt-show-phablet-up">
      <span class="view-toggle-menu__label">{{ $t('general.view') }}:</span>
      {{ currentView }}
    </nav-menu-text>
    <nav-menu-item
      v-for="view in views"
      :key="view.key"
      v-tooltip="$t('tooltip.changeView', { view: view.name })"
      :aria="{
        label: $t('tooltip.changeView', { view: view.name }),
        checked: view.active,
      }"
      role="menuitemradio"
      v-bind="view"
    />
  </nav-menu>
</template>

<script>
import { mapState } from 'vuex';
import NavMenu from '@/components/Navigation/navbar/NavMenu.vue';
import NavMenuItem from '@/components/Navigation/navbar/NavMenuItem.vue';
import NavMenuText from '@/components/Navigation/navbar/NavMenuText.vue';

export default {
  name: 'ViewToggle',

  components: {
    NavMenu,
    NavMenuItem,
    NavMenuText,
  },

  computed: {
    ...mapState('kpis', ['selectedPeriod']),

    views() {
      const { name, query } = this.$route;

      // TODO: Add view toggles for `ItemHome` route, replacing the `ActionBar`
      // component. This includes some extra logic that ideally should work the
      // same way in all cases. Decide whether current view should be set in
      // store (similar to current period) and/or on the user object.

      if (name === 'ItemMeasurements') {
        return [
          {
            key: 'list',
            name: this.$t('view.list'),
            icon: 'list',
            route: {
              name: 'ItemMeasurements',
              query: {
                view: 'list',
                resultIndicatorPeriod: this.selectedPeriod?.key,
              },
            },
            active: name === 'ItemMeasurements' && query?.view === 'list',
          },
          {
            key: 'details',
            name: this.$t('view.details'),
            icon: 'graph',
            route: {
              name: 'ItemMeasurements',
              query: {
                resultIndicatorPeriod: this.selectedPeriod?.key,
              },
            },
            active: name === 'ItemMeasurements' && query?.view !== 'list',
          },
        ];
      }

      return [];
    },

    currentView() {
      const { name, query } = this.$route;
      if (name === 'ItemMeasurements') {
        return query.view === 'list' ? this.$t('view.list') : this.$t('view.details');
      }
      return null;
    },
  },
};
</script>

<style lang="scss" scoped>
.view-toggle-menu {
  &__label {
    font-weight: 500;
  }
}
</style>
