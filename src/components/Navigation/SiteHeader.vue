<template>
  <header class="siteHeader">
    <button class="btn btn--ter btn-pri" @click="toggleShowAsideLeft">
      <icon-menu />
    </button>
    <h1 v-if="title" class="siteHeader__title">
      {{ title }}
    </h1>
    <button
      v-if="user"
      class="btn btn--ter btn--pri"
      @click="toggleShowAsideRight"
    >
      <icon-user />
    </button>
  </header>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import ClickOutside from 'vue-click-outside';
import { auth } from '@/config/firebaseConfig';
import KnowitLogo from '@/components/KnowitLogo.vue';
import ThemeToggle from '@/components/ThemeToggle.vue';

export default {
  name: 'SiteHeader',

  components: {
    KnowitLogo,
    ThemeToggle,
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

  computed: {
    ...mapState(['activeItem', 'user']),

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

  mounted() {
    if (this.user && this.user.position === null) {
      this.toggleShowAsideRight();
    }
  },
};
</script>

<style lang="scss" scoped>
.siteHeader {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 4rem;
  padding: 0 0.6875rem;
  color: var(--color-text-secondary);
  background: var(--color-primary);

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
