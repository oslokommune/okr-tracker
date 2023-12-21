<template>
  <header class="site-navigation">
    <nav class="nav-bar site-navigation__menubar" role="menubar">
      <!-- Site menu -->
      <nav-menu class="site-menu">
        <nav-menu-item :aria="{ label: siteMenuLabel }" dropdown>
          <template #text>
            <pkt-icon class="nav-menu-item__icon" name="bullseye" />
            <span class="pkt-show-tablet-up">{{ siteMenuLabel }}</span>
          </template>
          <template #default="{ close }">
            <site-menu-dropdown :handle-navigation="close" />
          </template>
        </nav-menu-item>
      </nav-menu>

      <!-- Item tabs -->
      <nav-menu v-if="activeItem && $route.params?.slug" class="item-menu" tabs>
        <nav-menu-item
          v-for="(itemMenuTab, index) in itemTabs"
          :key="`item_tabs_${index}`"
          v-tooltip.bottom="itemMenuTab.tooltip"
          :class="['item-menu__item', `item-menu__item--${itemMenuTab.pull || 'left'}`]"
          :route="itemMenuTab.route"
          :active="itemMenuTab.active"
          :aria="{ label: itemMenuTab.label || itemMenuTab.tooltip }"
        >
          <template #text>
            <pkt-icon
              v-if="itemMenuTab.icon"
              class="nav-menu-item__icon"
              :name="itemMenuTab.icon"
            />
            <template v-if="itemMenuTab.label">
              <span class="pkt-show-tablet-big-up">{{ itemMenuTab.label }}</span>
              <span class="pkt-hide-tablet-big-up">
                {{ itemMenuTab.shortLabel || itemMenuTab.label }}
              </span>
            </template>
          </template>
        </nav-menu-item>
      </nav-menu>

      <!-- User menu -->
      <nav-menu class="user-menu">
        <nav-menu-item
          v-if="user"
          ref="userMenu"
          v-slot="{ close }"
          :aria="{ label: $t('user.myProfile') }"
          icon="user"
          dropdown
        >
          <user-menu-dropdown :id="user.id" :handle-navigation="close" />
        </nav-menu-item>
      </nav-menu>
    </nav>

    <nav v-if="showToolbar" class="nav-bar site-navigation__toolbar" role="menubar">
      <period-selector-menu />
      <view-toggle />
    </nav>
  </header>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import i18n from '@/locale/i18n';
import SiteMenuDropdown from '@/components/Navigation/SiteMenuDropdown.vue';
import getActiveItemType from '@/util/getActiveItemType';
import NavMenuItem from '@/components/Navigation/navbar/NavMenuItem.vue';
import NavMenu from '@/components/Navigation/navbar/NavMenu.vue';
import PeriodSelectorMenu from '@/components/Navigation/toolbar/PeriodSelectorMenu.vue';
import ViewToggle from '@/components/Navigation/toolbar/ViewToggle.vue';
import UserMenuDropdown from '@/components/Navigation/UserMenuDropdown.vue';

export default {
  name: 'SiteHeader',

  components: {
    NavMenu,
    NavMenuItem,
    SiteMenuDropdown,
    UserMenuDropdown,
    PeriodSelectorMenu,
    ViewToggle,
  },

  computed: {
    ...mapGetters(['hasEditRights']),
    ...mapState(['activeItem', 'activeKeyResult', 'activeObjective', 'user']),

    siteMenuLabel() {
      const defaultLabel = i18n.t('general.appName') || 'OKR Tracker';
      const parts = this.$route.matched.map(({ name }) => name);

      if (parts.includes('Help')) {
        return `${defaultLabel}: ${i18n.t('general.help')}`;
      }

      if (parts.includes('Api')) {
        return `${defaultLabel}: ${i18n.t('general.api')}`;
      }

      if (
        (parts.includes('ItemHome') ||
          parts.includes('ItemMeasurements') ||
          parts.includes('ItemAbout') ||
          parts.includes('ItemIntegrations') ||
          parts.includes('KeyResultHome') ||
          parts.includes('ObjectiveHome')) &&
        this.activeItem
      ) {
        return this.activeItem.name;
      }

      return defaultLabel;
    },

    itemTabs() {
      const items = [
        {
          route: { name: 'ItemHome' },
          label: this.$t('general.OKRsLong'),
          shortLabel: this.$t('general.OKRs'),
          active: ['ItemHome', 'ObjectiveHome', 'KeyResultHome'].includes(
            this.$route.name
          ),
        },
        {
          route: { name: 'ItemMeasurements', query: { view: 'list' } },
          label: this.$t('general.KPIs'),
          active: this.$route.name === 'ItemMeasurements',
        },
        {
          route: { name: 'ItemAbout' },
          label: this.aboutLabel,
          shortLabel: this.$t('about.about'),
        },
      ];
      if (this.hasEditRights) {
        items.push({
          route: { name: 'ItemIntegrations' },
          icon: 'crane',
          tooltip: this.$t('general.integrations'),
          pull: 'right',
        });
      }
      return items;
    },

    aboutLabel() {
      switch (getActiveItemType(this.activeItem)) {
        case 'organization':
          return this.$t('about.aboutOrganization');
        case 'department':
          return this.$t('about.aboutDepartment');
        case 'product':
          return this.$t('about.aboutProduct');
        default:
          return this.$t('about.about');
      }
    },

    showToolbar() {
      return ['ItemHome', 'ObjectiveHome', 'KeyResultHome', 'ItemMeasurements'].includes(
        this.$route.name
      );
    },
  },

  mounted() {
    if (this.user && this.user.position === null) {
      this.$refs.userMenu.activate();
    }
  },
};
</script>

<style lang="scss" scoped>
@use '@oslokommune/punkt-css/dist/scss/abstracts/mixins/breakpoints' as *;
@use '@oslokommune/punkt-css/dist/scss/abstracts/mixins/typography' as *;

.site-navigation {
  display: flex;
  flex-direction: column;

  .nav-bar {
    flex-basis: 3.5rem;
  }

  &__menubar {
    .nav-menu + .nav-menu {
      border-left: 1px solid var(--color-grayscale-10);
    }
  }

  &__toolbar {
    justify-content: space-between;

    @include bp('phablet-up') {
      @include get-text('pkt-txt-14');
    }
  }
}

.site-menu {
  ::v-deep .nav-menu-item__inner {
    font-weight: 500;
  }
}

.item-menu {
  flex: 1;

  &__item--right {
    margin-left: auto;
  }
}

.user-menu {
  margin-left: auto;

  ::v-deep .nav-menu-item__content {
    right: 0;
  }
}
</style>
