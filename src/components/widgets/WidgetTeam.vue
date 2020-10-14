<template>
  <Widget :widget-id="widgetId" v-if="activeItem.team" title="Team" icon="users">
    <ul class="users__list">
      <li v-for="user in activeItem.team" :key="user.id" class="user">
        <router-link :to="{ name: 'User', params: { id: user.id } }" class="user__link">
          <img src="" aria-hidden class="user__image" />
          <span class="user__name">{{ user.displayName || user.id }}</span>
        </router-link>
      </li>
    </ul>
    <router-link :to="{ name: 'ItemAdmin' }" class="btn btn--fw btn--ter" v-if="memberOrAdmin">+ Legg til</router-link>
  </Widget>
</template>

<script>
import { mapState } from 'vuex';

export default {
  computed: {
    ...mapState(['activeItem', 'user']),
    memberOrAdmin() {
      const isAdmin = this.user.admin;
      const isMember = this.activeItem.team.map(({ id }) => id).includes(this.user.id);
      return isAdmin || isMember;
    },
  },

  props: {
    widgetId: {
      type: String,
      required: true,
    },
  },

  components: {
    Widget: () => import('./Widget.vue'),
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
  display: block;
  color: $color-purple;
  text-decoration: none;
}

.user {
  padding: 0.5rem 1rem;
  border-top: 1px solid $color-grey-100;
}
</style>
