<template>
  <header class="site-header">
    <button class="btn btn--ter btn-pri" @click="toggleShowAsideLeft">
      <pkt-icon name="menu" />
    </button>
    <h1 v-if="title" class="site-header__title">
      {{ title }}
    </h1>
    <button
      class="btn btn--ter btn--pri"
      :class="{ hidden: !user }"
      @click="toggleShowAsideRight"
    >
      <pkt-icon name="user" />
    </button>
  </header>
</template>

<script>
import { mapState } from 'vuex';
import i18n from '@/locale/i18n';

export default {
  name: 'SiteHeader',

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
     * Return the page title based on the current route.
     */
    title() {
      const parts = this.$route.matched.map(({ name }) => name);

      if (parts.includes('Admin')) {
        return i18n.t('general.admin');
      }

      if (parts.includes('Help')) {
        return i18n.t('general.help');
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
.site-header {
  display: flex;
  flex: 0 0 4rem;
  align-items: center;
  justify-content: space-between;
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

  svg {
    --fg-color: var(--color-white);
    height: 1.75rem;
  }
}

.hidden {
  visibility: hidden;
}
</style>
