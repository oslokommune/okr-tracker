<template>
  <header class="siteHeader">
    <button class="btn btn--ter btn-pri" @click="toggleShowAsideLeft">
      <icon-menu />
    </button>
    <h1 v-if="title" class="siteHeader__title">
      {{ title }}
    </h1>
    <button v-if="user" class="btn btn--ter btn--pri" @click="toggleShowAsideRight">
      <icon-user />
    </button>
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
  height: 4rem;

  &__title {
    font-weight: 500;
    font-size: 1.25rem;

    @media screen and (min-width: bp(s)) {
      font-size: 1.5rem;
    }

    @media screen and (min-width: bp(m)) {
      font-size: 1.65rem;
    }
  }
}
</style>
