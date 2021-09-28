<template>
  <header class="header">
    <div class="container">
      <a
        href=""
        role="menuitem"
        class="header__navbutton"
        :class="{ 'is-open': sidebarOpen }"
        aria-expanded="false"
        data-th-aria-label="${portal.localize({'_key=aria.openMenu'})}"
        @click.prevent="sidebarOpen = !sidebarOpen"
      >
        <div class="header__navicon" role="presentation"><span></span> <span></span> <span></span> <span></span></div>
      </a>
      <div :class="{ overlay: sidebarOpen }"></div>
      <div class="section drawer" :class="{ 'is-open': sidebarOpen }">
        <sidebar-navigation></sidebar-navigation>
      </div>
      <router-link :to="{ name: 'Home' }" class="logo">
        <oslo-logo class="logo__img" />
      </router-link>
      <div v-if="title" class="title">
        <h1 class="title__name">
          {{ title }}
        </h1>
      </div>

      <div v-click-outside="hideUserMenu" class="userMenu" data-cy="usermenu">
        <button
          v-if="user"
          v-tooltip="showUserMenu ? '' : $t('tooltip.openMenu')"
          class="btn btn--ter btn--icon user"
          :class="{ active: showUserMenu }"
          @click="showUserMenu = !showUserMenu"
        >
          <i v-if="!user.photoURL" class="user__icon fa fa-user-circle" />
          <img v-if="user.photoURL" :src="user.photoURL" class="user__image" :alt="user.photoUrl" />
          <span class="user__name">{{ user.displayName }}</span>
          <i class="user__chevron fa fa-xs" :class="showUserMenu ? 'fa-chevron-up' : 'fa-chevron-down'" />
        </button>
        <nav v-if="user && showUserMenu" class="menu">
          <ul class="menu__list">
            <li class="menu__list-item">
              <router-link
                class="btn btn--ter btn--icon btn--icon-pri"
                :to="{ name: 'User', params: { id: user.id } }"
                data-cy="site-header-profile"
              >
                <i class="icon fa fa-fw fa-user" />
                {{ $t('user.myProfile') }}
              </router-link>
            </li>
            <li v-if="isAdmin" class="menu__list-item">
              <router-link
                class="btn btn--ter btn--icon btn--icon-pri"
                :to="{ name: 'Admin' }"
                data-cy="site-header-admin"
              >
                <i class="icon fa fa-fw fa-cogs" />
                {{ $t('general.admin') }}
              </router-link>
            </li>
            <theme-toggle header />
            <li class="menu__list-item show-mobile">
              <router-link
                class="btn btn--ter btn--icon btn--icon-pri"
                :to="{ name: 'Help' }"
                data-cy="site-header-help"
              >
                <i class="icon fa fa-fw fa-question-circle" />
                {{ $t('general.help') }}
              </router-link>
            </li>
            <li>
              <button class="btn btn--ter btn--icon btn--icon-pri" data-cy="site-header-signout" @click="signOut">
                <i class="icon fa fa-fw fa-sign-out-alt" />
                {{ $t('general.signOut') }}
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </header>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex';
import ClickOutside from 'vue-click-outside';
import { auth } from '@/config/firebaseConfig';
import OsloLogo from '@/components/OsloLogo.vue';
import ThemeToggle from '@/components/ThemeToggle.vue';
import SidebarNavigation from '@/components/Navigation/Sidebar.vue';

export default {
  name: 'SiteHeader',

  components: {
    OsloLogo,
    ThemeToggle,
    SidebarNavigation,
  },

  directives: {
    ClickOutside,
  },

  data: () => ({
    showUserMenu: false,
    sidebarOpen: false,
  }),

  metaInfo() {
    return {
      title: `OKR | ${this.title}`,
    };
  },

  computed: {
    ...mapState(['activeItem', 'user', 'providers', 'authenticated']),
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
          parts.includes('ItemAdminTeam') ||
          parts.includes('ItemAdminKPIs')) &&
        this.activeItem
      ) {
        return this.activeItem.name;
      }

      return 'OKR Tracker';
    },
  },

  watch: {
    $route() {
      this.hideUserMenu();
    },
  },

  methods: {
    ...mapActions(['reset_state', 'cleanKeycloak']),

    hideUserMenu() {
      this.showUserMenu = false;
    },

    async signOut() {
      if (this.providers.includes('keycloak')) {
        await this.cleanKeycloak(this.$route.path);
      }

      await auth.signOut();
      await this.reset_state();
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/styles/_colors.scss';

$header-height: 4em;

.header {
  position: sticky;
  top: 0;
  z-index: 20;
  color: var(--color-text-secondary);
  background: var(--color-primary);
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
    width: span(2);
    margin-left: span(1, 1);
  }

  @media screen and (min-width: bp(m)) {
    width: span(2);
  }

  @media screen and (min-width: bp(l)) {
    width: span(1);
  }

  @media screen and (min-width: bp(xl)) {
    width: span(3);
    margin-left: span(0);
  }
}

.logo__img {
  display: block;
  height: 100%;
}

.title {
  width: span(9);
  margin-left: span(4, 1);

  @media screen and (min-width: bp(s)) {
    width: span(6);
    margin-left: span(0, 1);
  }

  @media screen and (min-width: bp(m)) {
    width: span(6);
  }

  @media screen and (min-width: bp(l)) {
    width: span(6);
  }

  @media screen and (min-width: bp(xl)) {
    width: span(6);
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
  color: var(--color-text-secondary);
  font-weight: 500;
  white-space: nowrap;
  text-overflow: ellipsis;

  @media screen and (min-width: bp(s)) {
    display: block;
  }
}

.user__chevron {
  margin-left: auto;
  color: var(--color-text-secondary);
  opacity: 0.5;
}

.menu {
  position: absolute;
  top: 3.5rem;
  right: 0;
  z-index: 50;
  width: 100%;
  padding: 0.5rem;
  background: white;
  border-radius: 3px;
  box-shadow: 0 3px 4px rgba($color-grey-500, 0.5);

  @media screen and (min-width: bp(xs)) {
    width: span(5);
  }

  @media screen and (min-width: bp(s)) {
    width: span(4);
  }

  @media screen and (min-width: bp(m)) {
    width: span(3);
  }

  .btn {
    width: 100%;
  }
}

.user {
  display: relative;
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

.drawer {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 150;
  width: 90%;
  max-width: 400px;
  height: 100vh;
  padding: 3em;
  overflow-x: hidden;
  overflow-y: auto;
  background-color: var(--color-primary) !important;
  transform: translateX(-100vw);
  opacity: 0;
  transition: transform 0.3s ease-in-out, opacity 0s ease-in-out;

  &.is-open {
    transform: translate(0);
    opacity: 1;
    transition: transform 0.3s ease-in-out, opacity 0s ease-in-out;
  }
}

.header__navbutton {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 3;
  display: flex;
  width: $header-height;
  height: $header-height;
  margin: 0 !important;
  padding: 0 !important;
  font-size: 1rem;
  border: 0;
  cursor: pointer;

  &.is-open {
    z-index: 200;
    background-color: var(--color-primary);
    border-radius: 50%;
    transform: translateX(400px);
    transition: transform 0.3s ease-in-out, background-color 0.3s;
    span {
      &:nth-child(1),
      &:nth-child(4) {
        opacity: 0;
        transition: transform 0.2s ease-in-out 0s, opacity 0.2s ease-in-out 0s;
      }
      &:nth-child(2) {
        transform: translateY(1em) rotate(45deg);
        transition: transform 0.4s ease-in-out 0.4s, opacity 0.4s ease-in-out 0.4s;
      }
      &:nth-child(3) {
        transform: translateY(1em) rotate(-45deg);
        transition: transform 0.4s ease-in-out 0.4s, opacity 0.4s ease-in-out 0.4s;
      }
    }
  }
}

.header__navicon {
  position: relative;
  width: 100%;
  height: 100%;
  padding: 1em;

  $bar-height: 0.15em;
  $center: 1em - ($bar-height/2);
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
