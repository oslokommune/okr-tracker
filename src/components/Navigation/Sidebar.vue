<template>
  <aside class="sidebar">
    <div v-for="group in sidebarGroups" class="sidebar__group" :key="group.name">
      <h4 class="label">{{ group.name }}</h4>
      <ul class="sidebar__list">
        <li v-for="item in group.items" :key="item.id" class="sidebar__listitem">
          <router-link
            :to="`/${item.slug}`"
            class="sidebar__link"
            :class="{
              'router-link-active-parent':
                (activeItem && activeItem.department && activeItem.department.id === item.id) ||
                (activeItem && activeItem.organization && activeItem.organization.id === item.id),
            }"
          >
            <em :class="`sidebar__category-icon fas fa-fw fa-${group.icon}`"></em>
            {{ item.name }}
            <span
              class="sidebar__user-icon fas fa-user-circle"
              v-if="item.team && item.team.map(({ id }) => id).includes(user.email)"
            ></span>
          </router-link>
        </li>
      </ul>
    </div>

    <div class="sidebar__group sidebar__bottom button-col">
      <router-link :to="{ name: 'admin' }" class="btn btn--ter btn--icon">
        <span class="icon fa fa-fw fa-cogs"></span>
        <span class="btn--label">Admin</span>
      </router-link>
      <router-link :to="{ name: 'help' }" class="btn btn--ter btn--icon">
        <span class="icon fa fa-fw fa-question-circle"></span>
        <span class="btn--label">Help</span>
      </router-link>
      <router-link :to="{ name: 'contact' }" class="btn btn--ter btn--icon">
        <span class="icon fa fa-fw fa-envelope"></span>
        <span class="btn--label">Contact</span>
      </router-link>
      <button @click="signOut" class="btn btn--ter btn--icon">
        <span class="icon fa fa-fw fa-sign-out-alt"></span>
        <span class="btn--label">Sign out</span>
      </button>
    </div>
  </aside>
</template>

<script>
import { mapState } from 'vuex';
import { auth } from '@/config/firebaseConfig';

export default {
  computed: {
    ...mapState(['activeItem', 'sidebarGroups', 'user']),
  },

  methods: {
    signOut() {
      auth.signOut().then(this.$router.push.bind(null, '/'));
    },
  },
};
</script>

<style lang="scss" scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 8rem);
  padding: 1.5rem 0;
}

.sidebar__bottom {
  display: flex;
  flex-direction: column;
  margin-top: auto;
}

.label {
  padding: 0.25rem 0 0.3rem;
  padding-left: 1.7rem;
  color: rgba(black, 0.4);
  font-weight: 500;
  font-size: 12px;
  letter-spacing: 0.4px;
  text-transform: uppercase;
}

.sidebar__listitem {
  font-size: 14px;
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

  &.router-link-active {
    font-weight: 500;
    background: #f9c66b;
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
  margin-right: 0.35rem;
}
</style>
