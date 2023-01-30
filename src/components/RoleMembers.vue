<template>
  <div class="role-group">
    <h4 class="role-group__title">{{ $t('user.position.groups.' + role) }}</h4>
    <div class="role-group__members-list">
      <span v-for="member in membersWithRole" :key="member.id" class="role-group__member">
        <a @click="openProfileModal(member.id)">{{
          member.displayName || firstPartOfEmail(member.id)
        }}</a>
      </span>
    </div>
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

.role-group {
  margin-bottom: 1.5rem;

  &__title {
    margin-bottom: 0.5rem;
    color: var(--color-grayscale-30);
    font-weight: 400;
    font-size: typography.$font-size-2;
    letter-spacing: -0.03rem;
  }

  &__members-list {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  &__member {
    &:not(:last-child)::after {
      content: ', ';
    }

    > a {
      color: var(--color-text);
      cursor: pointer;

      &:hover {
        background: rgba(var(--color-grayscale-50-rgb), 0.1);
      }
    }
  }
}
</style>
