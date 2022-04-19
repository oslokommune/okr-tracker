<template>
  <header class="header">
    <sidebar-navigation :is-open="sidebarOpen" @hide="hideSidebar" />
    <div class="siteHeader-container">
      <a href="#" role="menuitem" class="header__nav-button" :class="{ 'is-open': sidebarOpen }" @click="sidebarOpen = true">
        <div class="header__nav-icon" role="presentation">
          <span class="sidebar__button"></span> <span class="sidebar__button"></span>
          <span class="sidebar__button"></span> <span class="sidebar__button"></span>
        </div>
      </a>
      <div v-if="title" class="title">
        <h1 class="title__name">
          {{ title }}
        </h1>
      </div>

      <div data-cy="usermenu">
        <button
          v-if="user"
          class="btn btn--ter btn--icon btn--icon-pri"
          :class="{ active: showProfileModal }"
          @click="openProfileModal"
        >
          <i class="user__icon fa fa-user-circle" />
        </button>
      </div>
      <profile-modal v-if="showProfileModal" @close="closeProfileModal" :id="user.id" />
    </div>
  </header>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex';
import { auth } from '@/config/firebaseConfig';
import IconMenu from '@/components/IconMenu.vue';
import IconUser from '@/components/IconUser.vue';

export default {
  name: 'SiteHeader',

  components: {
    IconMenu,
    IconUser,
  },

  props: {
    toggleShowAsideLeft: {
      type: Function,
      required: true,
    },
    toggleShowAsideRight: {
      type: Function,
      required: true,
    },
  },

  metaInfo() {
    return {
      title: `OKR | ${this.title}`,
    };
  },

  computed: {
    ...mapState(['activeItem', 'user', 'organizations']),
    ...mapGetters(['isAdmin']),

    /**
     * Dynamically determines the page title based on the route
     * @returns {string} page title
     */
    title() {
      const parts = this.$route.matched.map(({ name }) => name);

      if (parts.includes('Admin')) {
        return 'Admin';
      }
      if (
        (parts.includes('ItemHome') ||
          parts.includes('ItemAdmin') ||
          parts.includes('ItemAdminOKRs') ||
          parts.includes('ItemAdminKPIs') ||
          parts.includes('KeyResultHome') ||
          parts.includes('ObjectiveHome') ||
          parts.includes('KpiHome')) &&
        this.activeItem
      ) {
        return this.activeItem.name;
      }

      return 'OKR Tracker';
    },
  },

  methods: {
    ...mapActions(['reset_state', 'setLoading', 'setActiveOrganization']),

    toggleShowSiteSidebar() {
      this.showSiteSidebar = !this.showSiteSidebar;
    },

    hideUserMenuSidebar(event) {
      this.userMenuSidebarOpen = event;
    },

    async signOut() {
      await this.setLoading(true);
      await this.reset_state();
      await auth.signOut();
      await this.setLoading(false);
    },
  },
};
</script>

<style lang="scss" scoped>
@use 'sass:math';
@use '@/styles/typography';

$header-height: 3.5em;

.siteHeader {
  padding: 0 0.6875rem;
  position: sticky;
  top: 0;
  z-index: 20;
  color: var(--color-text-secondary);
  background: var(--color-primary);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 3.5rem;
  height: $header-height;

  &__title {
    font-weight: 500;
    font-size: 1.25rem;

    @media screen and (min-width: bp(s)) {
      font-size: 1.5rem;
    }

    @media screen and (min-width: bp(s)) {
      font-size: typography.$font-size-5;
    }

    @media screen and (min-width: bp(m)) {
      font-size: 1.65rem;
    }
  }
}
</style>
