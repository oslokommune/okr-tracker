<template>
  <header class="header" :class="{ dev }">
    <div class="container navbar">
      <h2 class="title-3">
        <router-link to="/">
          OKR-tracker
          <span v-if="dev">(DEV)</span>
        </router-link>
      </h2>
      <nav class="right" v-if="user">
        <div class="usernav" :class="{ isOpen }">
          <a class="usernav__name" @click="isOpen = !isOpen">
            <img class="usernav__photo" :src="user.photoURL || '/placeholder-user.svg'" :alt="displayName" />
            {{ displayName }}
          </a>
          <div class="usernav__menu" v-if="isOpen" @click="isOpen = false">
            <router-link class="menu-item" v-if="user && user.admin" :to="{ name: 'admin-users' }">Admin</router-link>
            <router-link v-if="!isDashboardUser()" class="menu-item" :to="{ name: 'profile' }"
              >Endre profil</router-link
            >
            <span class="menu-item" @click="logout">Logg ut</span>
          </div>
        </div>

        <!-- <router-link class="menu-item" v-if="user" :to="{ name: 'profile' }">{{ user.displayName }}</router-link> -->
        <!--  -->
      </nav>
    </div>
  </header>
</template>

<script>
import { mapState } from 'vuex';
import { auth } from '@/config/firebaseConfig';
import { dashboardUserName } from '@/config/applicationConfig';
import { isDashboardUser } from '@/util/db';

export default {
  data: () => ({
    auth,
    dev: process.env.NODE_ENV === 'development',
    isOpen: false,
    isDashboardUser,
  }),

  computed: {
    ...mapState(['user']),

    displayName() {
      return this.user.displayName || dashboardUserName;
    },
  },

  methods: {
    logout() {
      auth.signOut().then(() => {
        this.$router.push('/login');
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

  &.dev {
    // background: #eeeeee;
  }
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
    margin-right: 1rem;
    border-radius: 1rem;
  }

  &__menu {
    position: absolute;
    top: 3rem;
    right: 0;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    min-width: 100%;
    overflow: hidden;
    background: white;
    border: 1px solid $color-bg;
    border-radius: 1rem;
    box-shadow: 0 2px 4px rgba($color-grey-400, 0.5);
  }

  .menu-item {
    width: 100%;
    margin: 0 !important;
    padding: 1rem 2rem !important;
    color: $color-link;
    font-weight: 500;
    text-align: right;
    border-bottom: 1px solid $color-grey-50;
    cursor: pointer;
    user-select: none;

    &:last-child {
      border-bottom: none;
    }
    &:hover {
      background: $color-bg;
    }
  }
}

.navbar {
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 100%;

  h2 {
    margin: 0;
  }

  .right {
    margin-left: auto;
  }

  .menu-item {
    display: inline-block;
    margin: 0 0.25rem;
    padding: 0.55rem 0.75rem;
  }
}
</style>
