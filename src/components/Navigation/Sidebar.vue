<template>
  <aside class="sidebar">
    <div v-for="group in sidebarGroups" :key="group.name" class="sidebar__group">
      <h4 v-if="group.items.length" class="label">{{ group.name }}</h4>
      <ul class="sidebar__list">
        <li v-for="item in group.items" :key="item.id" class="sidebar__listitem">
          <router-link
            :to="{ name: 'ItemHome', params: { slug: item.slug } }"
            class="sidebar__link"
            :class="{
              'router-link-active-parent':
                (activeItem && activeItem.department && activeItem.department.id === item.id) ||
                (activeItem && activeItem.organization && activeItem.organization.id === item.id),
            }"
          >
            <em :class="`sidebar__category-icon fas fa-fw fa-${group.icon}`"></em>
            {{ item.name }}
            <i
              v-if="item.team && item.team.map(({ id }) => id).includes(user.email)"
              class="sidebar__user-icon fas fa-user-circle"
            />
          </router-link>
        </li>
      </ul>
    </div>

    <div class="sidebar__group sidebar__bottom button-col">
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
  </aside>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import { auth } from '@/config/firebaseConfig';

export default {
  name: 'Sidebar',

  computed: {
    ...mapState(['activeItem', 'sidebarGroups', 'user']),
  },

  methods: {
    ...mapActions(['reset_state']),

    async signOut() {
      await auth.signOut();
      await this.reset_state();
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/styles/_colors.scss';

.sidebar {
  position: sticky;
  top: 7.5rem;
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 8rem);
  padding: 1.5rem 0;
}

.sidebar__group {
  margin-bottom: 1rem;
}

.sidebar__bottom {
  display: flex;
  flex-direction: column;
  margin-top: auto;
}

.label {
  padding: 0.25rem 0 0.3rem;
  color: rgba(black, 0.4);
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
  color: #2a2859;
  font-weight: 400;
  text-decoration: none;
  border-radius: 2px;
  -webkit-user-drag: none;

  &:hover {
    background: rgba($color-grey-500, 0.1);
  }

  &.router-link-active {
    font-weight: 500;
    background: $color-yellow;
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
</style>
