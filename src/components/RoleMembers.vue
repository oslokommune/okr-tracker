<template>
  <div class="role-group">
    <h3 class="title-3">{{ $t('user.position.groups.' + role) }}</h3>
    <div class="role-group__members-list">
      <span v-for="member in membersWithRole" :key="member.id" class="role-group__member">
        <button
          class="pkt-btn pkt-btn--tertiary pkt-btn--small"
          @click="openProfileModal(member.id)"
        >
          {{ member.displayName || firstPartOfEmail(member.id) }}
        </button>
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
.title-3 {
  margin: 1rem 0 0.25rem;
  font-weight: 400;
  font-size: 18px;
}

.pkt-btn--small {
  font-size: 18px;
}
</style>
