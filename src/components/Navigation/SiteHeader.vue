<template>
  <header class="header">
    <div class="container">
      <router-link :to="{ name: 'Home' }" class="logo">
        <img src="/oslo-logo.svg" alt="Logo" class="logo__img" />
      </router-link>
      <div class="title" v-if="title">
        <h1 class="title__name">
          {{ title }}
        </h1>
      </div>

      <div class="userMenu" v-click-outside="hideUserMenu">
        <button
          class="btn btn--ter user"
          :class="{ active: showUserMenu }"
          v-if="user"
          @click="showUserMenu = !showUserMenu"
        >
          <span v-if="!user.photoURL" class="user__icon fa fa-user-circle"></span>
          <img v-if="user.photoURL" :src="user.photoURL" class="user__image" />
          <span class="user__name">{{ user.displayName }}</span>
          <span class="user__chevron fa fa-xs" :class="showUserMenu ? 'fa-chevron-up' : 'fa-chevron-down'"></span>
        </button>
        <nav class="menu" v-if="user && showUserMenu">
          <ul class="menu__list">
            <li class="menu__list-item">
              <router-link class="btn btn--ter btn--icon" :to="{ name: 'User', params: { id: user.id } }"
                ><i class="icon fa fa-fw fa-user"></i> My Profile</router-link
              >
            </li>
            <li class="menu__list-item" v-if="user.admin">
              <router-link class="btn btn--ter btn--icon" :to="{ name: 'Admin' }"
                ><i class="icon fa fa-fw fa-cogs"></i> Admin</router-link
              >
            </li>
            <li class="menu__list-item show-mobile">
              <router-link class="btn btn--ter btn--icon" :to="{ name: 'Help' }"
                ><i class="icon fa fa-fw fa-question-circle"></i> Help</router-link
              >
            </li>
            <li>
              <button class="btn btn--ter btn--icon" @click="signOut">
                <i class="icon fa fa-fw fa-sign-out-alt"></i> Sign out
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </header>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import ClickOutside from 'vue-click-outside';
import { auth } from '@/config/firebaseConfig';

export default {
  data: () => ({
    showUserMenu: false,
  }),

  watch: {
    $route() {
      this.hideUserMenu();
    },
  },

  directives: {
    ClickOutside,
  },

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

  methods: {
    ...mapActions(['reset_state']),

    hideUserMenu() {
      this.showUserMenu = false;
    },

    async signOut() {
      await auth.signOut();
      await this.reset_state();
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/styles/_colors.scss';

.header {
  position: sticky;
  top: 0;
  z-index: 20;
  background: $color-yellow;
}

.container {
  @include container();
  position: relative;
  display: flex;
  // flex-direction: row-reverse;
  align-items: center;
  height: 4rem;

  @media screen and (min-width: bp(m)) {
    flex-direction: row;
  }
}

.logo {
  position: relative;
  display: none;
  width: span(2);
  height: 100%;
  padding: 0.65rem 0;

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

.logo__img {
  display: block;
  height: 100%;
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

.userMenu {
  margin-left: auto;

  @media screen and (min-width: bp(s)) {
    width: span(3, 0, span(12));
    margin-left: span(0, 1);
  }
}

.user {
  display: flex;
  align-items: center;
  width: 100%;
  margin-left: auto;
  border-radius: 3px;

  &.active {
    background: rgba($color-purple, 0.1);
  }

  @media screen and (min-width: bp(s)) {
    margin-left: span(0, 1);
  }

  &:hover {
    .user__chevron {
      opacity: 1;
    }
  }
}

.user__icon {
  display: inline-block;
  width: 2rem;
  margin-right: 0.3em;
  font-size: 1.5rem;
}

.user__image {
  display: inline-block;
  width: 1.75rem;
  height: 1.75rem;
  margin-right: 0.75em;
  object-fit: cover;
  background: white;
  border-radius: 1rem;
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

.menu {
  position: absolute;
  top: 3.5rem;
  right: 0;
  z-index: 100;
  width: 100%;
  padding: 0.5rem;
  color: black;
  background: white;
  border-radius: 3px;
  box-shadow: 0 3px 4px rgba($color-grey-500, 0.5);

  @media screen and (min-width: bp(xs)) {
    width: span(4);
  }

  @media screen and (min-width: bp(s)) {
    width: span(3);
  }

  .btn {
    width: 100%;
  }
}

.menu__list {
  display: flex;
  flex-direction: column;
}

.menu__list-item {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.show-mobile {
  @media screen and (min-width: bp(m)) {
    display: none;
  }
}
</style>
