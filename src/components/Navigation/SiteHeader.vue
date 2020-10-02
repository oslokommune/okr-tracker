<template>
  <header class="header">
    <div class="container">
      <router-link :to="{ name: 'Home' }" class="logo"> Logo </router-link>
      <div class="title" v-if="title">
        <h1 class="title__name">
          {{ title }}
        </h1>
      </div>
      <button class="btn btn--ter user" v-if="user">
        <span class="user__icon fa fa-user-circle"></span>
        <span class="user__name">{{ user.displayName }}</span>
        <span class="user__chevron fa fa-chevron-down"></span>
      </button>
    </div>
  </header>
</template>

<script>
import { mapState } from 'vuex';

export default {
  computed: {
    ...mapState(['activeItem', 'user']),

    /**
     * Dynamically determines the page title based on the route
     * @returns {string} page title
     */
    title() {
      const parts = this.$route.matched.map(({ name }) => name);

      if (parts.includes('Admin')) return 'Admin';
      if (parts.includes('ItemHome') && this.activeItem) return this.activeItem.name;

      return 'OKR Tracker';
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/styles/_colors.scss';

.header {
  position: sticky;
  top: 0;
  background: $color-yellow;
}

.container {
  @include container();
  display: flex;
  // flex-direction: row-reverse;
  align-items: center;
  height: 4rem;

  @media screen and (min-width: bp(m)) {
    flex-direction: row;
  }
}

.logo {
  display: none;
  width: span(2);

  @media screen and (min-width: bp(s)) {
    display: block;
  }

  @media screen and (min-width: bp(m)) {
    width: span(3);
  }

  @media screen and (min-width: bp(l)) {
    width: span(2);
  }
}

.title {
  width: span(9);

  @media screen and (min-width: bp(s)) {
    width: span(7);
    margin-left: span(0, 1);
  }

  @media screen and (min-width: bp(m)) {
    width: span(6);
  }

  @media screen and (min-width: bp(l)) {
    width: span(7);
  }
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

.user {
  display: flex;
  align-items: center;
  width: auto;
  margin-left: auto;

  &:hover {
    .user__chevron {
      opacity: 1;
    }
  }

  @media screen and (min-width: bp(s)) {
    width: span(3);
    margin-left: span(0, 1);
  }
}

.user__icon {
  margin-right: 0.3em;
  font-size: 1.5rem;
}

.user__name {
  display: none;
  overflow: hidden;
  font-weight: 500;
  white-space: nowrap;
  text-overflow: ellipsis;

  @media screen and (min-width: bp(s)) {
    display: block;
  }
}

.user__chevron {
  margin-left: auto;
  opacity: 0.5;
}
</style>
