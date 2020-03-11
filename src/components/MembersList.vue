<template>
  <div>
    <h2 v-if="type === 'organization'" class="title title-2">{{$t('membersList.title.organization')}}</h2>
    <h2 v-if="type === 'department'" class="title title-2">{{$t('membersList.title.department')}}</h2>
    <h2 v-if="type === 'product'" class="title title-2">{{$t('membersList.title.product')}}</h2>

    <!-- Empty list -->
    <div v-if="!team.length">
      <ul class="team__list team__list--empty">
        <div class="team__member empty">
          <i v-if="type === 'organization'" class="fa fa-users"></i>
          <i v-if="type === 'department'" class="fa fa-cubes"></i>
          <i v-if="type === 'product'" class="fa fa-user-ninja"></i>
        </div>
      </ul>
      <p v-if="type === 'organization'">{{$t('membersList.empty.organization')}}</p>
      <p v-if="type === 'department'">{{$t('membersList.empty.department')}}</p>
      <p v-if="type === 'product'">{{$t('membersList.empty.product')}}</p>
    </div>

    <ul class="team__list">
      <li class="team__item" v-for="user in team" :key="user.id">
        <router-link :to="getRouterLink(user)" class="team__member">
          <img class="team__image" :src="user.photoURL || '/placeholder-image.svg'" :alt="getDisplayName(user)" />
          <span class="team__membername">{{ getDisplayName(user) }}</span>
        </router-link>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'MembersList',

  props: {
    type: {
      type: String,
      required: true,
    },
    team: {
      type: Array,
      required: false,
      default: () => [],
    },
  },

  methods: {
    getRouterLink(obj) {
      const name = this.getRouteName();
      return { name, params: { slug: obj.slug } };
    },
    getRouteName() {
      const { type } = this;
      if (type === 'department') return 'product';
      if (type === 'product') return 'profile';
      if (type === 'organization') return 'department';
    },
    getDisplayName(obj) {
      return obj.displayName || obj.name || obj.id;
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../styles/colors';

.empty {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  padding: 0.25rem;
  color: $color-grey-500;
  font-size: 1.5rem;
  background: $color-grey-100;
  border-radius: 2rem;
}

.team {
  &__list {
    display: flex;
    flex-direction: column;
    align-items: flex-start;

    &--empty {
      margin: 1rem 0;
    }
  }

  &__member {
    position: relative;
    display: flex;
    align-items: center;
    margin: 0.15rem 0;
    color: inherit;
    font-weight: inherit;
    text-align: center;

    &:hover {
      text-decoration: underline;
    }
  }

  &__image {
    width: 1.75rem;
    height: 1.75rem;
    margin-right: 0.35rem;
    border-radius: 1rem;
  }
}
</style>
