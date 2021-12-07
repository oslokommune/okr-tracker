<template>
  <div>
    <a
      href="#"
      role="menuitem"
      class="header__nav-button"
      :class="{ 'is-open': isOpen, 'sideSideBar': isSideSideBar }"
      @click.stop="hideSidebar"
    >
      <div class="header__nav-icon" role="presentation">
        <span class="sidebar__button"></span> <span class="sidebar__button"></span>
        <span class="sidebar__button"></span> <span class="sidebar__button"></span>
      </div>
    </a>

    <transition name="slide-first">
      <aside v-if="isOpen" class="sidebar">
        <button
          v-if="user"
          class="btn btn--ter btn--icon btn--sidebar"
          style="display: flex; justify-content: space-between; text-transform: uppercase"
          @click="activeSideSidebar"
        >
          {{ hostOrg }}
          <i class="icon fa" :class="isSideSideBar ? 'fa-chevron-left' : 'fa-chevron-right'"></i>
        </button>
        <div v-if="!user" class="sidebar__sign-in">{{ $t('general.signIn')}}</div>
        <template v-if="user">
          <ul v-if="activeOrganization" class="sidebar__group">
            <li v-for="org in tree" :key="org.id" class="margin-top-1">
              <template v-if="org.id === activeOrganization.id">
                <router-link class='btn btn--ter sidebar__item' :class="{ 'active': org.slug === $route.params.slug }" :to="{name: 'ItemHome', params: { slug: org.slug } }">
                  <h2>{{ org.name }}</h2>
                </router-link>
                <ul>
                  <li v-for="dept in org.children" :key="dept.id" class="margin-top-1">
                    <router-link class='btn btn--ter sidebar__item' :class="{ 'active': dept.slug === $route.params.slug }" :to="{name: 'ItemHome', params: { slug: dept.slug } }">
                      <h3>{{ dept.name }}</h3>
                    </router-link>
                    <ul>
                      <li v-for="prod in dept.children" :key="prod.id" class="card--prod">
                        <router-link class="btn btn--ter sidebar__item sidebar__item--product" :class="{ 'active': prod.slug === $route.params.slug }" style="font-size: 1rem;" :to="{name: 'ItemHome', params: { slug: prod.slug } }">
                          <h3>{{ prod.name }}</h3>
                        </router-link>
                      </li>
                    </ul>
                  </li>
                </ul>
              </template>
            </li>
          </ul>
        </template>
      </aside>
    </transition>

    <transition name="slide-second">
      <div v-if="isSideSideBar" class="sidebar__extra">
        <div class="sidebar__extra--content">
          <router-link :to="{ name: 'Home' }" class="btn btn--ter btn--icon btn--sidebar">
            <h1>{{ $t('general.homePage') }}</h1>
          </router-link>
          <button
            v-for="org in organizations"
            :key="org.id"
            class="btn btn--ter btn--icon sidebar__item margin-top-1"
            @click="handleActiveOrganization(org)"
          >
            {{ org.name }}
          </button>
        </div>
      </div>
    </transition>

  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex';

export default {
  name: 'SiteSidebar',

  data: () => ({
    isOpen: false,
    isSideSideBar: false,
  }),

  computed: {
    ...mapState(['activeItem', 'user', 'activeOrganization', 'organizations']),
    ...mapGetters(['sidebarGroups', 'tree']),

    hostOrg() {
      return import.meta.env.VITE_ORGANIZATION;
    }
  },

  watch: {
    '$route': {
      handler() {
        this.isOpen = false;
        this.isSideSideBar = false;
      },
    },

    tree: {
      immediate: true,
      handler() {
        if (!this.activeOrganization) {
          for (const org of this.tree) {
            if (!!org.team && org.team.find(({ id }) => id === this.user.id)) {
              this.setActiveOrganization(org);
              break;
            }
            for (const dep of org.children) {
              if (!!dep.team && dep.team.find(({ id }) => id === this.user.id)) {
                this.setActiveOrganization(dep.organization);
                break;
              }
              for (const prod of dep.children) {
                if (!!prod.team && prod.team.find(({ id }) => id === this.user.id)) {
                  this.setActiveOrganization(prod.organization);
                  break;
                }
              }
            }
          }
        }
      }
    }
  },

  methods: {
    ...mapActions(['setActiveOrganization']),

    activeSideSidebar() {
      this.isSideSideBar = !this.isSideSideBar;
    },

    async handleActiveOrganization(org) {
      await this.setActiveOrganization(org);
    },

    hideSidebar() {
      this.isOpen = !this.isOpen;
      this.isSideSideBar = false;
    },
  },
};
</script>

<style lang="scss" scoped>
@use 'sass:math';

$header-height: 4em;

.margin-top-1 {
  margin-top: 1rem;
}

.sidebar__item {
  width: 100%;
  padding: 0.5rem 1.5rem;
  color: var(--color-secondary-light);
  font-weight: 500;
  font-size: 1.25rem;
  border-radius: 0;

  &:hover {
    color: var(--color-text);
    background-color: var(--color-secondary);
  }

  &.active {
    color: var(--color-secondary);
  }
}

.sidebar__item--product {
  color: var(--color-text-secondary);
  font-weight: normal;
  font-size: 1rem;
}

.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 200;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 400px;
  height: 99%;
  min-height: 100vh;
  padding-top: 5.5rem;
  scrollbar-width: none;  /* Hide scrollbar styles Firefox */
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  background-color: var(--color-primary) !important;
  border-right: 1px solid #ffffff0f;
  box-shadow: 6px -1px 10px rgba(0, 0, 0, 0.1);

  &::-webkit-scrollbar {
    display: none;
  }
}

.slide-first-enter-active,
.slide-first-leave-active {
  transition: left 0.25s ease-in-out;
}

.slide-first-enter,
.slide-first-leave-to {
  left: -400px;
}

.sidebar__group {
  margin-bottom: 1rem;
}

.sidebar__sign-in {
  padding: 1.5rem;
  font-weight: 500;
  font-size: 1.5rem;
}

.btn--sidebar {
  padding: 1.5rem;
  color: var(--color-secondary-light);
  font-weight: 500;
  font-size: 1.5rem;
  border-radius: 0;

  &:hover {
    color: var(--color-text);
    background: var(--color-secondary);

    & > .fa-chevron-right {
      margin-right: 0;
      transition: margin-right 0.1s ease-in-out 0.1s;
    }

    & > .fa-chevron-left {
      margin-right: 2rem;
      transition: margin-right 0.1s ease-in-out 0.1s;
    }
  }

  & > .fa-chevron-right {
    margin-right: 2rem;
    transition: margin-right 0.1s ease-in-out 0.1s;
  }

  & > .fa-chevron-left {
    margin-right: 0;
    transition: margin-right 0.1s ease-in-out 0.1s;
  }
}

.sidebar__extra {
  position: fixed;
  top: 0;
  left: 400px;
  z-index: 190;
  width: 90%;
  max-width: 400px;
  height: 100%;
  overflow-y: auto;
  scrollbar-width: none;  /* Hide scrollbar styles Firefox */
  background-color: var(--color-primary) !important;
  box-shadow: 6px -1px 12px 3px rgb(0 0 0 / 30%);

  &::-webkit-scrollbar {
    display: none;
  }
}

.slide-second-enter-active,
.slide-second-leave-active {
  transition: left 0.25s ease-in-out;
}

.slide-second-enter,
.slide-second-leave-to {
  left: -400px;
}

.sidebar__extra--content {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100%;
  padding-top: 5.5rem;
}

.header__nav-button {
  position: absolute;
  top: 0;
  left: 0;
  width: $header-height;
  height: $header-height;
  background-color: var(--color-primary);
  border-radius: 50%;
  cursor: pointer;

  &.is-open {
    z-index: 250;
    box-shadow: 0px 0px 10px 1px rgb(0 0 0 / 30%);
    transform: translateX(400px);
    transition: transform 0.25s ease-in-out, background-color 0.3s, box-shadow 0.3s;

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

  &.sideSideBar {
    transform: translateX(800px);
    transition: transform 0.25s ease-in-out;
  }
}

.header__nav-icon {
  position: relative;
  width: 100%;
  max-width: 400px;
  height: 100%;
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
