<template>
  <header class="header" :class="{ dev }">
    <div class="container navbar">
      <router-link to="/" class="home-link">
        <img src="/okr-tracker-logo.svg" alt="OKR-tracker-logo" />
      </router-link>

      <nav class="right" v-if="user">
        <div
          class="usernav"
          :class="{ isOpen }"
          v-click-outside="closeMenu"
          v-tooltip.left="isOpen ? `Lukk meny` : `Åpne meny`"
        >
          <a class="usernav__name" @click="isOpen = !isOpen" @keydown.enter="isOpen = !isOpen" tabindex="0">
            <img class="usernav__photo" :src="user.photoURL || '/placeholder-user.svg'" :alt="displayName" />
            <span class="usernav__display-name">
              {{ displayName }}
            </span>
          </a>
          <div class="usernav__menu" v-if="isOpen" @click="isOpen = false">
            <router-link
              class="menu-item"
              v-if="user && user.admin"
              :to="{ name: 'admin-users' }"
              v-tooltip.left="`Gå til adminpanelet`"
            >
              <i class="fa fa-fw fa-tachometer-alt"></i>
              Admin</router-link
            >
            <router-link v-if="!isDashboardUser()" class="menu-item" :to="{ name: 'me' }"
              ><i class="fa fa-fw fa-user"></i>Endre profil</router-link
            >
            <span class="menu-item" @click="logout" @keydown.enter="logout" tabindex="0"
              ><i class="fa fa-fw fa-sign-out-alt"></i>Logg ut</span
            >
          </div>
        </div>
        <div class="newsfeed-toggle">
          <button
            class="btn btn--borderless"
            :class="{ showNewsfeed: showNewsfeed }"
            @click="set_show_newsfeed(!showNewsfeed)"
          >
            <i class="fa fa-stream"></i>
            <div class="newsfeed-toggle__label">
              Aktivitet
            </div>
          </button>
        </div>
      </nav>
    </div>
  </header>
</template>

<script>
import ClickOutside from 'vue-click-outside';
import { mapState, mapMutations } from 'vuex';
import { auth } from '@/config/firebaseConfig';
import { dashboardUserName } from '@/config/applicationConfig';
import { isDashboardUser } from '@/db/db';
import Audit from '@/db/audit';

export default {
  data: () => ({
    auth,
    dev: process.env.NODE_ENV === 'development',
    isOpen: false,
    isDashboardUser,
  }),

  directives: {
    ClickOutside,
  },

  computed: {
    ...mapState(['user', 'showNewsfeed']),

    displayName() {
      return this.user.displayName || dashboardUserName;
    },
  },

  methods: {
    ...mapMutations(['set_show_newsfeed']),
    closeMenu() {
      this.isOpen = false;
    },
    logout() {
      const { email } = this.user;
      Audit.signOut(email)
        .then(() => {
          auth.signOut();
          return true;
        })
        .then(() => {
          this.$router.push('/login');
        })
        .catch(err => {
          this.$errorHandler('logout_error', err);
        });
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../styles/_colors.scss';

.header {
  width: 100%;
  height: 5rem;
}

.usernav {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 3rem;

  &.isOpen &__name::after {
    transform: rotate(180deg);
  }

  &__display-name {
    display: none;
    @media screen and (min-width: 440px) {
      display: block;
    }
  }

  &__name {
    display: block;
    display: flex;
    align-items: center;
    padding: 1rem 2rem 1rem 1rem;
    border-radius: 1rem;
    cursor: pointer;
    user-select: none;

    &::after {
      position: absolute;
      top: calc(50% - 4px);
      right: 0.75rem;
      display: block;
      border-top: 7px solid $color-grey-300;
      border-right: 5px solid transparent;
      border-left: 5px solid transparent;
      content: '';
    }

    &:hover {
      background: $color-bg;
    }
  }

  &__photo {
    width: 2rem;
    height: 2rem;
    margin-right: 0;
    border-radius: 1rem;

    @media screen and (min-width: 440px) {
      margin-right: 1rem;
    }
  }

  &__menu {
    position: absolute;
    top: 3rem;
    left: 1rem;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    width: 12rem;
    background: white;
    border: 1px solid $color-bg;
    border-radius: 1rem;
    box-shadow: 0 2px 4px rgba($color-grey-400, 0.5);
  }

  .menu-item {
    width: 100%;
    margin: 0 !important;
    padding: 1rem 2rem 1rem 1rem !important;
    color: $color-link;
    color: $color-purple !important;
    font-weight: 500;
    border-top: 1px solid $color-grey-50;
    cursor: pointer;
    user-select: none;

    .fa {
      margin-right: 0.5rem;
      opacity: 0.8;
    }

    &:first-child {
      border-top: none;
      border-top-left-radius: 1rem;
      border-top-right-radius: 1rem;
    }

    &:last-child {
      background: $color-bg;
      border-top: 1px solid $color-grey-300;
      border-bottom-right-radius: 1rem;
      border-bottom-left-radius: 1rem;
      &:hover {
        background: darken($color-bg, 3%);
      }
    }
    &:hover {
      background: $color-bg;

      .fa {
        color: $color-purple;
        opacity: 1;
      }
    }
  }
}

.navbar {
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 100%;

  .home-link {
    display: inline-flex;
    align-items: center;
  }

  h2 {
    margin: 0;
  }

  .right {
    display: flex;
    align-items: center;
    margin-left: auto;
  }

  .menu-item {
    display: inline-block;
    margin: 0 0.25rem;
    padding: 0.55rem 0.75rem;
  }
}

.newsfeed-toggle {
  @media screen and (min-width: 540px) {
    margin-left: 1rem;
  }

  .fa {
    margin: 0;
    padding: 0;
    @media screen and (min-width: 540px) {
      padding-right: 0.5rem;
    }
  }

  &__label {
    display: none;
    @media screen and (min-width: 540px) {
      display: block;
    }
  }

  & > .btn {
    border-radius: 1rem;
  }

  & > .showNewsfeed {
    background: $color-bg;
    box-shadow: inset 0 0.1rem 0.15rem rgba(black, 0.25);
  }
}
</style>
