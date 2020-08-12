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
            <em :class="`fas fa-fw fa-${group.icon}`"></em>
            {{ item.name }}
          </router-link>
        </li>
      </ul>
    </div>

    <div class="sidebar__group">
      <button @click="signOut">Sign out</button>
    </div>
  </aside>
</template>

<script>
import { mapState } from 'vuex';
import { auth } from '@/config/firebaseConfig';

export default {
  computed: {
    ...mapState(['activeItem', 'sidebarGroups']),
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
  padding: 1.5rem 1rem;
}

.sidebar__group {
  margin-bottom: 1rem;
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
  padding: 0.35rem;
  color: #2a2859;
  font-weight: 400;
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
</style>
