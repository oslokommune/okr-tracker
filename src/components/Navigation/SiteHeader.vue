<template>
  <header class="header">
    <sidebar-navigation :is-open="sidebarOpen" @hide="hideSidebar" />
    <div class="siteHeader-container">
      <a
        href="#"
        role="menuitem"
        class="header__nav-button"
        :class="{ 'is-open': sidebarOpen }"
        @click="sidebarOpen = true"
      >
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
    isOpen: false,
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

    hideSidebar(event) {
      this.sidebarOpen = event;
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
@use '@/styles/typography';

$header-height: 3.5em;

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
  height: $header-height;
}

.title__name {
  font-weight: 500;
  font-size: typography.$font-size-4;

  @media screen and (min-width: bp(s)) {
    font-size: typography.$font-size-5;
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

.header__nav-button {
  width: $header-height;
  height: $header-height;
  background-color: var(--color-primary);
  border-radius: 50%;
  cursor: pointer;

  &.is-open {
    span {
      &:nth-child(1),
      &:nth-child(4) {
        opacity: 0;
        transition: transform 1.2s ease-in-out 0s, opacity 0.2s ease-in-out 0s;
      }
      &:nth-child(2) {
        transform: translateY(1em) rotate(45deg);
        transition: transform 1.4s ease-in-out 0.4s, opacity 0.4s ease-in-out 0.4s;
      }
      &:nth-child(3) {
        transform: translateY(1em) rotate(-45deg);
        transition: transform 1.4s ease-in-out 0.4s, opacity 0.4s ease-in-out 0.4s;
      }
    }
  }
}

.header__nav-icon {
  position: relative;
  width: 100%;
  padding: 1em;

  $bar-height: 0.15em;
  $center: 1em - math.div($bar-height, 2);
  span {
    position: absolute;
    top: $center;
    left: 1.25em;
    display: block;
    width: 1.5em;
    height: $bar-height;
    background: var(--color-text-secondary);
    border-radius: 0.075em;
    transform-origin: 50% 50%;

    &:nth-child(1) {
      transform: translateY($center - 0.35em) rotate(0deg);
      transition: transform 0.15s ease-in-out 0.3s, opacity 0.15s ease-in-out 0.3s;
    }
    &:nth-child(2),
    &:nth-child(3) {
      transform: translateY(1em) rotate(0deg);
      transition: transform 0.2s ease-in-out 0s, opacity 0.2s ease-in-out 0s;
    }
    &:nth-child(4) {
      transform: translateY($center + 0.35em + $bar-height) rotate(0deg);
      transition: transform 0.15s ease-in-out 0.3s, opacity 0.15s ease-in-out 0.3s;
    }
  }
}
</style>
