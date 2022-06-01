<template>
  <div class="sidebar">
    <div class="flex__column">
      <h1 class="sidebar__header title-1">{{ $t('general.appName') }}</h1>
      <router-link :to="{ name: 'Home' }" class="btn btn--ter btn--sidebar sidebar__itemgit " :class="{ active: $route.name === 'Home' }">
        <h1>{{ $t('general.frontPage') }}</h1>
      </router-link>

      <hr class="divider" />

      <h2 class="btn btn--ter sidebar__item sidebar__item--organizations" @click="isCollapsed = !isCollapsed">
        {{ $t('general.orgs') }}
        <i class="fa" :class="isCollapsed ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
      </h2>
      <div v-if="isCollapsed">
        <button
          v-for="org in organizations"
          :key="org.id"
          class="btn btn--ter sidebar__item sidebar__item--org"
          :class="{ active: activeOrganization && activeOrganization.id === org.id }"
          @click="handleActiveOrganization(org)"
        >
          {{ org.name }}
        </button>
      </div>

      <hr class="divider" />

      <div v-if="!user" class="sidebar__header">{{ $t('general.signIn') }}</div>
      <template v-if="user">
        <ul v-if="activeOrganization" class="sidebar__group">
          <li v-for="org in tree" :key="org.id" class="margin-top-1">
            <template v-if="org.id === activeOrganization.id">
              <router-link
                :class="{ active: org.slug === $route.params.slug }"
                :to="{ name: 'ItemHome', params: { slug: org.slug } }"
                class="btn btn--ter sidebar__item"
                @click.native="handleNavigation"
              >
                <h2>{{ org.name }}</h2>
              </router-link>
              <ul>
                <li v-for="dept in org.children" :key="dept.id" class="margin-top-1">
                  <router-link
                    :class="{ active: dept.slug === $route.params.slug }"
                    :to="{ name: 'ItemHome', params: { slug: dept.slug } }"
                    class="btn btn--ter sidebar__item"
                    @click.native="handleNavigation"
                  >
                    <h3>{{ dept.name }}</h3>
                  </router-link>
                  <ul>
                    <li v-for="prod in dept.children" :key="prod.id" class="card--prod">
                      <router-link
                        :class="{ active: prod.slug === $route.params.slug }"
                        :to="{ name: 'ItemHome', params: { slug: prod.slug } }"
                        class="btn btn--ter sidebar__item sidebar__item--product"
                        @click.native="handleNavigation"
                      >
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
    </div>
    <div class="flex__row--space-between">
      <div class="logo">
        <oslo-logo class="logo__img" />
      </div>
      <div class="align__self--center">v{{ appVersion }}</div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex';
import OsloLogo from '@/components/OsloLogo.vue';

export default {
  name: 'SiteSidebar',

  components: {
    OsloLogo,
  },

  props: {
    handleNavigation: {
      type: Function,
      required: true,
    },
  },

  data: () => ({
    isCollapsed: false,
    appVersion: __APP_VERSION__, // eslint-disable-line no-undef
  }),

  computed: {
    ...mapState(['activeItem', 'user', 'activeOrganization', 'organizations']),
    ...mapGetters(['sidebarGroups', 'tree']),

    hostOrg() {
      return import.meta.env.VITE_ORGANIZATION;
    },
  },

  watch: {
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
      },
    },
  },

  methods: {
    ...mapActions(['setActiveOrganization']),

    async handleActiveOrganization(org) {
      await this.setActiveOrganization(org);
    },
  },
};
</script>

<style lang="scss" scoped>
@use 'sass:math';
@use '@/styles/typography';

$header-height: 4em;

.margin-top-1 {
  margin-top: 1rem;
}

.sidebar__item {
  width: 100%;
  padding: 0.5rem 1.5rem;
  color: var(--color-text-secondary);
  font-weight: 400;
  font-size: typography.$font-size-4;
  white-space: unset;
  border-radius: 0;

  &:hover {
    color: var(--color-text);
    background-color: var(--color-secondary)!important;
  }

  &.active {
    color: var(--color-secondary);

    &:hover {
      color: var(--color-text);
    }
  }
}

.sidebar__item--organizations {
  display: flex;
  justify-content: space-between;
  font-weight: 500;
  font-size: typography.$font-size-4;
  text-transform: uppercase;
}

.sidebar__item--org {
  font-weight: 400;
  font-size: typography.$font-size-4;
  text-align: start;
}

.sidebar__item--product {
  color: var(--color-text-secondary);
  font-weight: normal;
  font-size: typography.$font-size-2;
}

.sidebar__group {
  margin-bottom: 1rem;
}

.btn--sidebar {
  padding: 1rem 0 1rem 1.5rem;
  color: var(--color-text-secondary);
  font-weight: 400;
  font-size: typography.$font-size-4;

  &:hover {
    color: var(--color-text);
    background: var(--color-secondary);
  }

  &.active {
    color: var(--color-secondary);

    &:hover {
      color: var(--color-text);
    }
  }
}

.divider {
  margin: 1.5rem;
  border: 0;
  border-top: 1px solid #f7f7f74f;
}

.logo__img {
  display: block;
  width: 100%;
  height: 100%;
}

.logo {
  display: block;
  width: span(4);
  padding: 5rem 1.5rem;
}

.flex__column {
  display: flex;
  flex-direction: column;
}

.flex__row--space-between {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.align__self--center {
  align-self: center;
  justify-self: center;
  padding-right: 1.5rem;
  color: var(--color-white);
}

.sidebar__header {
  padding-left: 1.5rem;
  color: white;
  font-weight: 500;
  font-size: typography.$font-size-4;
  text-transform: uppercase;
}
</style>
