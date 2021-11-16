<template>
  <aside class="sidebar">
    <button
      class="btn btn--ter btn--icon btn--sidebar"
      style="display: flex; justify-content: space-between; text-transform: uppercase"
      @click="activeSideSidebar"
    >
      Oslo kommune
      <i class="icon fa" :class="extra ? 'fa-chevron-left' : 'fa-chevron-right'"></i>
    </button>
    <div v-if="!user">Please sign in</div>
    <template v-if="user">
      <ul v-if="activeOrganization" class="sidebar__group">
        <li v-for="org in tree" :key="org.id" class="tree">
          <template v-if="org.id === activeOrganization.id">
            <h2>{{ org.name }}</h2>
            <ul>
              <li v-for="dept in org.children" :key="dept.id" class="card">
                <h3>{{ dept.name }}</h3>
                <ul>
                  <li v-for="prod in dept.children" :key="prod.id">
                    <h3>{{ prod.name }}</h3>
                  </li>
                </ul>
              </li>
            </ul>
          </template>
        </li>
      </ul>

      <div class="sidebar__group sidebar__bottom button-col">
        <theme-toggle />
        <router-link v-if="user.admin" :to="{ name: 'Admin' }" class="btn btn--ter btn--icon">
          <i class="icon fa fa-fw fa-cogs" />
          <span class="btn--label">{{ $t('general.admin') }}</span>
        </router-link>
        <router-link :to="{ name: 'Help' }" class="btn btn--ter btn--icon">
          <i class="icon fa fa-fw fa-question-circle" />
          <span class="btn--label">{{ $t('general.help') }}</span>
        </router-link>
        <button class="btn btn--ter btn--icon" @click="signOut">
          <i class="icon fa fa-fw fa-sign-out-alt" />
          <span class="btn--label">{{ $t('general.signOut') }}</span>
        </button>
      </div>
    </template>
  </aside>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex';
import { auth } from '@/config/firebaseConfig';
import ThemeToggle from '@/components/ThemeToggle.vue';

export default {
  name: 'Sidebar',

  components: {
    ThemeToggle,
    ItemRow: () => import('@/components/ItemRow.vue'),
  },

  props: {
    extra: {
      type: Boolean,
      required: true,
    },
  },

  data: () => ({
    isSideSideBar: false,
  }),

  computed: {
    ...mapState(['activeItem', 'user', 'activeOrganization']),
    ...mapGetters(['sidebarGroups', 'tree']),
  },

  mounted() {
    console.log(this.newSidebarGroups);
  },

  methods: {
    ...mapActions(['reset_state']),

    async signOut() {
      await auth.signOut();
      await this.reset_state();
    },

    activeSideSidebar() {
      this.$emit('extra-sidebar');
    },
  },
};
</script>

<style lang="scss" scoped>
.sidebar {
  position: sticky;
  top: 5.5rem;
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 8rem);
}

.sidebar__group {
  margin-bottom: 1rem;
}

.sidebar__bottom {
  display: flex;
  flex-direction: column;
  margin-top: auto;
}

.sidebar__label {
  padding: 0.25rem 0 0.3rem;
  color: var(--color-text-secondary);
  font-weight: 500;
  font-size: 12px;
  letter-spacing: 0.4px;
  text-transform: uppercase;
}

.sidebar__list {
  margin-bottom: 0.5rem;
}

.sidebar__link {
  display: block;
  display: flex;
  align-items: center;
  padding: 0.35rem;
  color: var(--color-text-secondary);
  font-weight: 400;
  text-decoration: none;
  border-radius: 2px;
  -webkit-user-drag: none;

  &:hover {
    color: var(--color-text);
    background: var(--color-secondary);
  }

  &.router-link-active {
    color: var(--color-text);
    font-weight: 500;
    background: var(--color-secondary);
  }

  &.router-link-active-parent {
    font-weight: 500;
  }
}

.sidebar__user-icon {
  display: inline-block;
  margin-left: auto;
  font-size: 0.85em;
}

.sidebar__category-icon {
  flex-shrink: 0;
  align-self: flex-start;
  margin-top: 0.15rem;
  margin-right: 0.35rem;
}

.btn--label {
  color: var(--color-text-secondary);
}

.btn--sidebar {
  &:hover {
    color: var(--color-text);
    background: var(--color-secondary);

    & > .icon {
      margin-right: 2rem;
      transition: margin-right 0.1s ease-in-out 0.1s;
    }
  }

  & > .icon {
    margin-right: 0;
    transition: margin-right 0.1s ease-in-out 0.1s;
  }
}
</style>
