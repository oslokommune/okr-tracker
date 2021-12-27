<template>
  <header class="header">
    <div class="siteHeader-container">
      <sidebar-navigation />

      <div v-if="title" class="title">
        <h1 class="title__name">
          {{ title }}
        </h1>
      </div>

      <div v-click-outside="closeProfileModal" data-cy="usermenu">
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
import ClickOutside from 'vue-click-outside';
import { auth } from '@/config/firebaseConfig';
import ProfileModal from '@/components/ProfileModal.vue';
import SidebarNavigation from '@/components/Navigation/SiteSidebar.vue';

export default {
  name: 'SiteHeader',

  components: {
    SidebarNavigation,
    ProfileModal,
  },

  directives: {
    ClickOutside,
  },

  data: () => ({
    showProfileIcon: true,
    sidebarOpen: false,
    showProfileModal: false,
  }),

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

  watch: {
    $route() {
      this.closeProfileModal();
    },
  },

  methods: {
    ...mapActions(['reset_state', 'setLoading', 'setActiveOrganization']),

    hideSidebar() {
      this.sidebarOpen = !this.sidebarOpen;
    },

    openProfileModal() {
      this.showProfileModal = true;
      this.showProfileIcon = false;
    },

    closeProfileModal() {
      this.showProfileModal = false;
      this.showProfileIcon = true;
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

$header-height: 4em;

.header {
  position: sticky;
  top: 0;
  z-index: 20;
  color: var(--color-text-secondary);
  background: var(--color-primary);
}

.siteHeader-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 4rem;
}

.title__name {
  font-weight: 500;
  font-size: 1.25rem;

  @media screen and (min-width: bp(s)) {
    font-size: 1.5rem;
  }

  @media screen and (min-width: bp(m)) {
    font-size: 1.65rem;
  }
}

.user__icon {
  display: inline-block;
  width: 2rem;
  margin-right: 0.3em;
  font-size: 1.5rem;
}
</style>
