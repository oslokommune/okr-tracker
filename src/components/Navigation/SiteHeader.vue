<template>
  <header class="site-header">
    <menu-component mode="horizontal">
      <!-- Site menu dropdown -->
      <menu-item variant="dropdown" class="menu-item--site">
        <template #label>
          <span class="logo">
            <img
              alt="Oslo kommune logo"
              src="@oslokommune/punkt-assets/dist/logos/oslologo.svg"
            />
          </span>
          <span class="pkt-show-phablet-up">{{ siteMenuLabel }}</span>
        </template>
        <template #dropdown="{ close }">
          <site-sidebar :handle-navigation="close" />
        </template>
      </menu-item>

      <!-- Item tabs -->
      <template v-if="activeItem && $route.params?.slug">
        <menu-item
          v-for="(itemMenuTab, index) in itemTabs"
          :key="`item_tabs_${index}`"
          variant="tab"
          v-bind="itemMenuTab"
        >
          <template #label>
            <span class="pkt-show-tablet-big-up">{{ itemMenuTab.label }}</span>
            <span class="pkt-hide-tablet-big-up">
              {{ itemMenuTab.shortLabel || itemMenuTab.label }}
            </span>
          </template>
        </menu-item>
      </template>

      <!-- User menu dropdown -->
      <menu-item
        v-if="user"
        ref="userMenu"
        variant="dropdown"
        icon="user"
        class="menu-item--user"
      >
        <template #dropdown="{ close }">
          <user-profile-menu :id="user.id" :handle-navigation="close" />
        </template>
      </menu-item>
    </menu-component>
  </header>
</template>

<script>
import { mapState } from 'vuex';
import i18n from '@/locale/i18n';
import MenuComponent from '@/components/menu/MenuComponent.vue';
import MenuItem from '@/components/menu/MenuItem.vue';
import SiteSidebar from '@/components/Navigation/SiteSidebar.vue';
import UserProfileMenu from '@/components/UserProfileMenu.vue';
import getActiveItemType from '@/util/getActiveItemType';

export default {
  name: 'SiteHeader',

  components: {
    MenuComponent,
    MenuItem,
    SiteSidebar,
    UserProfileMenu,
  },

  computed: {
    ...mapState(['activeItem', 'activeKeyResult', 'activeObjective', 'user']),

    siteMenuLabel() {
      const defaultLabel = i18n.t('general.appName') || 'OKR Tracker';
      const parts = this.$route.matched.map(({ name }) => name);

      if (parts.includes('Admin')) {
        return `${defaultLabel}: ${i18n.t('general.admin')}`;
      }

      if (parts.includes('Help')) {
        return `${defaultLabel}: ${i18n.t('general.help')}`;
      }

      if (parts.includes('Api')) {
        return `${defaultLabel}: ${i18n.t('general.api')}`;
      }

      if (
        (parts.includes('ItemHome') ||
          parts.includes('ItemAdmin') ||
          parts.includes('ItemMeasurements') ||
          parts.includes('ItemAbout') ||
          parts.includes('KeyResultHome') ||
          parts.includes('ObjectiveHome')) &&
        this.activeItem
      ) {
        return this.activeItem.name;
      }

      return defaultLabel;
    },

    itemTabs() {
      return [
        {
          route: { name: 'ItemHome' },
          label: this.$t('general.OKRsLong'),
          shortLabel: this.$t('general.OKRs'),
        },
        {
          route: { name: 'ItemMeasurements' },
          label: this.$t('general.KPIs'),
        },
        {
          route: { name: 'ItemAbout' },
          label: this.aboutLabel,
          shortLabel: this.$t('about.about'),
        },
        {
          show: this.hasEditRights,
          route: { name: 'ItemAdmin', query: this.adminLinkQuery },
          label: this.$t('general.admin'),
        },
      ];
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

    adminLinkQuery() {
      switch (this.$route.name) {
        case 'ItemHome':
          return { tab: 'okr' };
        case 'ObjectiveHome':
          return { tab: 'okr', type: 'objective', id: this.activeObjective?.id };
        case 'KeyResultHome':
          return { tab: 'okr', type: 'keyResult', id: this.activeKeyResult?.id };
        case 'ItemMeasurements':
          return { tab: 'kpi' };
        default:
          return {};
      }
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
.site-header {
  display: flex;
  flex: 0 0 3.5rem;

  .menu {
    flex-basis: 100%;
    height: 100%;
  }

  .menu-item {
    &--site {
      border-right: 1px solid var(--color-gray);

      ::v-deep .menu-item__inner {
        text-shadow: 0.25px 0px 0.1px, -0.25px 0px 0.1px;
      }

      .logo {
        height: 1.5rem;
        width: 1.5rem;
        line-height: 1;
        overflow: hidden;

        img {
          height: 100%;
        }
      }
    }

    &--user {
      margin-left: auto;
      border-left: 1px solid var(--color-gray);

      ::v-deep .menu-item__content {
        right: 0;
      }
    }
  }
}
</style>
