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
          <img :src="user.photoURL || '/placeholder-image.svg'" :aria-hidden="true" class="user__image" />
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
@import '@/styles/_colors.scss';

.users__list {
  display: flex;
  flex-direction: column;
  margin-right: -1rem;
  margin-bottom: 1rem;
  margin-left: -1rem;
  border-bottom: 1px solid $color-grey-100;
}

.user__link {
  display: flex;
  align-items: center;
  color: var(--color-text);
  text-decoration: none;
}

.user__image {
  width: 1.75rem;
  height: 1.75rem;
  margin-right: 0.35rem;
  border-radius: 1rem;
}

.user {
  padding: 0.5rem 1rem;
  border-top: 1px solid $color-grey-100;
}
</style>
