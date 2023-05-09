<template>
  <div class="role-group">
    <h4 class="role-group__title">{{ $t('user.position.groups.' + role) }}</h4>
    <div class="role-group__members-list">
      <span
        v-for="(member, index) in membersWithRole"
        :key="member.id"
        class="role-group__member"
      >
        <a href="#" @click="openProfileModal(member.id)">{{
          member.displayName || firstPartOfEmail(member.id)
        }}</a>
        <template v-if="index < membersWithRole.length - 1">, </template>
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
    margin-bottom: 0.25rem;
    color: var(--color-grayscale-30);
  }
}
</style>
