<template>
  <div class="overlay--sidebar">
    <aside class="sidebar" :class="{ 'is-open': isOpen }">
      <button
        v-if="user"
        class="btn btn--ter btn--icon btn--sidebar"
        style="display: flex; justify-content: space-between; text-transform: uppercase"
        @click="activeSideSidebar"
      >
        {{ hostOrg }}
        <i class="icon fa" :class="isSideSideBar ? 'fa-chevron-left' : 'fa-chevron-right'"></i>
      </button>
      <div v-if="!user" class="sidebar__sign-in">Please sign in</div>
      <template v-if="user">
        <ul v-if="activeOrganization" class="sidebar__group">
          <li v-for="org in tree" :key="org.id" style="margin-top: 1rem;">
            <template v-if="org.id === activeOrganization.id">
              <h2 class="btn btn--ter sidebar__item">{{ org.name }}</h2>
              <ul>
                <li v-for="dept in org.children" :key="dept.id" style="margin-top: 1rem;">
                  <router-link class='btn btn--ter sidebar__item' :to="{name: 'ItemHome', params: { slug: dept.slug } }">
                    <h3>{{ dept.name }}</h3>
                  </router-link>
                  <ul>
                    <li v-for="prod in dept.children" :key="prod.id" class="card--prod">
                      <router-link class="btn btn--ter sidebar__item" style="font-size: 1rem;" :to="{name: 'ItemHome', params: { slug: prod.slug } }">
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

    <div class="sidebar__extra" :class="{ 'is-open': isSideSideBar }">
      <div class="sidebar__extra--content">
        <h1 class="btn btn--ter btn--icon btn--sidebar">{{ $t('general.homePage') }}</h1>

        <button
          v-for="org in organizations"
          :key="org.id"
          class="btn btn--ter btn--icon org"
          @click="handleActiveOrganization(org)"
        >
          {{ org.name }}
        </button>
      </div>
    </div>

  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex';

export default {
  name: 'SiteSidebar',

  props: {
    isOpen: {
      type: Boolean,
      required: true,
    },
  },

  data: () => ({
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
    isOpen: {
      immediate: true,
      handler() {
        if (!this.isOpen) {
          this.isSideSideBar = this.isOpen;
        }
      },
    },
  },

  methods: {
    ...mapActions(['setActiveOrganization']),

    activeSideSidebar() {
      this.isSideSideBar = !this.isSideSideBar;
    },

    async handleActiveOrganization(org) {
      await this.setActiveOrganization(org);
      this.isSideSideBar = !this.isSideSideBar;
    },
  },
};
</script>

<style lang="scss" scoped>
.sidebar__item {
  width: 100%;
  padding: 0.5rem 1.5rem;
  color: var(--color-text-secondary);
  font-weight: 500;
  font-size: 1.25rem;
  border-radius: 0;

  &:hover {
    color: var(--color-text);
    background-color: var(--color-secondary);
  }
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
  min-height: 100vh;
  padding-top: 5.5rem;
  background-color: var(--color-primary) !important;
  border-right: 1px solid #ffffff0f;
  box-shadow: 6px -1px 10px rgba(0, 0, 0, 0.1);
  transform: translateX(-100vw);

  opacity: 0;
  transition: transform 0.3s ease-in-out, opacity 0s ease-in-out;

  &.is-open {
    transform: translate(0);
    opacity: 1;
    transition: transform 0.3s ease-in-out, opacity 0s ease-in-out;
  }
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
  left: 0;
  z-index: 190;
  width: 90%;
  max-width: 400px;
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  background-color: var(--color-primary) !important;
  transform: translateX(-100vw);
  opacity: 0;
  transition: transform 0.3s ease-in-out, opacity 0s ease-in-out;

  &.is-open {
    transform: translate(400px);
    opacity: 1;
    transition: transform 0.3s ease-in-out, opacity 0s ease-in-out;
  }
}

.sidebar__extra--content {
  position: fixed;
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100%;
  padding-top: 5.5rem;
}
</style>
