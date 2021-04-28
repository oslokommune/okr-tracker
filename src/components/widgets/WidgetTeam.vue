<template>
  <widget v-if="activeItem.team" :widget-id="widgetId" :title="$t('general.team')" icon="users">
    <empty-state
      v-if="!activeItem.team.length"
      :icon="'user-ninja'"
      :heading="$t('empty.team.heading')"
      :body="$t('empty.team.body')"
    />

    <ul class="users__list">
      <li v-for="user in activeItem.team" :key="user.id" class="user">
        <router-link v-if="user.id" :to="{ name: 'User', params: { id: user.id } }" class="user__link">
          <span class="user__name">{{ user.displayName || user.id }}</span>
        </router-link>
      </li>
    </ul>
    <router-link v-if="memberOrAdmin" :to="{ name: 'ItemAdmin' }" class="btn btn--fw btn--ter">
      {{ $t('btn.add') }}
    </router-link>
  </widget>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'WidgetTeam',

  components: {
    Widget: () => import('./Widget.vue'),
    EmptyState: () => import('@/components/EmptyState.vue'),
  },

  props: {
    widgetId: {
      type: String,
      required: true,
    },
  },

  computed: {
    ...mapState(['activeItem', 'user']),

    memberOrAdmin() {
      try {
        const isAdmin = this.user.admin;
        const isMember = this.activeItem.team.map(({ id }) => id).includes(this.user.id);
        return isAdmin || isMember;
      } catch {
        return false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.users__list {
  display: flex;
  flex-direction: column;
}

.user__link {
  display: flex;
  align-items: center;
  color: var(--color-text);
  text-decoration: none;
}

.user {
  padding-bottom: 0.2rem;
}
</style>
