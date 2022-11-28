<template>
  <div>
    <h4 class="user__title">{{ $t('user.position.groups.' + role) }}</h4>
    <ul class="users__list">
      <li v-for="member in membersWithRole" :key="member.id" class="user">
        <a @click="openProfileModal(member.id)">
          <span class="user__name">
            {{ member.displayName || firstPartOfEmail(member.id) }}
          </span>
        </a>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'RoleMembers',

  props: {
    role: {
      type: String,
      required: true,
    },
    membersWithRole: {
      type: Array,
      required: true,
    },
  },

  methods: {
    firstPartOfEmail(email) {
      return email.replace(/@.*/, '');
    },

    openProfileModal(profileId) {
      this.$emit('openModal', profileId);
    },
  },
};
</script>

<style lang="scss" scoped>
@use '@/styles/typography';

.users__list {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
}

.user {
  padding: 0.2rem;
  cursor: pointer;

  &:hover {
    background: rgba(var(--color-grey-500-rgb), 0.1);
  }
}

.user__title {
  padding: 0.2rem;
  color: var(--color-grey-300);
  font-weight: 400;
  font-size: typography.$font-size-2;
  letter-spacing: -0.03rem;
}
</style>
